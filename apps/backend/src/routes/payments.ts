import { Router } from 'express';

const router = Router();

// TODO: Implement payment routes
// Placeholder routes for now

router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Payment routes will be implemented in Week 5',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;