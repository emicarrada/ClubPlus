import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/environment';
import { logger } from './config/logger';
import routes from './routes';
import healthRoutes from './routes/health';
import { errorHandler } from './middlewares/errorHandler';
import { loggingMiddleware, errorLoggingMiddleware } from './middlewares/logging';
import { rateLimiter } from './middlewares/rateLimiter';

// Create Express application
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use(loggingMiddleware);

// Routes
app.use('/api', routes);

// Health check endpoints also at root level for easy access
app.use('/health', healthRoutes);

// Error logging middleware (before global error handler)
app.use(errorLoggingMiddleware);

// Global error handler (must be last)
app.use(errorHandler);

export default app;