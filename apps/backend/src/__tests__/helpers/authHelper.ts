/**
 * Auth Helper for Tests
 * Funciones auxiliares para manejar autenticación en tests
 */

import { generateAccessToken } from '../../utils/jwt';
import { findUserByEmail, createUser } from '../../services/userService';
import bcrypt from 'bcryptjs';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  accessToken: string;
}

/**
 * Crear un usuario de prueba con token válido
 */
export async function createTestUser(
  role: 'USER' | 'ADMIN' | 'SUPERADMIN' = 'USER',
  emailPrefix: string = 'test'
): Promise<TestUser> {
  const timestamp = Date.now();
  const email = `${emailPrefix}.${timestamp}@test.com`;
  const password = 'TestPassword123';

  // Crear usuario en la base de datos
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await createUser({
    email,
    passwordHash: hashedPassword,
    name: `Test User ${timestamp}`,
    phone: '555-0000',
    role
  });

  // Generar token
  const accessToken = generateAccessToken(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'USER' | 'ADMIN' | 'SUPERADMIN',
    accessToken
  };
}

/**
 * Crear usuario admin de prueba
 */
export async function createTestAdmin(): Promise<TestUser> {
  return createTestUser('ADMIN', 'admin');
}

/**
 * Crear usuario superadmin de prueba
 */
export async function createTestSuperAdmin(): Promise<TestUser> {
  return createTestUser('SUPERADMIN', 'superadmin');
}

/**
 * Obtener headers de autenticación para requests
 */
export function getAuthHeaders(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`
  };
}

/**
 * Obtener usuario de prueba existente o crear uno nuevo
 */
export async function getOrCreateTestUser(role: 'USER' | 'ADMIN' | 'SUPERADMIN' = 'USER'): Promise<TestUser> {
  const email = `persistent.${role.toLowerCase()}@test.com`;
  
  try {
    // Intentar encontrar usuario existente
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      const accessToken = generateAccessToken(existingUser.id);
      
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role as 'USER' | 'ADMIN' | 'SUPERADMIN',
        accessToken
      };
    }
  } catch (error) {
    // Usuario no existe, crear uno nuevo
  }

  // Crear nuevo usuario
  const hashedPassword = await bcrypt.hash('PersistentPassword123', 12);
  const user = await createUser({
    email,
    passwordHash: hashedPassword,
    name: `Persistent ${role} User`,
    phone: '555-9999',
    role
  });

  const accessToken = generateAccessToken(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'USER' | 'ADMIN' | 'SUPERADMIN',
    accessToken
  };
}
