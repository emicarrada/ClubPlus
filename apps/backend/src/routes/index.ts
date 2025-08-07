import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import userRoutes from './users';
import comboRoutes from './combos';
import paymentRoutes from './payments';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/combos', comboRoutes);
router.use('/payments', paymentRoutes);

export default router;