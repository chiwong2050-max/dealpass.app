import { Router } from 'express';
import { getSettings, updateSetting, bulkUpdateSettings } from '../controllers/settings';
import { protect, authorize } from '../middleware/auth';
// Prisma enums were removed for SQLite compatibility; keep role values as string constants.
const UserRole = { USER: 'USER', BUSINESS_OWNER: 'BUSINESS_OWNER', ADMIN: 'ADMIN' } as const;

const router = Router();

// All settings routes are Admin only
router.use(protect, authorize(UserRole.ADMIN));

router.get('/', getSettings);
router.put('/', bulkUpdateSettings); // Update multiple
router.put('/:key', updateSetting); // Update single

export default router;