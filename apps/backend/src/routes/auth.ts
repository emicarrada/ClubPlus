import { Router } from 'express';

const router = Router();

// TODO: Implement authentication routes in Week 2
// Placeholder routes for now

router.post('/login', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Authentication routes will be implemented in Week 2',
      timestamp: new Date().toISOString()
    }
  });
});

router.post('/register', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Authentication routes will be implemented in Week 2',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;