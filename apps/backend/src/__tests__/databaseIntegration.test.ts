/**
 * Database Integration Tests
 * Tests para el ENTREGABLE 3: Integración de Base de Datos
 */

import { 
  createUser, 
  findUserByEmail, 
  findUserById, 
  updateUser, 
  deleteUser,
  getAllUsers,
  getUserCount,
  userExistsByEmail,
  CreateUserData,
  UpdateUserData 
} from '../services/userService';
import { hashPassword, verifyPassword } from '../utils/auth';
import { connectDatabase, disconnectDatabase } from '../lib/prisma';

// Mock de logger para evitar logs durante tests
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Database Integration Tests - ENTREGABLE 3', () => {
  
  beforeAll(async () => {
    // Conectar a la base de datos (o mock) antes de todos los tests
    await connectDatabase();
  });

  afterAll(async () => {
    // Desconectar después de todos los tests
    await disconnectDatabase();
  });

  describe('Database Connection', () => {
    test('should connect to database successfully', async () => {
      // Este test valida que la conexión se establezca
      // La conexión ya se hizo en beforeAll, so si llegamos aquí, pasó
      expect(true).toBe(true);
    });
  });

  describe('User Creation', () => {
    test('should create a user successfully', async () => {
      const userData: CreateUserData = {
        email: 'test.create@example.com',
        passwordHash: await hashPassword('testpassword123'),
        name: 'Test User',
        phone: '123-456-7890',
        role: 'USER'
      };

      const user = await createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.phone).toBe(userData.phone);
      expect(user.role).toBe(userData.role);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      
      // Verificar que el password hash esté presente pero no sea el password original
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe('testpassword123');
    });

    test('should hash password correctly during user creation', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await hashPassword(plainPassword);
      
      const userData: CreateUserData = {
        email: 'test.hash@example.com',
        passwordHash: hashedPassword,
        name: 'Hash Test User',
        phone: '987-654-3210',
        role: 'USER'
      };

      const user = await createUser(userData);

      // Verificar que el password se puede verificar correctamente
      const isPasswordValid = await verifyPassword(plainPassword, user.passwordHash);
      expect(isPasswordValid).toBe(true);

      // Verificar que un password incorrecto falle
      const isWrongPasswordValid = await verifyPassword('wrongPassword', user.passwordHash);
      expect(isWrongPasswordValid).toBe(false);
    });
  });

  describe('User Search by Email', () => {
    test('should find user by email successfully', async () => {
      // Primero crear un usuario
      const userData: CreateUserData = {
        email: 'test.findemail@example.com',
        passwordHash: await hashPassword('findtest123'),
        name: 'Find Email Test',
        phone: '555-0001',
        role: 'USER'
      };

      const createdUser = await createUser(userData);

      // Ahora buscarlo por email
      const foundUser = await findUserByEmail('test.findemail@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(createdUser.id);
      expect(foundUser!.email).toBe(userData.email);
      expect(foundUser!.name).toBe(userData.name);
    });

    test('should return null for non-existent email', async () => {
      const foundUser = await findUserByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });

    test('should find user by ID successfully', async () => {
      // Crear un usuario
      const userData: CreateUserData = {
        email: 'test.findid@example.com',
        passwordHash: await hashPassword('findidtest123'),
        name: 'Find ID Test',
        phone: '555-0002',
        role: 'USER'
      };

      const createdUser = await createUser(userData);

      // Buscar por ID
      const foundUser = await findUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(createdUser.id);
      expect(foundUser!.email).toBe(userData.email);
    });
  });

  describe('Constraint Violations', () => {
    test('should handle duplicate email constraint violation', async () => {
      const email = 'duplicate@example.com';
      
      // Crear primer usuario
      const userData1: CreateUserData = {
        email,
        passwordHash: await hashPassword('password1'),
        name: 'First User',
        phone: '555-0003',
        role: 'USER'
      };

      await createUser(userData1);

      // Intentar crear segundo usuario con mismo email
      const userData2: CreateUserData = {
        email, // mismo email
        passwordHash: await hashPassword('password2'),
        name: 'Second User',
        phone: '555-0004',
        role: 'USER'
      };

      // Esto debería lanzar un error o manejarse de alguna manera
      await expect(createUser(userData2)).rejects.toThrow();
    });

    test('should check if user exists by email', async () => {
      const email = 'exists@example.com';
      
      // Verificar que no existe inicialmente
      const existsInitially = await userExistsByEmail(email);
      expect(existsInitially).toBe(false);

      // Crear usuario
      const userData: CreateUserData = {
        email,
        passwordHash: await hashPassword('existstest123'),
        name: 'Exists Test User',
        phone: '555-0005',
        role: 'USER'
      };

      await createUser(userData);

      // Verificar que ahora existe
      const existsAfterCreation = await userExistsByEmail(email);
      expect(existsAfterCreation).toBe(true);
    });
  });

  describe('User Operations', () => {
    test('should update user successfully', async () => {
      // Crear usuario
      const userData: CreateUserData = {
        email: 'test.update@example.com',
        passwordHash: await hashPassword('updatetest123'),
        name: 'Original Name',
        phone: '555-0006',
        role: 'USER'
      };

      const createdUser = await createUser(userData);

      // Actualizar usuario
      const updateData: UpdateUserData = {
        name: 'Updated Name',
        phone: '555-9999'
      };

      const updatedUser = await updateUser(createdUser.id, updateData);

      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.phone).toBe(updateData.phone);
      expect(updatedUser.email).toBe(userData.email); // No debería cambiar
      expect(updatedUser.id).toBe(createdUser.id); // No debería cambiar
    });

    test('should get all users successfully', async () => {
      const initialCount = await getUserCount();
      
      // Crear un usuario adicional
      const userData: CreateUserData = {
        email: 'test.getall@example.com',
        passwordHash: await hashPassword('getalltest123'),
        name: 'Get All Test User',
        phone: '555-0007',
        role: 'USER'
      };

      await createUser(userData);

      const allUsers = await getAllUsers();
      const finalCount = await getUserCount();

      expect(finalCount).toBe(initialCount + 1);
      expect(allUsers.length).toBe(finalCount);
      
      // Verificar que el usuario creado esté en la lista
      const createdUserInList = allUsers.find(user => user.email === userData.email);
      expect(createdUserInList).toBeDefined();
    });
  });

  describe('Password Security', () => {
    test('should hash passwords with salt', async () => {
      const password = 'testPassword123';
      
      // Generar dos hashes del mismo password
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Los hashes deben ser diferentes (debido al salt)
      expect(hash1).not.toBe(hash2);
      
      // Pero ambos deben verificar correctamente contra el password original
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
      
      // Y fallar con password incorrecto
      expect(await verifyPassword('wrongPassword', hash1)).toBe(false);
    });

    test('should handle various password formats', async () => {
      const passwords = [
        'simple123',
        'Complex!Password@123',
        'números123áéíóú',
        'spaces in password',
        '!@#$%^&*()_+-=[]{}|;:,.<>?'
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Data Validation', () => {
    test('should handle null and optional fields correctly', async () => {
      const userData: CreateUserData = {
        email: 'test.nullfields@example.com',
        passwordHash: await hashPassword('nulltest123'),
        name: 'Null Fields Test',
        phone: undefined, // Campo opcional
        role: 'USER'
      };

      const user = await createUser(userData);

      expect(user.phone).toBeNull();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
    });

    test('should handle different user roles', async () => {
      const roles = ['USER', 'ADMIN', 'SUPERADMIN'] as const;

      for (const role of roles) {
        const userData: CreateUserData = {
          email: `test.role.${role.toLowerCase()}@example.com`,
          passwordHash: await hashPassword('roletest123'),
          name: `${role} Test User`,
          phone: '555-0008',
          role
        };

        const user = await createUser(userData);
        expect(user.role).toBe(role);
      }
    });
  });
});
