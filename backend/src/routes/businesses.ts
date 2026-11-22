import { Router } from 'express';
import { createBusiness, getBusinessDetails, updateBusiness, listBusinesses, upgradeToPro, exportBusinessReport, getBusinessCustomers, getBusinessAnalytics } from '../controllers/businesses';
import { protect, authorize } from '../middleware/auth';
// Prisma enums were removed for SQLite compatibility; keep role values as string constants.
const UserRole = { USER: 'USER', BUSINESS_OWNER: 'BUSINESS_OWNER', ADMIN: 'ADMIN' } as const;

const router = Router();

// Public route to get business details (can be restricted for sensitive info)
router.get('/:id', getBusinessDetails);

// Protected routes for business owners and admins
router.post('/', protect, authorize(UserRole.BUSINESS_OWNER), createBusiness);
router.put('/:id', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), updateBusiness);
router.get('/', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), listBusinesses);

// Report Export & Analytics
router.get('/:id/report', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), exportBusinessReport);
router.get('/:id/customers', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), getBusinessCustomers);
router.get('/:id/analytics', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), getBusinessAnalytics); // NEW

// Subscription Upgrade Route
router.post('/upgrade', protect, authorize(UserRole.BUSINESS_OWNER, UserRole.ADMIN), upgradeToPro);


export default router;