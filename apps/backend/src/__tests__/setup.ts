/**
 * Jest setup file for configuring test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Different port for tests
process.env.LOG_LEVEL = 'error'; // Minimal logging during tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/clubplus_test';

// Mock external dependencies globally
jest.mock('../config/database', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

// Suppress console.log during tests unless specifically needed
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Clean up after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
});
