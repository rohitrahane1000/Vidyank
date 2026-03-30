import { create } from 'zustand';
import { User } from '../types/auth';
import { secureStorage } from '../services/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  refreshInterval: NodeJS.Timeout | null;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadTokens: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setupTokenRefreshInterval: () => void;
  clearTokenRefreshInterval: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  refreshInterval: null,
  
  setUser: async (user) => {
    const prevUser = get().user;
    set({ user, isAuthenticated: !!user });
    
    // Handle user switching - load user-specific data when user changes
    if (user && user._id !== prevUser?._id) {
      // Import course store dynamically to avoid circular dependency
      const { useCourseStore } = await import('./courseStore');
      await useCourseStore.getState().loadUserData(user._id);
    }
    
    // Clear user data when logging out
    if (!user && prevUser) {
      const { useCourseStore } = await import('./courseStore');
      useCourseStore.getState().clearUserData();
    }
  },
  
  setTokens: async (accessToken, refreshToken) => {
    await secureStorage.setItem('accessToken', accessToken);
    await secureStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },
  
  logout: async () => {
    // Clear refresh interval
    get().clearTokenRefreshInterval();
    
    // Clear user data from course store before clearing auth
    const { useCourseStore } = await import('./courseStore');
    useCourseStore.getState().clearUserData();
    
    await secureStorage.removeItem('accessToken');
    await secureStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null });
  },
  
  loadTokens: async () => {
    const accessToken = await secureStorage.getItem('accessToken');
    const refreshToken = await secureStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken });
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Load stored tokens
      const accessToken = await secureStorage.getItem('accessToken');
      const refreshToken = await secureStorage.getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken });
        
        try {
          // Try to get current user with stored access token
          const { authService } = await import('../services/auth/authService');
          const userResponse = await authService.getCurrentUser(accessToken);
          
          if (userResponse.success) {
            await get().setUser(userResponse.data);
            
            // Set up periodic token refresh (every 50 minutes)
            get().setupTokenRefreshInterval();
          } else {
            const refreshSuccess = await get().refreshAccessToken();
            if (!refreshSuccess) {
              await get().logout();
            } else {
              get().setupTokenRefreshInterval();
            }
          }
        } catch (error) {
          const refreshSuccess = await get().refreshAccessToken();
          if (!refreshSuccess) {
            await get().logout();
          } else {
            get().setupTokenRefreshInterval();
          }
        }
      }
    } catch (error) {
      // Handle initialization error silently
    } finally {
      set({ isLoading: false });
    }
  },

  refreshAccessToken: async () => {
    try {
      const { refreshToken } = get();
      if (!refreshToken) {
        return false;
      }

      const { authService } = await import('../services/auth/authService');
      const response = await authService.refreshToken(refreshToken);
      
      if (response.success) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        await get().setTokens(newAccessToken, newRefreshToken);
        
        // Get current user with new token
        const userResponse = await authService.getCurrentUser(newAccessToken);
        if (userResponse.success) {
          await get().setUser(userResponse.data);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  },

  setupTokenRefreshInterval: () => {
    // Clear any existing interval
    get().clearTokenRefreshInterval();
    
    // Set up new interval to refresh token every 50 minutes (tokens typically expire in 1 hour)
    const interval = setInterval(async () => {
      const success = await get().refreshAccessToken();
      if (!success) {
        await get().logout();
      }
    }, 50 * 60 * 1000); // 50 minutes
    
    set({ refreshInterval: interval });
  },

  clearTokenRefreshInterval: () => {
    const { refreshInterval } = get();
    if (refreshInterval) {
      clearInterval(refreshInterval);
      set({ refreshInterval: null });
    }
  },
}));
