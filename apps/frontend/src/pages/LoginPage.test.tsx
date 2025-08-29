import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../test/utils';
import LoginPage from './LoginPage';

// Clear mocks before each test to avoid interference
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock the useAuth hook with proper implementation
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LoginPage', () => {
  it('renders login form with all fields', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders login page title', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument();
  });

  it('has link to register page', () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole('link', { name: /regístrate aquí/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('validates email field', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/correo electrónico es requerido/i)).toBeInTheDocument();
    });
  });

  it('validates password field', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('allows user to type in form fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
