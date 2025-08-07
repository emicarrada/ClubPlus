import request from 'supertest';
import express from 'express';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation';
import { createUserSchema, userParamsSchema, paginationSchema } from '../utils/schemas';
import { errorHandler } from '../middlewares/errorHandler';

// Setup test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Test routes
  app.post('/test-body', validateBody(createUserSchema), (req, res) => {
    res.json({ success: true, data: req.body });
  });

  app.get('/test-params/:id', validateParams(userParamsSchema), (req, res) => {
    res.json({ success: true, data: req.params });
  });

  app.get('/test-query', validateQuery(paginationSchema), (req, res) => {
    res.json({ success: true, data: req.query });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

describe('Validation Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Body Validation', () => {
    it('should accept valid user data', async () => {
      const validUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      const response = await request(app)
        .post('/test-body')
        .send(validUser)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(validUser.email);
    });

    it('should reject invalid email format', async () => {
      const invalidUser = {
        email: 'not-an-email',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      const response = await request(app)
        .post('/test-body')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details[0].field).toBe('email');
    });

    it('should reject missing required fields', async () => {
      const incompleteUser = {
        email: 'test@example.com'
        // Missing firstName, lastName, password
      };

      const response = await request(app)
        .post('/test-body')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toHaveLength(3); // firstName, lastName, password
    });

    it('should reject short password', async () => {
      const userWithShortPassword = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/test-body')
        .send(userWithShortPassword)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details[0].field).toBe('password');
    });
  });

  describe('Params Validation', () => {
    it('should accept valid UUID', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/test-params/${validUuid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(validUuid);
    });

    it('should reject invalid UUID format', async () => {
      const invalidUuid = 'not-a-uuid';

      const response = await request(app)
        .get(`/test-params/${invalidUuid}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details[0].field).toBe('id');
    });
  });

  describe('Query Validation', () => {
    it('should accept valid pagination params', async () => {
      const response = await request(app)
        .get('/test-query?page=2&limit=20')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(20);
    });

    it('should use default values for missing pagination params', async () => {
      const response = await request(app)
        .get('/test-query')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
    });

    it('should transform string numbers to integers', async () => {
      const response = await request(app)
        .get('/test-query?page=3&limit=25')
        .expect(200);

      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(25);
      expect(typeof response.body.data.page).toBe('number');
      expect(typeof response.body.data.limit).toBe('number');
    });
  });

  describe('Error Format', () => {
    it('should return standardized error format', async () => {
      const response = await request(app)
        .post('/test-body')
        .send({}) // Empty body to trigger validation error
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error).toHaveProperty('timestamp');
      
      // Check error details format
      const details = response.body.error.details;
      expect(Array.isArray(details)).toBe(true);
      expect(details[0]).toHaveProperty('field');
      expect(details[0]).toHaveProperty('message');
      expect(details[0]).toHaveProperty('code');
    });
  });
});
