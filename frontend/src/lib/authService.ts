import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Inventory Manager' | 'Warehouse Staff' | 'Admin';
  avatar?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
}

const AUTH_STORAGE_KEY = 'stockmaster_auth';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      
      if (response.success && response.token && response.user) {
        // Store token and user
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          token: response.token,
          user: response.user
        }));
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  signup: async (
    name: string, 
    email: string, 
    password: string, 
    role: 'Inventory Manager' | 'Warehouse Staff'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { 
        name, 
        email, 
        password, 
        role 
      });
      
      if (response.success && response.token && response.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          token: response.token,
          user: response.user
        }));
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Signup failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  },

  requestOTP: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<AuthResponse>('/auth/request-otp', { email });
      return { success: response.success, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  },

  verifyOTP: async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<AuthResponse>('/auth/verify-otp', { email, otp });
      return { success: response.success, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'OTP verification failed' };
    }
  },

  resetPassword: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<AuthResponse>('/auth/reset-password', { email, password });
      return { success: response.success, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { user } = JSON.parse(stored);
        return user;
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        return !!token;
      } catch {
        return false;
      }
    }
    return false;
  }
};
