import request from 'supertest';
import app from '../app';
import { generateTokens } from '../utils/jwt';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';

// Test user that we'll register first
const testUser = {
  email: 'middleware-test-' + Date.now() + '@example.com',
  password: 'TestPassword123!',
  firstName: 'Middleware',
  lastName: 'Test'
};

describe('JWT Middleware Tests', () => {
  let validAccessToken: string;
  let registeredUserId: string;
  let expiredToken: string;
  let invalidToken: string;

  beforeAll(async () => {
    // First register a user to get a real user ID
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(registerResponse.status).toBe(201);
    
    registeredUserId = registerResponse.body.data.user.id;
    validAccessToken = registerResponse.body.data.tokens.accessToken;

    // Create an expired token for testing
    expiredToken = jwt.sign(
      { userId: registeredUserId },
      env.JWT_SECRET,
      { expiresIn: '-1h' } // Already expired
    );

    // Create an invalid token
    invalidToken = 'invalid.jwt.token.format';
  });

  describe('authenticateToken middleware', () => {
    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(registeredUserId);
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with expired token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with empty Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with Bearer but no token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('authorizeRoles middleware', () => {
    test('should reject access for regular user on admin route', async () => {
      const response = await request(app)
        .get('/api/auth/admin')
        .set('Authorization', `Bearer ${validAccessToken}`);

      // The user should be authenticated (200 response from auth middleware)
      // but then rejected by authorization middleware (403 response)
      // Since our test user has role 'user' and admin route requires 'admin'/'superadmin'
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject access without authentication for role-protected route', async () => {
      const response = await request(app)
        .get('/api/auth/admin');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Protected routes functionality', () => {
    test('should update profile with valid authentication', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1234567890'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe(updateData.firstName);
      expect(response.body.data.user.lastName).toBe(updateData.lastName);
      expect(response.body.data.user.phone).toBe(updateData.phone);
    });

    test('should reject profile update without authentication', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Token extraction edge cases', () => {
    test('should handle multiple spaces in Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer  ${validAccessToken}`); // Extra space

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should handle case-sensitive Bearer keyword', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `bearer ${validAccessToken}`); // lowercase

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should handle Authorization header with different scheme', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Basic ${validAccessToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Token verification error handling', () => {
    test('should handle token signed with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: registeredUserId },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${wrongSecretToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle completely malformed token', async () => {
      const malformedToken = 'not.a.jwt';

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${malformedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle token for non-existent user', async () => {
      // Create a token for a user that doesn't exist
      const nonExistentUserToken = jwt.sign(
        { userId: 'non-existent-user-id' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${nonExistentUserToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
