import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { supabase } from '@/config/supabase';
import { env } from '@/config/env';
import {
  ApiResponse,
  UserProfile,
  MatchSuggestion,
  Connection,
  MatchRequest,
  PaginatedResponse,
  ProfileFormData,
} from '@/types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.API_BASE_URL,
  timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use(async (config) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
  }

  // Auth endpoints
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Profile endpoints
  async getProfile(userId?: string): Promise<ApiResponse<UserProfile>> {
    const endpoint = userId ? `/profile/${userId}` : '/profile';
    const response = await this.client.get(endpoint);
    return response.data;
  }

  async updateProfile(data: ProfileFormData): Promise<ApiResponse<UserProfile>> {
    const response = await this.client.put('/profile', data);
    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/profile/upload-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Match endpoints
  async getMatchSuggestions(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<MatchSuggestion>> {
    const response = await this.client.get('/match/suggestions', {
      params: { page, limit },
    });
    return response.data;
  }

  async sendMatchRequest(
    targetUserId: string
  ): Promise<ApiResponse<MatchRequest>> {
    const response = await this.client.post('/match/connect', {
      targetUserId,
    });
    return response.data;
  }

  async skipMatch(targetUserId: string): Promise<ApiResponse<void>> {
    const response = await this.client.post('/match/skip', {
      targetUserId,
    });
    return response.data;
  }

  // Connection endpoints
  async getConnections(
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Connection>> {
    const response = await this.client.get('/connections', {
      params: { page, limit },
    });
    return response.data;
  }

  async getConnection(connectionId: string): Promise<ApiResponse<Connection>> {
    const response = await this.client.get(`/connections/${connectionId}`);
    return response.data;
  }

  // Settings endpoints
  async updateSettings(settings: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await this.client.put('/settings', settings);
    return response.data;
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await this.client.delete('/account');
    return response.data;
  }
}

export const apiService = new ApiService();