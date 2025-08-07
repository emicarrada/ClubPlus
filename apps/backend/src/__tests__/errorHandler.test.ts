import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middlewares/errorHandler';
import { 
  ValidationError, 
  AuthError, 
  NotFoundError, 
  InternalServerError,
  AppError 
} from '../utils/errors';
import { logger } from '../config/logger';

// Mock logger
jest.mock('../config/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock environment
jest.mock('../config/environment', () => ({
  env: {
    NODE_ENV: 'test',
  },
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('AppError handling', () => {
    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: { field: 'email' },
          timestamp: expect.any(String),
        },
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle AuthError correctly', () => {
      const error = new AuthError('Invalid credentials');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Invalid credentials',
          timestamp: expect.any(String),
        },
      });
    });

    it('should handle NotFoundError correctly', () => {
      const error = new NotFoundError('User not found');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND_ERROR',
          message: 'User not found',
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('Generic Error handling', () => {
    it('should handle JsonWebTokenError', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
          timestamp: expect.any(String),
        },
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'EXPIRED_TOKEN',
          message: 'Authentication token expired',
          timestamp: expect.any(String),
        },
      });
    });

    it('should handle CastError', () => {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid ID format',
          timestamp: expect.any(String),
        },
      });
    });

    it('should handle unknown errors as internal server error', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong',
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('Development vs Production', () => {
    it('should include stack trace in development mode', () => {
      // Temporarily override environment for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Re-require the module to get updated environment
      jest.resetModules();
      const { errorHandler: devErrorHandler } = require('../middlewares/errorHandler');
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      devErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: 'Error stack trace',
          }),
        })
      );
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error logging', () => {
    it('should log error details', () => {
      const error = new ValidationError('Test error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(logger.error).toHaveBeenCalledWith('Unhandled error:', {
        error: 'Test error',
        stack: expect.any(String),
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });
  });
});
