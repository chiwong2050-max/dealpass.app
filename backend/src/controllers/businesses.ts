import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { NotFoundError, InternalServerError, BadRequestError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { moderateBusinessProfile } from '../utils/aiModerator';

export const createBusiness = async (req: Request, res: Response, next: NextFunction) => {
  const ownerUserId = (req as any).user?.id;
  const {
    legalName,
    tradingName,
    description,
    address,
    city,
    country,
    phone,
    email,
    website,
    logoUrl,
    coverImageUrl,
    categoryTags,
  } = req.body;

  if (!ownerUserId) {
    return next(new UnauthorizedError('User not authenticated.'));
  }

  if (!legalName || !tradingName || !address || !city || !country || !email) {
    return next(new BadRequestError('Legal name, trading name, address, city, country, and email are required.'));
  }

  try {
    const existingBusiness = await prisma.business.findFirst({
      where: { ownerUserId },
    });

    if (existingBusiness) {
      return next(new BadRequestError('You already own a business. Only one business per owner is allowed.'));
    }

    const moderation = await moderateBusinessProfile(tradingName, description, website);
    
    let businessStatus = 'PENDING_APPROVAL'; 
    
    if (moderation.status === 'ACTIVE') {
        businessStatus = 'ACTIVE';
    } else if (moderation.status === 'REJECTED') {
        return next(new BadRequestError(`Business registration failed: ${moderation.reasoning.join(' ')}`));
    }

    let tagsToSave = '';
    if (Array.isArray(categoryTags)) {
        tagsToSave = categoryTags.join(',');
    } else if (typeof categoryTags === 'string') {
        tagsToSave = categoryTags;
    }

    const newBusiness = await prisma.business.create({
      data: {
        ownerUserId,
        legalName,
        tradingName,
        description,
        address,
        city,
        country,
        phone,
        email,
        website,
        logoUrl,
        coverImageUrl,
        categoryTags: tagsToSave as any, // Cast to any to bypass stale array type
        status: businessStatus as any,   // Cast to any to bypass stale enum type
      },
    });

    let msg = 'Business created successfully and is now active!';
    if (businessStatus === 'PENDING_APPROVAL') {
        msg = 'Business profile submitted! It is under review for verification.';
    }

    // Handle tag splitting safely with type assertion
    const tags = (newBusiness.categoryTags as any as string);
    const businessObj = {
        ...newBusiness,
        categoryTags: tags && typeof tags === 'string' ? tags.split(',') : []
    };

    res.status(201).json({
      message: msg,
      business: businessObj,
      moderation
    });
  } catch (error) {
    console.error('Create business error:', error);
    next(new InternalServerError('Failed to create business.'));
  }
};

export const getBusinessDetails = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const requestingUserId = (req as any).user?.id;
  const requestingUserRole = (req as any).user?.role;

  try {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!business) {
      return next(new NotFoundError('Business not found.'));
    }

    const tags = (business.categoryTags as any as string);
    const businessWithTags = {
        ...business,
        categoryTags: tags && typeof tags === 'string' ? tags.split(',') : []
    };

    if (requestingUserRole !== 'ADMIN' && business.ownerUserId !== requestingUserId) {
      const publicBusiness = {
        id: businessWithTags.id,
        tradingName: businessWithTags.tradingName,
        description: businessWithTags.description,
        address: businessWithTags.address,
        city: businessWithTags.city,
        country: businessWithTags.country,
        phone: businessWithTags.phone,
        email: businessWithTags.email,
        website: businessWithTags.website,
        logoUrl: businessWithTags.logoUrl,
        coverImageUrl: businessWithTags.coverImageUrl,
        categoryTags: businessWithTags.categoryTags,
        avgStarRating: businessWithTags.avgStarRating,
        totalReviews: businessWithTags.totalReviews,
        status: businessWithTags.status,
      };
      return res.status(200).json({ business: publicBusiness });
    }

    res.status(200).json({ business: businessWithTags });
  } catch (error) {
    console.error('Get business details error:', error);
    next(new InternalServerError('Failed to fetch business details.'));
  }
};

export const updateBusiness = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerUserId = (req as any).user?.id;
  const requestingUserRole = (req as any).user?.role;
  const updates = req.body;

  if (!ownerUserId) {
    return next(new UnauthorizedError('User not authenticated.'));
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      return next(new NotFoundError('Business not found.'));
    }

    if (business.ownerUserId !== ownerUserId && requestingUserRole !== 'ADMIN') {
      return next(new ForbiddenError('You are not authorized to update this business.'));
    }

    let tagsUpdate = undefined;
    if (updates.categoryTags) {
        if (Array.isArray(updates.categoryTags)) {
            tagsUpdate = updates.categoryTags.join(',');
        } else {
            tagsUpdate = updates.categoryTags;
        }
    }

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        ...updates,
        ownerUserId: undefined,
        status: requestingUserRole === 'ADMIN' ? updates.status as any : undefined,
        categoryTags: tagsUpdate as any,
      },
    });

    const tags = (updatedBusiness.categoryTags as any as string);
    const businessWithTags = {
        ...updatedBusiness,
        categoryTags: tags && typeof tags === 'string' ? tags.split(',') : []
    };

    res.status(200).json({
      message: 'Business updated successfully.',
      business: businessWithTags,
    });
  } catch (error) {
    console.error('Update business error:', error);
    next(new InternalServerError('Failed to update business.'));
  }
};

export const listBusinesses = async (req: Request, res: Response, next: NextFunction) => {
  const requestingUserId = (req as any).user?.id;
  const requestingUserRole = (req as any).user?.role;
  const { status, city, category, ownerId, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = {};

  if (requestingUserRole === 'BUSINESS_OWNER') {
    where.ownerUserId = requestingUserId;
  } else if (requestingUserRole !== 'ADMIN') {
    where.status = 'ACTIVE';
  }

  if (status && requestingUserRole === 'ADMIN') {
    where.status = status as string;
  } else if (status && requestingUserRole === 'BUSINESS_OWNER' && status === 'ACTIVE') {
    where.status = status as string;
  }

  if (city) {
    where.city = { equals: city as string };
  }
  if (category) {
    where.categoryTags = { contains: category as string };
  }
  if (ownerId && requestingUserRole === 'ADMIN') {
    where.ownerUserId = ownerId as string;
  }

  try {
    const businesses = await prisma.business.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            userTier: true, 
            creditBalance: true 
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });

    const totalBusinesses = await prisma.business.count({ where });

    const businessesWithTags = businesses.map(b => {
        const tags = (b.categoryTags as any as string);
        return {
            ...b,
            categoryTags: tags && typeof tags === 'string' ? tags.split(',') : []
        };
    });

    res.status(200).json({
      businesses: businessesWithTags,
      total: totalBusinesses,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    console.error('List businesses error:', error);
    next(new InternalServerError('Failed to fetch businesses.'));
  }
};

// ... keep existing exports (upgradeToPro, exportBusinessReport, getBusinessCustomers, getBusinessAnalytics)
export const upgradeToPro = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  if (!userId) return next(new UnauthorizedError('User not authenticated.'));
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: { userTier: 'PREMIUM' as any } });
    res.status(200).json({ message: 'Subscription upgraded successfully to PRO!', userTier: user.userTier });
  } catch (error) { next(new InternalServerError('Failed to upgrade subscription.')); }
};

export const exportBusinessReport = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const requestingUserId = (req as any).user?.id;
  const requestingUserRole = (req as any).user?.role;
  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return next(new NotFoundError('Business not found.'));
    if (requestingUserRole !== 'ADMIN' && business.ownerUserId !== requestingUserId) return next(new ForbiddenError('Not authorized to export report.'));
    const leads = await prisma.unlockedOffer.findMany({ where: { businessId: id }, include: { user: { select: { name: true, email: true } }, offer: { select: { title: true } } }, orderBy: { createdAt: 'desc' } });
    const headers = 'Date,Customer Name,Customer Email,Offer Title,Status,Redeemed At\n';
    const rows = leads.map(lead => {
      const date = lead.createdAt.toISOString().split('T')[0];
      const name = lead.user.name || 'Anonymous';
      const email = lead.user.email;
      const title = lead.offer.title.replace(/,/g, ' ');
      const status = lead.isRedeemed ? 'Redeemed' : 'Unlocked';
      const redeemedAt = lead.redeemedAt ? lead.redeemedAt.toISOString() : '';
      return `${date},${name},${email},${title},${status},${redeemedAt}`;
    }).join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment(`report-${business.tradingName.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(headers + rows);
  } catch (error) { next(new InternalServerError('Failed to generate report.')); }
};

export const getBusinessCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const requestingUserId = (req as any).user?.id;
  const requestingUserRole = (req as any).user?.role;
  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return next(new NotFoundError('Business not found.'));
    if (requestingUserRole !== 'ADMIN' && business.ownerUserId !== requestingUserId) return next(new ForbiddenError('Not authorized.'));
    const redemptions = await prisma.redemption.findMany({ where: { businessId: id }, include: { user: { select: { id: true, name: true, email: true, createdAt: true } }, offer: { select: { title: true } } }, orderBy: { createdAt: 'desc' } });
    const customersMap = new Map();
    redemptions.forEach(r => {
        if (!customersMap.has(r.userId)) customersMap.set(r.userId, { user: r.user, totalVisits: 0, lastVisit: r.createdAt, history: [] });
        const entry = customersMap.get(r.userId);
        entry.totalVisits++;
        if (entry.history.length < 5) entry.history.push({ offer: r.offer.title, date: r.createdAt });
        if (new Date(r.createdAt) > new Date(entry.lastVisit)) entry.lastVisit = r.createdAt;
    });
    const customers = Array.from(customersMap.values()).sort((a, b) => b.totalVisits - a.totalVisits);
    res.json({ customers });
  } catch (error) { next(new InternalServerError('Failed to fetch customer list.')); }
};

export const getBusinessAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const requestingUserId = (req as any).user?.id;
  const requestingUserRole = (req as any).user?.role;
  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return next(new NotFoundError('Business not found.'));
    if (requestingUserRole !== 'ADMIN' && business.ownerUserId !== requestingUserId) return next(new ForbiddenError('Not authorized.'));
    const redemptions = await prisma.redemption.findMany({ where: { businessId: id }, orderBy: { createdAt: 'asc' } });
    const uniqueUsers = new Set(redemptions.map(r => r.userId));
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    let newCustomersThisMonth = 0; let returningCustomersThisMonth = 0;
    const userFirstVisit = new Map<string, Date>(); const userVisitCount = new Map<string, number>();
    redemptions.forEach(r => {
        if (!userFirstVisit.has(r.userId)) userFirstVisit.set(r.userId, r.createdAt);
        const count = userVisitCount.get(r.userId) || 0;
        userVisitCount.set(r.userId, count + 1);
        if (r.createdAt >= startOfMonth) {
            const firstVisit = userFirstVisit.get(r.userId) as Date;
            if (r.createdAt.getTime() === firstVisit.getTime()) newCustomersThisMonth++;
            else returningCustomersThisMonth++;
        }
    });
    const repeatCustomersCount = Array.from(userVisitCount.values()).filter(count => count > 1).length;
    res.json({ totalRedemptions: redemptions.length, totalUniqueUsers: uniqueUsers.size, thisMonth: { new: newCustomersThisMonth, returning: returningCustomersThisMonth, total: newCustomersThisMonth + returningCustomersThisMonth }, repeatCustomersCount });
  } catch (error) { next(new InternalServerError('Failed to calculate analytics.')); }
};