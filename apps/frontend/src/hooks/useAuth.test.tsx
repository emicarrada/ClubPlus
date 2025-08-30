import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockAuthResponse } from '../test/mocks';

// Mock the auth service completely
const mockAuthService = {
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  isAuthenticated: vi.fn(),
  getAccessToken: vi.fn(),
  clearAuthData: vi.fn(),
};

vi.mock('../lib/auth', () => ({
  authService: mockAuthService,
}));

import { AuthProvider, useAuth } from './useAuth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();

    // Reset mocks to default behavior
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('No token'));
    mockAuthService.login.mockResolvedValue({
      user: mockAuthResponse.data.user,
      accessToken: mockAuthResponse.data.tokens.accessToken,
      refreshToken: mockAuthResponse.data.tokens.refreshToken,
    });
    mockAuthService.logout.mockResolvedValue(undefined);
  });

  it('provides initial auth state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false); // Should be false after initialization
  });

  it('provides login function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.login).toBe('function');
  });

  it('provides logout function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.logout).toBe('function');
  });

  it('provides register function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.register).toBe('function');
  });

  it('provides refreshAuth function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.refreshAuth).toBe('function');
  });
});
