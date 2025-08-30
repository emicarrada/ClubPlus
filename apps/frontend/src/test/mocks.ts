import React from 'react';
import { vi } from 'vitest';
import { ComboTemplate, Platform } from '../types/api';
import { AuthResponse, User } from '../types/auth';

// Mock user data
export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock auth response
export const mockAuthResponse: AuthResponse = {
  success: true,
  data: {
    user: mockUser,
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
  },
};

// Mock auth context
export const mockAuthContext = {
  user: null,
  tokens: null,
  isLoading: false,
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshAuth: vi.fn(),
};

// Mock AuthProvider component
export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};

// Mock platforms
export const mockPlatforms: Platform[] = [
  {
    id: '1',
    name: 'Disney+',
    logoUrl: '/logos/disney-plus.svg',
    description: 'Streaming service',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'HBO Max',
    logoUrl: '/logos/hbo-max.svg',
    description: 'Streaming service',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Mock combo templates
export const mockComboTemplates: ComboTemplate[] = [
  {
    id: '1',
    name: 'Combo Entretenimiento',
    description: 'Disney+ y HBO Max',
    price: 199,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    platforms: mockPlatforms,
  },
  {
    id: '2',
    name: 'Combo Creativo',
    description: 'Canva Pro incluido',
    price: 249,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    platforms: [
      {
        id: '3',
        name: 'Canva Pro',
        logoUrl: '/logos/canva-pro.svg',
        description: 'Design platform',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
  },
];

// Mock API responses
export const mockApiResponses = {
  login: {
    success: true,
    data: mockAuthResponse,
  },
  register: {
    success: true,
    data: mockAuthResponse,
  },
  comboTemplates: {
    success: true,
    data: mockComboTemplates,
  },
  platforms: {
    success: true,
    data: mockPlatforms,
  },
};

// Mock axios
export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(() => mockAxios),
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
};
