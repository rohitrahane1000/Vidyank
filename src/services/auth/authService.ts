import axios from 'axios';
import { RegisterRequest, LoginRequest, AuthResponse, User } from '../../types/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.freeapi.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  // Add retry configuration for production builds
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  // You can get the token from your auth store here
  // For now, we'll handle it in the individual methods
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token from storage
        const { secureStorage } = await import('../storage');
        const refreshToken = await secureStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Attempt to refresh the token
          const refreshResponse = await api.post('/users/refresh-token', {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });
          
          if (refreshResponse.data.success) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            
            // Update stored tokens
            await secureStorage.setItem('accessToken', newAccessToken);
            await secureStorage.setItem('refreshToken', newRefreshToken);
            
            // Update auth store
            const { useAuthStore } = await import('../../store/authStore');
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        const { useAuthStore } = await import('../../store/authStore');
        await useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to normalize avatar URL
const normalizeAvatarUrl = (avatarUrl: string): string => {
  if (!avatarUrl) return avatarUrl;
  
  // Ensure HTTPS for production builds
  let normalizedUrl = avatarUrl;
  
  // If it's already a full URL, ensure it's HTTPS
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    // Replace localhost with the actual API domain for production
    if (avatarUrl.includes('localhost:8080')) {
      normalizedUrl = avatarUrl.replace('http://localhost:8080', 'https://api.freeapi.app');
    }
    // Force HTTPS for production security
    if (normalizedUrl.startsWith('http://') && !normalizedUrl.includes('localhost')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }
  } else if (avatarUrl.startsWith('/')) {
    // If it's a relative path, prepend the API base URL with HTTPS
    normalizedUrl = `https://api.freeapi.app${avatarUrl}`;
  }
  
  // Add cache-busting parameter for production builds
  const separator = normalizedUrl.includes('?') ? '&' : '?';
  normalizedUrl = `${normalizedUrl}${separator}v=${Date.now()}`;
  
  return normalizedUrl;
};

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/login', data);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ data: { accessToken: string; refreshToken: string }; message: string; statusCode: number; success: boolean }> {
    const response = await api.post('/users/refresh-token', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  },

  async getCurrentUser(accessToken: string): Promise<{ data: User; message: string; statusCode: number; success: boolean }> {
    const response = await api.get('/users/current-user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    // Normalize avatar URL if present
    if (response.data?.data?.avatar?.url) {
      response.data.data.avatar.url = normalizeAvatarUrl(response.data.data.avatar.url);
    }
    
    return response.data;
  },

  async updateAvatar(accessToken: string, imageUri: string): Promise<{ data: User; message: string; statusCode: number; success: boolean }> {
    try {
      const formData = new FormData();
      
      // Get file info for better upload handling
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('avatar', {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      const response = await api.patch('/users/avatar', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for file uploads
      });
      
      // Normalize avatar URL if present
      if (response.data?.data?.avatar?.url) {
        const originalUrl = response.data.data.avatar.url;
        response.data.data.avatar.url = normalizeAvatarUrl(originalUrl);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
