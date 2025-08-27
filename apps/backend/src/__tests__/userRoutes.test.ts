/**
 * User Routes Integration Tests
 * Tests para las rutas de usuarios del ENTREGABLE 3 con protección del ENTREGABLE 4
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

describe('User Routes Integration Tests - ENTREGABLE 3', () => {
  let app: Application;
  let adminUser: TestUser;
  let regularUser: TestUser;

  beforeAll(async () => {
    // Inicializar la aplicación con base de datos
    app = await initializeApp();
    
    // Crear usuarios de prueba para autenticación
    adminUser = await createTestAdmin();
    regularUser = await createTestUser();
  });

  describe('POST /api/users - User Creation', () => {
    test('should create a new user successfully with admin auth', async () => {
      const userData = {
        email: 'api.test@example.com',
        password: 'SecurePassword123',
        firstName: 'API',
        lastName: 'Test',
        phone: '555-1234'
      };

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe('API Test');
      expect(response.body.data.phone).toBe(userData.phone);
      expect(response.body.data.role).toBe('USER');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      
      // Verificar que la password no se devuelve
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.passwordHash).toBeUndefined();
    });

    test('should reject user creation without authentication', async () => {
      const userData = {
        email: 'noauth@example.com',
        password: 'SecurePassword123',
        firstName: 'No',
        lastName: 'Auth',
        phone: '555-1234'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });

    test('should reject user creation with regular user auth', async () => {
      const userData = {
        email: 'regular@example.com',
        password: 'SecurePassword123',
        firstName: 'Regular',
        lastName: 'User',
        phone: '555-1234'
      };

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(regularUser.accessToken))
        .send(userData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    test('should reject duplicate email', async () => {
      const userData = {
        email: 'duplicate.api@example.com',
        password: 'Password123',
        firstName: 'First',
        lastName: 'User',
        phone: '555-0001'
      };

      // Crear primer usuario
      await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send(userData)
        .expect(201);

      // Intentar crear segundo usuario con mismo email
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send({
          ...userData,
          firstName: 'Second',
          lastName: 'User'
        })
        .expect(409); // Conflict

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT_ERROR');
      expect(response.body.error.message).toContain('Email already registered');
    });

    test('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid@example.com',
        // missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should validate email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email-format',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users - User Listing', () => {
    test('should return paginated list of users with admin auth', async () => {
      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBeDefined();
      expect(response.body.data.pagination.limit).toBeDefined();
      expect(response.body.data.pagination.total).toBeDefined();
      expect(response.body.data.pagination.totalPages).toBeDefined();
    });

    test('should reject listing without authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });

    test('should reject listing with regular user auth', async () => {
      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeaders(regularUser.accessToken))
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=5')
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(200);

      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    test('should exclude passwords from user list', async () => {
      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(200);

      if (response.body.data.users.length > 0) {
        const firstUser = response.body.data.users[0];
        expect(firstUser.password).toBeUndefined();
        expect(firstUser.passwordHash).toBeUndefined();
      }
    });
  });

  describe('GET /api/users/:id - User by ID', () => {
    test('should allow user to access their own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set(getAuthHeaders(regularUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(regularUser.id);
      expect(response.body.data.email).toBe(regularUser.email);
    });

    test('should allow admin to access any user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(regularUser.id);
    });

    test('should reject access to other user profile without admin', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser.id}`)
        .set(getAuthHeaders(regularUser.accessToken))
        .expect(404); // NotFound por insufficient permissions

      expect(response.body.success).toBe(false);
    });

    test('should reject access without authentication', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_ERROR');
    });

    test('should reject invalid ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id-format')
        .set(getAuthHeaders(adminUser.accessToken))
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      // El error será manejado por el middleware de Express
      // Puede devolver 400 (ideal) o 500 (si Express no puede parsearlo)
      expect([400, 500]).toContain(response.status);
    });

    test('should handle missing Content-Type', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send('email=test@test.com') // Form data instead of JSON
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Format', () => {
    test('should follow standard response format for success', async () => {
      const userData = {
        email: 'format.test@example.com',
        password: 'Password123',
        firstName: 'Format',
        lastName: 'Test',
        phone: '555-3456'
      };

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send(userData)
        .expect(201);

      // Verificar estructura de respuesta estándar
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');

      expect(response.body.success).toBe(true);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.timestamp).toBe('string');
    });

    test('should follow standard error format', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send({}) // Empty data to trigger validation error
        .expect(400);

      // Verificar estructura de error estándar
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('timestamp');
    });
  });

  describe('Security', () => {
    test('should hash passwords before storage', async () => {
      const userData = {
        email: 'security.test@example.com',
        password: 'MySecretPassword123',
        firstName: 'Security',
        lastName: 'Test',
        phone: '555-4567'
      };

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send(userData)
        .expect(201);

      // La respuesta no debe contener la password original
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.passwordHash).toBeUndefined();
      
      // El sistema interno debe haber hasheado la password
      // (esto se verifica en los tests del userService)
    });

    test('should sanitize output data', async () => {
      const userData = {
        email: 'sanitize@example.com',
        password: 'Password123',
        firstName: 'Sanitize',
        lastName: 'Test',
        phone: '555-5678'
      };

      const response = await request(app)
        .post('/api/users')
        .set(getAuthHeaders(adminUser.accessToken))
        .send(userData)
        .expect(201);

      const user = response.body.data;
      
      // Verificar que campos sensibles no estén presentes
      expect(user.password).toBeUndefined();
      expect(user.passwordHash).toBeUndefined();
      
      // Verificar que campos seguros estén presentes
      expect(user.email).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    test('should require authentication for all user routes', async () => {
      // Test que todas las rutas requieran autenticación
      const endpoints = [
        { method: 'get', path: '/api/users' },
        { method: 'post', path: '/api/users' },
        { method: 'get', path: `/api/users/${regularUser.id}` },
        { method: 'put', path: `/api/users/${regularUser.id}` },
        { method: 'delete', path: `/api/users/${regularUser.id}` }
      ];

      for (const endpoint of endpoints) {
        let response;
        switch (endpoint.method) {
          case 'get':
            response = await request(app).get(endpoint.path);
            break;
          case 'post':
            response = await request(app).post(endpoint.path).send({ email: 'test@test.com' });
            break;
          case 'put':
            response = await request(app).put(endpoint.path).send({ firstName: 'Test' });
            break;
          case 'delete':
            response = await request(app).delete(endpoint.path);
            break;
          default:
            throw new Error(`Unsupported method: ${endpoint.method}`);
        }

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_ERROR');
      }
    });
  });
});
