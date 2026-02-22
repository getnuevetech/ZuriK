'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, AuthResponse, LoginPayload, RegisterPayload, UserProfile } from './api';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function storeTokens(res: AuthResponse) {
  localStorage.setItem('access_token', res.accessToken);
  localStorage.setItem('refresh_token', res.refreshToken);
  localStorage.setItem('auth_user', JSON.stringify(res.user));
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_user');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setAuth = useCallback((res: AuthResponse) => {
    setState({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const clearAuth = useCallback(() => {
    clearTokens();
    setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  }, []);

  // On mount: validate stored tokens against the server
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedRefresh = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('auth_user');
      if (storedToken && storedUser) {
        try {
          // Verify access token is still valid and get fresh user data
          const freshUser = await authApi.getProfile();
          setState({ user: freshUser, accessToken: storedToken, refreshToken: storedRefresh, isAuthenticated: true, isLoading: false });
        } catch {
          // Access token invalid — attempt refresh
          if (storedRefresh) {
            try {
              const refreshRes = await authApi.refresh(storedRefresh);
              localStorage.setItem('access_token', refreshRes.accessToken);
              localStorage.setItem('refresh_token', refreshRes.refreshToken);
              const freshUser = await authApi.getProfile();
              localStorage.setItem('auth_user', JSON.stringify(freshUser));
              setState({ user: freshUser, accessToken: refreshRes.accessToken, refreshToken: refreshRes.refreshToken, isAuthenticated: true, isLoading: false });
            } catch {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };
    init();
  }, [clearAuth]);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    storeTokens(res);
    setAuth(res);
  }, [setAuth]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    storeTokens(res);
    setAuth(res);
  }, [setAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const refreshAuth = useCallback(async () => {
    const storedRefresh = localStorage.getItem('refresh_token');
    if (!storedRefresh) throw new Error('No refresh token');
    const res = await authApi.refresh(storedRefresh);
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    setState((s) => ({ ...s, accessToken: res.accessToken, refreshToken: res.refreshToken }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
