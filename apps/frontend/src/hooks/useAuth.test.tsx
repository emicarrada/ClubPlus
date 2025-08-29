import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the auth service BEFORE any imports
vi.mock('../lib/auth', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

import { mockAuthResponse } from '../test/mocks';
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

  it('loads user from localStorage on mount', async () => {
    // Mock authService to return user when token exists
    const { authService } = await import('../lib/auth');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockAuthResponse.data.user);

    // Set up localStorage with token
    localStorage.setItem('accessToken', mockAuthResponse.data.tokens.accessToken);
    localStorage.setItem('refreshToken', mockAuthResponse.data.tokens.refreshToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockAuthResponse.data.user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears user data on logout', async () => {
    // Set up localStorage with user data
    localStorage.setItem('user', JSON.stringify(mockAuthResponse.data.user));
    localStorage.setItem('accessToken', mockAuthResponse.data.tokens.accessToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Call logout
    await result.current.logout();

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
