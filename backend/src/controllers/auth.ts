import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, InternalServerError, NotFoundError } from '../utils/errors';
import { config } from '../config';

// Validation Schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Constants for replacement of Enums
const UserTier = { FREE: 'FREE', PROMO: 'PROMO', PREMIUM: 'PREMIUM' };
const CreditTransactionType = { EARN: 'EARN', SPEND: 'SPEND', ADJUSTMENT: 'ADJUSTMENT' };
const CreditTransactionSource = { SIGNUP_BONUS: 'SIGNUP_BONUS', SOCIAL_SHARE: 'SOCIAL_SHARE' };

// Helper to generate a simple referral code
const generateReferralCode = (name: string) => {
  const timestamp = Date.now().toString(36);
  const namePart = name.replace(/\s/g, '').substring(0, 5).toUpperCase();
  return `${namePart}${timestamp}`.slice(0, 10);
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name, referralCode: referredByCode } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email and password are required.'));
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new BadRequestError('An account could not be created with the provided details.'));
    }

    const passwordHash = await hashPassword(password);

    let userTier = UserTier.FREE;
    let promoExpiresAt: Date | null = null;
    let referredByUser = null;

    const platformConfig = await prisma.platformConfig.findMany({
        where: {
            key: { in: ['is_bootstrap_mode', 'bootstrap_promo_duration_days', 'bootstrap_default_tier', 'starting_credits'] }
        }
    });
    
    const configMap = platformConfig.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

    const isBootstrapMode = configMap['is_bootstrap_mode'] === 'true';

    if (isBootstrapMode) {
      const promoDurationDays = configMap['bootstrap_promo_duration_days'] ? parseInt(configMap['bootstrap_promo_duration_days']) : 90;
      const defaultTier = (configMap['bootstrap_default_tier']) || UserTier.PROMO;

      userTier = defaultTier;
      promoExpiresAt = new Date(Date.now() + promoDurationDays * 24 * 60 * 1000);
    }

    const startingCredits = configMap['starting_credits'] ? parseInt(configMap['starting_credits']) : 10;

    if (referredByCode) {
      referredByUser = await prisma.user.findUnique({ where: { referralCode: referredByCode } });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        userTier: userTier as any, // FORCE CAST to match stale Prisma types or new String type
        promoExpiresAt,
        referralCode: generateReferralCode(name || email),
        referredByUserId: referredByUser?.id,
        emailVerified: false, 
        creditBalance: startingCredits, 
      },
    });

    if (startingCredits > 0) {
        await prisma.creditTransaction.create({
            data: {
                userId: newUser.id,
                type: CreditTransactionType.EARN as any,
                source: CreditTransactionSource.SIGNUP_BONUS as any,
                amount: startingCredits,
                metadata: JSON.stringify({ reason: 'Welcome Gift' }),
            },
        });
    }

    const token = generateToken({ userId: newUser.id, role: newUser.role });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        userTier: newUser.userTier,
        creditBalance: newUser.creditBalance,
        referralCode: newUser.referralCode,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(new InternalServerError('Failed to register user.'));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return next(new BadRequestError(validation.error.errors[0].message));
  }

  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Mitigate timing attacks by always hashing a dummy password
      await comparePassword(password, '$2a$10$abcdefghijklmnopqrstuvwxyz'); 
      return next(new UnauthorizedError('Invalid credentials.'));
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      return next(new UnauthorizedError('Invalid credentials.'));
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userTier: user.userTier,
        creditBalance: user.creditBalance,
        referralCode: user.referralCode,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    next(new InternalServerError('Failed to log in.'));
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next(new UnauthorizedError('User not authenticated.'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userTier: true,
        promoExpiresAt: true,
        creditBalance: true,
        birthdate: true,
        city: true,
        country: true,
        suburb: true,
        referralCode: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      return next(new NotFoundError('User not found.'));
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    next(new InternalServerError('Failed to fetch user data.'));
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return next(new UnauthorizedError('User not authenticated.'));
  }

  const { name, city, country, suburb } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, city, country, suburb },
      select: { id: true, email: true, name: true, city: true, country: true, suburb: true }
    });

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    next(new InternalServerError('Failed to update profile.'));
  }
};

export const upgradeToPremium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next(new UnauthorizedError('User not authenticated.'));
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { userTier: UserTier.PREMIUM as any }
    });

    res.status(200).json({
      message: 'Successfully upgraded to Premium!',
      user: { id: user.id, userTier: user.userTier }
    });
  } catch (error) {
    console.error('Upgrade user error:', error);
    next(new InternalServerError('Failed to upgrade user.'));
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { name: { contains: search as string } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, userTier: true, creditBalance: true,
        status: true, createdAt: true, lastActiveAt: true, city: true, country: true, suburb: true
      },
      skip, take, orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

    res.status(200).json({ users, total, page: parseInt(page as string), limit: take });
  } catch (error) {
    console.error('Get all users error:', error);
    next(new InternalServerError('Failed to list users.'));
  }
};

export const updateUserAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userTier, creditAmount, action } = req.body;

    if (action === 'set_tier' && userTier) {
       const user = await prisma.user.update({
         where: { id },
         data: { userTier: userTier as any }
       });
       return res.status(200).json({ message: 'User tier updated', user });
    }

    if (action === 'add_credits' && creditAmount) {
       const user = await prisma.user.update({
         where: { id },
         data: { creditBalance: { increment: parseInt(creditAmount) } }
       });
       return res.status(200).json({ message: 'Credits added', user });
    }

    return next(new BadRequestError('Invalid action or missing parameters.'));

  } catch (error) {
    console.error('Admin update user error:', error);
    next(new InternalServerError('Failed to update user.'));
  }
};

export const rewardSocialShare = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return next(new UnauthorizedError('User not authenticated.'));
        }

        const { platform } = req.body;
        
        const rewardConfig = await prisma.platformConfig.findUnique({ where: { key: 'social_share_reward' } });
        const rewardAmount = rewardConfig ? parseInt(rewardConfig.value) : 10;

        await prisma.user.update({
            where: { id: userId },
            data: { creditBalance: { increment: rewardAmount } }
        });

        await prisma.creditTransaction.create({
            data: {
                userId: userId,
                type: CreditTransactionType.EARN as any,
                source: CreditTransactionSource.SOCIAL_SHARE as any,
                amount: rewardAmount,
                metadata: JSON.stringify({ platform })
            }
        });

        res.status(200).json({ 
            message: `Shared on ${platform}! You earned ${rewardAmount} credits.`,
            earned: rewardAmount
        });

    } catch (error) {
        console.error('Reward share error:', error);
        next(new InternalServerError('Failed to reward credits.'));
    }
};