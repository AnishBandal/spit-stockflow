import { mockUsers, User } from './mockData';

const AUTH_STORAGE_KEY = 'stockmaster_auth';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo credentials
    if (email === 'demo.manager@stockmaster.test' && password === 'password123') {
      const user = mockUsers[0];
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    
    // Check against mock users
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid email or password' };
  },

  signup: async (name: string, email: string, password: string, role: 'Inventory Manager' | 'Warehouse Staff'): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Simulate successful signup
    return { success: true };
  },

  requestOTP: async (email: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!mockUsers.some(u => u.email === email)) {
      return { success: false, error: 'Email not found' };
    }
    
    return { success: true };
  },

  verifyOTP: async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Accept any 6-digit OTP for demo
    if (otp.length === 6) {
      return { success: true };
    }
    
    return { success: false, error: 'Invalid OTP' };
  },

  resetPassword: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  }
};
