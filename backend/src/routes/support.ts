import { Router } from 'express';
import { createIncidentReport, getIncidents, resolveIncident } from '../controllers/support';
import { protect, authorize } from '../middleware/auth';
// Prisma enums were removed for SQLite compatibility; keep role values as string constants.
const UserRole = { USER: 'USER', BUSINESS_OWNER: 'BUSINESS_OWNER', ADMIN: 'ADMIN' } as const;

const router = Router();

// Allow authenticated users to file detailed reports
router.post('/report', protect, createIncidentReport);

// Admin only: View and manage reports
router.get('/', protect, authorize(UserRole.ADMIN), getIncidents);
router.put('/:id/resolve', protect, authorize(UserRole.ADMIN), resolveIncident);

export default router;