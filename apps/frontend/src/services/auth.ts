import Cookies from 'js-cookie';
import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens in cookies
    Cookies.set('accessToken', accessToken, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 30 });

    return response.data;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens in cookies
    Cookies.set('accessToken', accessToken, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 30 });

    return response.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = Cookies.get('accessToken');
      if (!token) return null;

      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!Cookies.get('accessToken');
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) return null;

      const response = await api.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      });

      const { accessToken } = response.data;
      Cookies.set('accessToken', accessToken, { expires: 7 });

      return accessToken;
    } catch (error) {
      this.logout();
      return null;
    }
  },
};
