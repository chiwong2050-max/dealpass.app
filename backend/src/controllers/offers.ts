import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { NotFoundError, InternalServerError, BadRequestError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { generateQrCodeDataUrl } from '../utils/qrCode';
import { v4 as uuidv4 } from 'uuid';
import { moderateOfferContent } from '../utils/aiModerator';

// Define status constants to avoid runtime enum issues
const STATUS_ACTIVE = 'ACTIVE';
const OfferStatus = { DRAFT: 'DRAFT', ARCHIVED: 'ARCHIVED' };
const CreditTransactionType = { SPEND: 'SPEND' };
const CreditTransactionSource = { REDEMPTION_UNLOCK: 'REDEMPTION_UNLOCK' };
const RedemptionStatus = { SUCCESS: 'SUCCESS' };

// ... (Keep helper: parseOfferJsonFields)
const parseOfferJsonFields = (offer: any) => {
  if (offer.discountDetails && typeof offer.discountDetails === 'string') {
    try {
      offer.discountDetails = JSON.parse(offer.discountDetails);
    } catch (e) { /* ignore parse error */ }
  }
  if (offer.timeDetails && typeof offer.timeDetails === 'string') {
    try {
      offer.timeDetails = JSON.parse(offer.timeDetails);
    } catch (e) { /* ignore parse error */ }
  }
  if (offer.eligibilityDetails && typeof offer.eligibilityDetails === 'string') {
    try {
      offer.eligibilityDetails = JSON.parse(offer.eligibilityDetails);
    } catch (e) { /* ignore parse error */ }
  }
  if (offer.aiModerationResult && typeof offer.aiModerationResult === 'string') {
    try {
      offer.aiModerationResult = JSON.parse(offer.aiModerationResult);
    } catch (e) { /* ignore parse error */ }
  }
  return offer;
};

// Helper for slug generation
const generateSlug = (title: string, id: string) => {
    const baseSlug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    return `${baseSlug}-${id.slice(0, 8)}`;
};

// Helper for Retargeting
const processRetargeting = async (businessId: string, offerTitle: string, publicUrlSlug: string) => {
    const pastRedemptions = await prisma.redemption.findMany({
        where: { businessId: businessId },
        select: { userId: true },
        distinct: ['userId']
    });

    if (pastRedemptions.length > 0) {
        const notifications = pastRedemptions.map(r => ({
            userId: r.userId,
            type: 'NEW_OFFER',
            title: `New Deal`, 
            body: `New offer available: ${offerTitle}`,
            status: 'PENDING',
            data: JSON.stringify({ url: `/deal/${publicUrlSlug}` })
        }));

        await (prisma as any).notificationQueue.createMany({ data: notifications });
        return notifications.length;
    }
    return 0;
};

export const createOffer = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  if (!userId) return next(new UnauthorizedError('User not authenticated.'));

  try {
    const business = await prisma.business.findFirst({ where: { ownerUserId: userId }, include: { owner: true } });
    if (!business) return next(new BadRequestError('You must own a business.'));
    if (business.status !== 'ACTIVE' && business.status !== 'PENDING_APPROVAL') return next(new BadRequestError('Business not active.'));

    const { title, shortDescription, longDescription, imageUrl, externalUrl, country, city, currency, timezone, creditCost, leadCost, validFrom, validTo, totalLimit, dailyLimit, perUserLimit, primaryPromotionTypeCode, discountDetails, timeDetails, eligibilityDetails, status } = req.body;

    const moderation = await moderateOfferContent(title, shortDescription + (longDescription || ''), parseInt(creditCost));
    const finalTitle = moderation.suggestedTitle || title;
    
    let offerStatus = moderation.status;
    if (status === 'DRAFT') {
        offerStatus = OfferStatus.DRAFT;
    }

    const newOffer = await prisma.offer.create({
      data: {
        businessId: business.id, title: finalTitle, shortDescription, longDescription, imageUrl, externalUrl,
        // Location defaults to the business's location when not supplied, so every
        // offer always carries a country/city/currency/timezone for filtering & pricing.
        country: country || business.country,
        city: city || business.city,
        currency: currency || business.currency,
        timezone: timezone || business.timezone,
        creditCost: parseInt(creditCost), leadCost: leadCost ? parseInt(leadCost) : 0, validFrom: new Date(validFrom), validTo: new Date(validTo),
        totalLimit: totalLimit ? parseInt(totalLimit) : null, dailyLimit: dailyLimit ? parseInt(dailyLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1, primaryPromotionTypeCode, status: offerStatus as any,
        discountDetails: discountDetails ? JSON.stringify(discountDetails) : undefined,
        timeDetails: timeDetails ? JSON.stringify(timeDetails) : undefined,
        eligibilityDetails: eligibilityDetails ? JSON.stringify(eligibilityDetails) : undefined,
        aiModerationResult: JSON.stringify({ score: moderation.score, reasoning: moderation.reasoning }),
        validDays: timeDetails && timeDetails.days ? timeDetails.days.join(',') : undefined
      } as any,
    });

    const publicUrlSlug = generateSlug(finalTitle, newOffer.id);
    const updatedOffer = await prisma.offer.update({
        where: { id: newOffer.id },
        data: { publicUrlSlug } as any
    });

    let retargetingCount = 0;
    if (offerStatus === 'ACTIVE') {
        retargetingCount = await processRetargeting(business.id, finalTitle, publicUrlSlug);
    }

    res.status(201).json({ 
        message: offerStatus === 'DRAFT' ? 'Draft saved.' : 'Offer published!', 
        offer: updatedOffer, 
        retargeting: { 
            count: retargetingCount, 
            message: retargetingCount > 0 ? `Queued notifications for ${retargetingCount} past customers.` : 'Offer created.' 
        } 
    });
  } catch (error) { 
      console.error(error);
      next(new InternalServerError('Failed to create offer.')); 
  }
};

export const updateOffer = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const updates = req.body;
  try {
    const offer = await prisma.offer.findUnique({ where: { id }, include: { business: true } });
    if (!offer) return next(new NotFoundError('Offer not found'));
    if ((req as any).user?.role !== 'ADMIN' && offer.business.ownerUserId !== userId) return next(new ForbiddenError('Not authorized'));
    
    let validDays = undefined;
    if (updates.timeDetails && updates.timeDetails.days) {
        validDays = updates.timeDetails.days.join(',');
    }

    const isActivating = updates.status === 'ACTIVE' && offer.status !== 'ACTIVE';

    const updated = await prisma.offer.update({ where: { id }, data: { ...updates, validDays, status: updates.status as any } });

    let retargetingCount = 0;
    if (isActivating) {
        const slug = updated.publicUrlSlug || generateSlug(updated.title, updated.id);
        if (!updated.publicUrlSlug) {
             await prisma.offer.update({ where: { id }, data: { publicUrlSlug: slug } as any });
        }
        retargetingCount = await processRetargeting(offer.businessId, updated.title, slug);
    }

    res.json({ 
        message: 'Offer updated', 
        offer: updated,
        retargeting: retargetingCount > 0 ? { count: retargetingCount, message: `Sent ${retargetingCount} alerts.` } : undefined
    });
  } catch(e) { next(new InternalServerError('Update failed')); }
};

export const deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    await prisma.offer.update({ where: { id }, data: { status: OfferStatus.ARCHIVED as any } });
    res.json({ message: 'Offer archived' });
  } catch(e) { next(new InternalServerError('Delete failed')); }
};

export const listOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, country, category, keyword, sort, day, page = 1, limit = 10, businessId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: any = { status: STATUS_ACTIVE, validFrom: { lte: new Date() }, validTo: { gte: new Date() } };

    // Filter by the visitor's selected country/city. The country is matched on the
    // offer's own country and falls back to the business country for older rows.
    if (country) {
        where.OR = [
            { country: { equals: country as string } },
            { country: null, business: { country: { equals: country as string } } },
        ];
    }
    if (city) {
        where.business = { ...where.business, city: { equals: city as string } };
    }
    if (category) where.business = { ...where.business, categoryTags: { contains: category as string } };
    if (keyword) {
        where.AND = [
            ...(where.AND || []),
            { OR: [{ title: { contains: keyword as string } }, { business: { tradingName: { contains: keyword as string } } }] },
        ];
    }
    if (businessId) {
        where.businessId = businessId as string;
    }
    
    if (day) {
        where.AND = [
            ...(where.AND || []),
            {
                OR: [
                    { validDays: { contains: day as string } },
                    { validDays: null },
                    { validDays: "" }
                ]
            },
        ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { unlockCount: 'desc' };
    if (sort === 'ending_soon') orderBy = { validTo: 'asc' };

    const offers = await prisma.offer.findMany({
      where, include: { business: { select: { id: true, tradingName: true, city: true, country: true, currency: true, logoUrl: true, avgStarRating: true } } },
      orderBy, skip, take: parseInt(limit as string)
    });
    const total = await prisma.offer.count({ where });
    res.status(200).json({ offers: offers.map(parseOfferJsonFields), total, page, limit });
  } catch (error) { next(new InternalServerError('Failed to fetch offers.')); }
};

export const getMyUnlockedOffers = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  try {
    const unlockedOffers = await prisma.unlockedOffer.findMany({
      where: { userId }, include: { offer: true, business: true }, orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ unlockedOffers });
  } catch (error) { next(new InternalServerError('Failed.')); }
};

export const getBusinessLeads = async (req: Request, res: Response, next: NextFunction) => {
  const { businessId } = req.params;
  try {
     const leads = await prisma.unlockedOffer.findMany({
        where: { businessId }, include: { user: { select: { name: true, email: true } }, offer: { select: { title: true } } }, orderBy: { createdAt: 'desc' }
     });
     res.status(200).json({ leads });
  } catch (err) { next(new InternalServerError('Failed')); }
};

export const getOfferDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const requestingUserId = (req as any).user?.id;

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    const whereClause: any = isUuid ? { id } : { publicUrlSlug: id };

    const offer = await prisma.offer.findFirst({
      where: whereClause,
      include: {
        business: {
          select: {
            id: true, tradingName: true, description: true, address: true, city: true, country: true,
            currency: true, timezone: true,
            logoUrl: true, coverImageUrl: true, avgStarRating: true, totalReviews: true, categoryTags: true, ownerUserId: true
          },
        },
      },
    });

    if (!offer) return next(new NotFoundError('Offer not found.'));

    let userVisitCount = 0;
    if (requestingUserId) {
        userVisitCount = await prisma.redemption.count({
            where: {
                userId: requestingUserId,
                businessId: offer.businessId
            }
        });
    }

    prisma.offer.update({ where: { id: offer.id }, data: { viewCount: { increment: 1 } } }).catch(e=>{});

    let todaysUnlocks = 0;
    if (offer.dailyLimit) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        todaysUnlocks = await prisma.unlockedOffer.count({
            where: {
                offerId: offer.id,
                createdAt: { gte: startOfDay }
            }
        });
    }

    const parsedOffer = parseOfferJsonFields(offer);
    
    if (parsedOffer.business && (!requestingUserId || parsedOffer.business.ownerUserId !== requestingUserId)) {
        delete (parsedOffer.business as any).ownerUserId;
    }

    res.status(200).json({ 
        offer: parsedOffer,
        usageStats: { todaysUnlocks },
        userHistory: { visitCount: userVisitCount, isReturningCustomer: userVisitCount > 0 }
    });
  } catch (error) {
    next(new InternalServerError('Failed to fetch offer details.'));
  }
};

export const unlockOffer = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { id: offerId } = req.params;
  if (!userId) return next(new UnauthorizedError('User not authenticated.'));

  try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const offer = await prisma.offer.findUnique({ where: { id: offerId } });
      
      if (!user || !offer) return next(new BadRequestError('Invalid user or offer'));
      
      if (user.creditBalance < offer.creditCost) return next(new BadRequestError('Not enough credits'));

      if (offer.totalLimit && offer.unlockCount >= offer.totalLimit) {
          return next(new BadRequestError('Sorry, this offer is sold out.'));
      }

      if (offer.dailyLimit) {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          
          const todaysUnlocks = await prisma.unlockedOffer.count({
              where: { offerId: offer.id, createdAt: { gte: startOfDay } }
          });

          if (todaysUnlocks >= offer.dailyLimit) {
              return next(new BadRequestError('Daily limit reached for this offer. Please try again tomorrow!'));
          }
      }

      const existingUnlocks = await prisma.unlockedOffer.count({ where: { userId, offerId } });
      if (existingUnlocks >= offer.perUserLimit) return next(new BadRequestError(`You have reached your limit (${offer.perUserLimit}) for this offer.`));

      await prisma.$transaction([
          prisma.user.update({ where: { id: userId }, data: { creditBalance: { decrement: offer.creditCost } } }),
          prisma.creditTransaction.create({
              data: { userId, type: CreditTransactionType.SPEND as any, source: CreditTransactionSource.REDEMPTION_UNLOCK as any, amount: -offer.creditCost, relatedOfferId: offerId }
          })
      ]);
      
      const uniqueCouponCode = uuidv4().substring(0, 8).toUpperCase();
      const unlocked = await prisma.unlockedOffer.create({
          data: {
              userId, offerId, businessId: offer.businessId, uniqueCouponCode,
              qrCodeData: await generateQrCodeDataUrl(JSON.stringify({ couponCode: uniqueCouponCode })),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
          }
      });
      
      await prisma.offer.update({ where: { id: offerId }, data: { unlockCount: { increment: 1 } } });

      res.status(200).json({ message: 'Unlocked!', unlockedOffer: unlocked });
  } catch(e) { 
      console.error(e);
      next(new InternalServerError('Unlock failed')); 
  }
};

export const redeemOffer = async (req: Request, res: Response, next: NextFunction) => {
    const { couponCode } = req.params;
    try {
        const unlocked = await prisma.unlockedOffer.findUnique({ where: { uniqueCouponCode: couponCode }, include: { offer: true, user: true } });
        if (!unlocked || unlocked.isRedeemed) return next(new BadRequestError('Invalid or used coupon'));
        
        await prisma.unlockedOffer.update({ where: { id: unlocked.id }, data: { isRedeemed: true, redeemedAt: new Date() } });
        await prisma.redemption.create({ 
            data: { unlockedOfferId: unlocked.id, userId: unlocked.userId, businessId: unlocked.businessId, offerId: unlocked.offerId, status: RedemptionStatus.SUCCESS as any, source: 'STAFF_SCAN' } as any
        });
        
        await prisma.offer.update({ where: { id: unlocked.offerId }, data: { redemptionCount: { increment: 1 } } });

        res.status(200).json({ message: 'Redeemed!', redeemedOffer: unlocked });
    } catch(e) { next(new InternalServerError('Redeem failed')); }
};

export const scanAndRedeem = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    const { id: offerId } = req.params;
    if(!userId) return next(new UnauthorizedError('Auth required'));
    
    try {
        const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { business: true } });
        if(!offer) return next(new NotFoundError('Offer not found'));
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return next(new NotFoundError('User not found'));

        const existingUnlock = await prisma.unlockedOffer.findFirst({
            where: { userId, offerId, isRedeemed: false }
        });

        let unlockedOfferId = existingUnlock?.id;

        if (!existingUnlock) {
             if (user.creditBalance < offer.creditCost) return next(new BadRequestError(`Insufficient credits.`));
             if (offer.totalLimit && offer.unlockCount >= offer.totalLimit) return next(new BadRequestError('Sold out.'));
             const existingUnlocks = await prisma.unlockedOffer.count({ where: { userId, offerId } });
             if (existingUnlocks >= offer.perUserLimit) return next(new BadRequestError('Limit reached.'));
             
             await prisma.user.update({ where: { id: userId }, data: { creditBalance: { decrement: offer.creditCost } } });
             await prisma.creditTransaction.create({
                data: { userId, type: CreditTransactionType.SPEND as any, source: CreditTransactionSource.REDEMPTION_UNLOCK as any, amount: -offer.creditCost, relatedOfferId: offerId }
             });

             const uniqueCouponCode = uuidv4().substring(0, 8).toUpperCase();
             const newUnlock = await prisma.unlockedOffer.create({
                data: {
                    userId, offerId, businessId: offer.businessId, uniqueCouponCode,
                    qrCodeData: 'scanned_at_pos',
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
             });
             unlockedOfferId = newUnlock.id;
             
             await prisma.offer.update({ where: { id: offerId }, data: { unlockCount: { increment: 1 } } });
        }

        await prisma.unlockedOffer.update({ 
            where: { id: unlockedOfferId }, 
            data: { isRedeemed: true, redeemedAt: new Date() } 
        });
        
        await prisma.redemption.create({
            data: { unlockedOfferId, userId, businessId: offer.businessId, offerId, status: RedemptionStatus.SUCCESS as any, source: 'USER_SCAN' } as any
        });
        
        await prisma.offer.update({ where: { id: offerId }, data: { redemptionCount: { increment: 1 } } });
        
        res.status(200).json({ message: 'Verified & Redeemed!', offerTitle: offer.title, businessName: offer.business.tradingName });
    } catch(e) { 
        console.error(e);
        next(new InternalServerError('Scan failed')); 
    }
};

export const getRecommendedOffers = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    if (!userId) return next(new UnauthorizedError('User not authenticated.'));

    try {
        const redemptions = await prisma.redemption.findMany({
            where: { userId },
            select: { businessId: true },
            distinct: ['businessId']
        });
        
        const visitedBusinessIds = redemptions.map(r => r.businessId);

        const recommended = await prisma.offer.findMany({
            where: {
                businessId: { in: visitedBusinessIds },
                status: STATUS_ACTIVE,
                validTo: { gte: new Date() }
            },
            include: { business: { select: { tradingName: true, city: true } } },
            take: 5
        });

        res.status(200).json({ offers: recommended });
    } catch (e) {
        console.error("Rec error", e);
        next(new InternalServerError('Failed to get recommendations'));
    }
};