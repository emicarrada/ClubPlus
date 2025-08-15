import { Router } from 'express';

const router = Router();

// TODO: Implement combo routes
// Placeholder routes for now

router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Combo routes will be implemented in future weeks',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;