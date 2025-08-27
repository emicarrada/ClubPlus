import request from 'supertest';
import app from '../app';

// Mock logger to avoid console output during tests
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('service', 'ClubPlus Backend');
    });
  });

  describe('GET /health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app).get('/health/db');
      
      // Response should be either 200 (connected), 503 (disconnected), or 500 (error)
      expect([200, 500, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status', 'connected');
        expect(response.body).toHaveProperty('latency');
        expect(response.body).toHaveProperty('database', 'postgresql');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body.latency).toMatch(/^\d+ms$/);
      } else if (response.status === 503) {
        expect(response.body).toHaveProperty('status', 'disconnected');
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('database', 'postgresql');
        expect(response.body).toHaveProperty('timestamp');
      } else if (response.status === 500) {
        // Error handling system catches database errors
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('code', 'DATABASE_ERROR');
        expect(response.body.error).toHaveProperty('timestamp');
      }
    });

    it('should measure and return latency when connected', async () => {
      const response = await request(app).get('/health/db');
      
      if (response.status === 200) {
        const latencyMatch = response.body.latency.match(/^(\d+)ms$/);
        expect(latencyMatch).not.toBeNull();
        
        const latencyValue = parseInt(latencyMatch[1]);
        expect(latencyValue).toBeGreaterThan(0);
        expect(latencyValue).toBeLessThan(5000); // Should be less than 5 seconds
      }
    });
  });
});
