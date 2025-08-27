import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/environment';
import { DatabaseError } from '../utils/errors';

// Temporary type definitions until Prisma client is generated
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreateData {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

interface UserUpdateData {
  email?: string;
  passwordHash?: string;
  name?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

interface UserWhereUniqueInput {
  id?: string;
  email?: string;
}

interface PrismaClientInterface {
  user: {
    create(data: { data: UserCreateData }): Promise<User>;
    findUnique(params: { where: UserWhereUniqueInput; select?: any }): Promise<User | null>;
    findFirst(params: { where: any }): Promise<User | null>;
    findMany(params: { where?: any; orderBy?: any; select?: any }): Promise<User[]>;
    update(params: { where: UserWhereUniqueInput; data: UserUpdateData }): Promise<User>;
    delete(params: { where: UserWhereUniqueInput }): Promise<User>;
    count(params?: { where?: any }): Promise<number>;
  };
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $queryRaw(query: TemplateStringsArray): Promise<any>;
}

// In-memory storage for development (will be replaced with real DB when connected)
const users: User[] = [];

/**
 * Mock Prisma client for development
 * This simulates database operations until real PostgreSQL is available
 */
class MockPrismaClient implements PrismaClientInterface {
  user = {
    async create({ data }: { data: UserCreateData }): Promise<User> {
      const newUser: User = {
        id: uuidv4(),
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        phone: data.phone || null,
        role: data.role || 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check for duplicate email
      const existingUser = users.find(u => u.email === data.email);
      if (existingUser) {
        const error = new Error('Unique constraint failed on email');
        (error as any).code = 'P2002';
        (error as any).meta = { target: ['email'] };
        throw error;
      }

      users.push(newUser);
      logger.info('User created in mock database:', { id: newUser.id, email: newUser.email });
      return newUser;
    },

    async findUnique({ where, select }: { where: UserWhereUniqueInput; select?: any }): Promise<User | null> {
      let user: User | undefined;
      
      if (where.id) {
        user = users.find(u => u.id === where.id);
      } else if (where.email) {
        user = users.find(u => u.email === where.email);
      }

      if (user && select) {
        // If select is specified, return only selected fields
        const selectedUser: any = {};
        Object.keys(select).forEach(key => {
          if (select[key] && (user as any)[key] !== undefined) {
            selectedUser[key] = (user as any)[key];
          }
        });
        return selectedUser;
      }

      return user || null;
    },

    async findFirst({ where }: { where: any }): Promise<User | null> {
      return this.findUnique({ where });
    },

    async findMany({ where, orderBy, select }: { where?: any; orderBy?: any; select?: any } = {}): Promise<User[]> {
      let filteredUsers = users;

      // Apply where filters if provided
      if (where) {
        filteredUsers = users.filter(user => {
          if (where.role && user.role !== where.role) return false;
          if (where.email && user.email !== where.email) return false;
          if (where.id && user.id !== where.id) return false;
          return true;
        });
      }

      // Apply ordering if provided
      if (orderBy) {
        if (orderBy.createdAt === 'desc') {
          filteredUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else if (orderBy.createdAt === 'asc') {
          filteredUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }
      }

      // Apply select if provided
      if (select) {
        return filteredUsers.map(user => {
          const selectedUser: any = {};
          Object.keys(select).forEach(key => {
            if (select[key] && (user as any)[key] !== undefined) {
              selectedUser[key] = (user as any)[key];
            }
          });
          return selectedUser;
        });
      }

      return filteredUsers;
    },

    async update({ where, data }: { where: UserWhereUniqueInput; data: UserUpdateData }): Promise<User> {
      const userIndex = users.findIndex(u => 
        (where.id && u.id === where.id) || (where.email && u.email === where.email)
      );

      if (userIndex === -1) {
        const error = new Error('Record not found');
        (error as any).code = 'P2025';
        throw error;
      }

      // Check for duplicate email if email is being updated
      if (data.email && data.email !== users[userIndex].email) {
        const existingUser = users.find(u => u.email === data.email);
        if (existingUser) {
          const error = new Error('Unique constraint failed on email');
          (error as any).code = 'P2002';
          (error as any).meta = { target: ['email'] };
          throw error;
        }
      }

      users[userIndex] = {
        ...users[userIndex],
        ...data,
        updatedAt: new Date(),
      };

      logger.info('User updated in mock database:', { id: users[userIndex].id });
      return users[userIndex];
    },

    async delete({ where }: { where: UserWhereUniqueInput }): Promise<User> {
      const userIndex = users.findIndex(u => 
        (where.id && u.id === where.id) || (where.email && u.email === where.email)
      );

      if (userIndex === -1) {
        const error = new Error('Record not found');
        (error as any).code = 'P2025';
        throw error;
      }

      const deletedUser = users[userIndex];
      users.splice(userIndex, 1);
      
      logger.info('User deleted from mock database:', { id: deletedUser.id });
      return deletedUser;
    },

    async count({ where }: { where?: any } = {}): Promise<number> {
      if (!where) {
        return users.length;
      }

      const filteredUsers = users.filter(user => {
        if (where.role && user.role !== where.role) return false;
        if (where.email && user.email !== where.email) return false;
        if (where.id && user.id !== where.id) return false;
        return true;
      });

      return filteredUsers.length;
    }
  };

  async $connect(): Promise<void> {
    logger.info('Mock Prisma client connected');
  }

  async $disconnect(): Promise<void> {
    logger.info('Mock Prisma client disconnected');
  }

  async $queryRaw(query: TemplateStringsArray): Promise<any> {
    logger.debug('Mock query executed:', { query: query.join('') });
    return [{ result: 1 }];
  }
}

// Global client instance
let prismaClient: PrismaClientInterface;

/**
 * Get Prisma client instance
 */
export function getPrismaClient(): PrismaClientInterface {
  if (!prismaClient) {
    // For now, use mock client. In production, this would be the real PrismaClient
    prismaClient = new MockPrismaClient();
    logger.info('Using mock Prisma client for development');
  }
  return prismaClient;
}

/**
 * Connect to the database
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    
    logger.info('Connecting to database...', {
      url: env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'),
      mode: 'mock', // Will change to 'postgresql' when real DB is connected
    });

    await client.$connect();
    await client.$queryRaw`SELECT 1`;
    
    logger.info('Database connected successfully', {
      provider: 'mock', // Will change to 'postgresql'
      status: 'connected',
    });
  } catch (error) {
    logger.error('Failed to connect to database:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'),
    });
    
    throw new DatabaseError('Database connection failed', {
      originalError: error,
      url: env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'),
    });
  }
}

/**
 * Disconnect from the database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$disconnect();
    
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    throw new DatabaseError('Database disconnection failed', {
      originalError: error,
    });
  }
}

/**
 * Handle database errors and convert to appropriate application errors
 */
export function handleDatabaseError(error: any): never {
  logger.error('Database operation failed:', {
    error: error.message,
    code: error.code,
    meta: error.meta,
  });

  // Prisma-specific error handling
  if (error.code === 'P2002') {
    // Unique constraint violation
    const target = error.meta?.target;
    const field = Array.isArray(target) ? target[0] : target;
    
    throw new DatabaseError(`Duplicate value for field: ${field}`, {
      code: 'UNIQUE_VIOLATION',
      field,
      originalError: error,
    });
  }

  if (error.code === 'P2025') {
    // Record not found
    throw new DatabaseError('Record not found', {
      code: 'NOT_FOUND',
      originalError: error,
    });
  }

  if (error.code === 'P2016') {
    // Query interpretation error
    throw new DatabaseError('Invalid query parameters', {
      code: 'INVALID_QUERY',
      originalError: error,
    });
  }

  if (error.code === 'P1001') {
    // Connection error
    throw new DatabaseError('Database connection failed', {
      code: 'CONNECTION_ERROR',
      originalError: error,
    });
  }

  // Generic database error
  throw new DatabaseError('Database operation failed', {
    code: 'OPERATION_FAILED',
    originalError: error,
  });
}

/**
 * Execute a database operation with proper error handling
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`Database operation failed${context ? ` in ${context}` : ''}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      context,
    });
    
    handleDatabaseError(error);
  }
}

// Export the default client instance
export const prisma = getPrismaClient();

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default prisma;
