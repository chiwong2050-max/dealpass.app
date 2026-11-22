import { Router } from 'express';
import { listOffers, getOfferDetails, unlockOffer, redeemOffer, getMyUnlockedOffers, createOffer, getBusinessLeads, updateOffer, deleteOffer, scanAndRedeem, getRecommendedOffers } from '../controllers/offers';
import { protect, authorize, optionalProtect } from '../middleware/auth';
// Prisma enums were removed for SQLite compatibility; keep role values as string constants.
const UserRole = { USER: 'USER', BUSINESS_OWNER: 'BUSINESS_OWNER', ADMIN: 'ADMIN' } as const;

const router = Router();

// Public routes
router.get('/', listOffers);
router.get('/:id', optionalProtect, getOfferDetails); // CHANGED to optionalProtect

// Protected routes
router.get('/user/recommended', protect, getRecommendedOffers); // NEW
router.get('/my-coupons', protect, getMyUnlockedOffers);
router.get('/business/:businessId/leads', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), getBusinessLeads);

router.post('/', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), createOffer);
router.put('/:id', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), updateOffer);
router.delete('/:id', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), deleteOffer);

router.post('/:id/unlock', protect, unlockOffer);
router.post('/:id/scan', protect, scanAndRedeem);
router.post('/redeem/:couponCode', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), redeemOffer);

export default router;