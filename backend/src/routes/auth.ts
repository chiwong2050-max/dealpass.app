import { Router } from 'express';
import { signup, login, getCurrentUser, upgradeToPremium, getAllUsers, updateUserAdmin, rewardSocialShare, updateProfile, magicLogin } from '../controllers/auth';
import { protect, authorize } from '../middleware/auth';
// Prisma enums were removed for SQLite compatibility; keep role values as string constants.
const UserRole = { USER: 'USER', BUSINESS_OWNER: 'BUSINESS_OWNER', ADMIN: 'ADMIN' } as const;

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/magic-login', magicLogin); // Redeem an emailed sign-in link
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile); // User updates own profile
router.post('/upgrade', protect, upgradeToPremium);
router.post('/reward-share', protect, rewardSocialShare);

// Admin Routes
router.get('/users', protect, authorize(UserRole.ADMIN), getAllUsers);
router.put('/users/:id', protect, authorize(UserRole.ADMIN), updateUserAdmin);

export default router;