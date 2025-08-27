/**
 * Protected Routes Tests - ENTREGABLE 4
 * Tests para las rutas protegidas implementadas en el Entregable 4
 */

import request from 'supertest';
import { initializeApp } from '../app';
import { Application } from 'express';
import { createTestUser, createTestAdmin, getAuthHeaders, TestUser } from './helpers/authHelper';

// Mock de logger para evitar logs durante tests
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Protected Routes Tests - ENTREGABLE 4', () => {
  let app: Application;
  let adminUser: TestUser;
  let regularUser: TestUser;
  let otherUser: TestUser;

  beforeAll(async () => {
    // Inicializar la aplicación
    app = await initializeApp();
    
    // Crear usuarios de prueba
    adminUser = await createTestAdmin();
    regularUser = await createTestUser('USER', 'regular');
    otherUser = await createTestUser('USER', 'other');
  });

  describe('POST /api/auth/change-password', () => {
    test('should change password successfully with valid current password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123',
        newPassword: 'NewSecurePassword456',
        confirmPassword: 'NewSecurePassword456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(regularUser.accessToken))
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed successfully');
    });

    test('should reject password change without authentication', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123',
        newPassword: 'NewPassword456',
        confirmPassword: 'NewPassword456'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .send(passwordData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });

    test('should reject password change with mismatched confirmation', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123',
        newPassword: 'NewPassword456',
        confirmPassword: 'DifferentPassword789'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(regularUser.accessToken))
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject password change with weak new password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123',
        newPassword: '123', // Too short
        confirmPassword: '123'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(regularUser.accessToken))
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('should update profile successfully', async () => {
      const profileData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '555-9999'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set(getAuthHeaders(regularUser.accessToken))
        .send(profileData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toContain('Updated');
      expect(response.body.data.user.phone).toBe('555-9999');
    });

    test('should reject profile update without authentication', async () => {
      const profileData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(profileData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });

    test('should validate profile data format', async () => {
      const invalidData = {
        firstName: '', // Empty name should fail
        phone: 'invalid-phone-format'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set(getAuthHeaders(regularUser.accessToken))
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users/me', () => {
    test('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set(getAuthHeaders(regularUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(regularUser.id);
      expect(response.body.data.email).toBe(regularUser.email);
      expect(response.body.data.passwordHash).toBeUndefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });
  });

  describe('PUT /api/users/me', () => {
    test('should update current user profile', async () => {
      const updateData = {
        firstName: 'SelfUpdated',
        lastName: 'Profile',
        phone: '555-7777'
      };

      const response = await request(app)
        .put('/api/users/me')
        .set(getAuthHeaders(regularUser.accessToken))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toContain('SelfUpdated');
    });

    test('should reject self-update without authentication', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/users/me')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });
  });

  describe('Authorization and Ownership', () => {
    test('should allow user to update own profile via PUT /users/:id', async () => {
      const updateData = {
        firstName: 'OwnUpdate',
        lastName: 'Test'
      };

      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set(getAuthHeaders(regularUser.accessToken))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject user updating another user profile', async () => {
      const updateData = {
        firstName: 'Hacker',
        lastName: 'Attempt'
      };

      const response = await request(app)
        .put(`/api/users/${otherUser.id}`)
        .set(getAuthHeaders(regularUser.accessToken))
        .send(updateData)
        .expect(404); // NotFound por insufficient permissions

      expect(response.body.success).toBe(false);
    });

    test('should allow admin to update any user', async () => {
      const updateData = {
        firstName: 'AdminUpdated',
        lastName: 'User'
      };

      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set(getAuthHeaders(adminUser.accessToken))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser.id}`)
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(409); // Conflict

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT_ERROR');
      expect(response.body.error.message).toContain('Cannot delete your own account');
    });

    test('should allow admin to delete other users', async () => {
      // Crear un usuario temporal para eliminar
      const tempUser = await createTestUser('USER', 'temp');
      
      const response = await request(app)
        .delete(`/api/users/${tempUser.id}`)
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedId).toBe(tempUser.id);
    });

    test('should reject regular user trying to delete accounts', async () => {
      const response = await request(app)
        .delete(`/api/users/${otherUser.id}`)
        .set(getAuthHeaders(regularUser.accessToken))
        .expect(403); // Forbidden

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('GET /api/auth/admin - Role-based Access', () => {
    test('should allow admin access to admin route', async () => {
      const response = await request(app)
        .get('/api/auth/admin')
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Admin area accessed successfully');
      expect(response.body.data.adminInfo).toBeDefined();
    });

    test('should reject regular user from admin route', async () => {
      const response = await request(app)
        .get('/api/auth/admin')
        .set(getAuthHeaders(regularUser.accessToken))
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    test('should reject unauthenticated access to admin route', async () => {
      const response = await request(app)
        .get('/api/auth/admin')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });
  });
});
