import { Router } from 'express';
import { getPushConfig, subscribeToPush, sendTestNotification, processNotificationQueue } from '../controllers/notifications';
import { protect, authorize } from '../middleware/auth';
// Prisma enums were removed for SQLite compatibility; keep role values as string constants.
const UserRole = { USER: 'USER', BUSINESS_OWNER: 'BUSINESS_OWNER', ADMIN: 'ADMIN' } as const;

const router = Router();

router.get('/config', getPushConfig);
router.post('/subscribe', protect, subscribeToPush);
router.post('/send', protect, authorize(UserRole.ADMIN), sendTestNotification);
router.post('/process-queue', protect, authorize(UserRole.ADMIN), processNotificationQueue); // New Endpoint

export default router;