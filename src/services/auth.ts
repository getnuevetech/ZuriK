import api from './api';
import Cookies from 'js-cookie';
import { User, ApiResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'customer' | 'designer';
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    const { user, token } = response.data.data;
    Cookies.set('auth_token', token, { expires: 7 });
    return { user, token };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    const { user, token } = response.data.data;
    Cookies.set('auth_token', token, { expires: 7 });
    return { user, token };
  },

  async logout(): Promise<void> {
    Cookies.remove('auth_token');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(
      `/users/${userId}`,
      data
    );
    return response.data.data;
  },

  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  },
};
