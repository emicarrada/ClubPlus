import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, RegisterRequest, User } from '../types/auth';

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async login(email: string, password: string) {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });

    return {
      user: response.data.data.user,
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
    };
  }

  async register(email: string, password: string, name: string) {
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const registerData: RegisterRequest = {
      email,
      password,
      firstName,
      lastName,
    };

    const response: AxiosResponse<AuthResponse> = await this.api.post(
      '/auth/register',
      registerData,
    );

    return {
      user: response.data.data.user,
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
    };
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we clear local tokens
      console.error('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string) {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/refresh', {
      refreshToken,
    });

    return {
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
    };
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<{ success: boolean; data: { user: User } }> =
      await this.api.get('/auth/me');

    return response.data.data.user;
  }

  async updateProfile(userData: Partial<User>) {
    const response: AxiosResponse<{ success: boolean; data: { user: User } }> = await this.api.put(
      '/auth/profile',
      userData,
    );

    return response.data.data.user;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    await this.api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  // Helper method to get current token
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Helper method to clear all auth data
  clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();
