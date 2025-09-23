// Axios client for backend API with Supabase auth integration.
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

  // Auth endpoints (backend_evan compatibility)
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const response = await this.client.get('/profiles/me');
    if ('profile' in response.data) {
      return { data: response.data.profile } as ApiResponse<UserProfile>;
    }
    return response.data;
  }

  // Profile endpoints
  async getProfile(userId?: string): Promise<ApiResponse<UserProfile>> {
    // Fallback to current user if no id provided
    if (!userId) {
      const response = await this.client.get('/profiles/me');
      return { data: response.data.profile } as ApiResponse<UserProfile>;
    }
    // If needed, implement a backend route to fetch others' profiles.
    const response = await this.client.get(`/profiles/${userId}`);
    return response.data;
  }

  async updateProfile(data: ProfileFormData): Promise<ApiResponse<UserProfile>> {
    // backend_evan uses POST /profiles to upsert
    const response = await this.client.post('/profiles', data);
    // backend returns { profile }
    if ('profile' in response.data) {
      return { data: response.data.profile } as ApiResponse<UserProfile>;
    }
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
    // backend_evan provides a single top suggestion at /match/next
    const response = await this.client.get('/match/next');
    const candidate = response.data?.candidate;
    const data = candidate ? [candidate] : [];
    return {
      data,
      pagination: { page: 1, totalPages: 1, total: data.length },
    } as PaginatedResponse<MatchSuggestion>;
  }

  async sendMatchRequest(
    targetUserId: string
  ): Promise<ApiResponse<MatchRequest>> {
    // backend_evan expects { target_id } at /match/like
    const response = await this.client.post('/match/like', {
      target_id: targetUserId,
    });
    return response.data;
  }

  async skipMatch(targetUserId: string): Promise<ApiResponse<void>> {
    // backend_evan expects { target_id } at /match/pass
    const response = await this.client.post('/match/pass', {
      target_id: targetUserId,
    });
    return response.data;
  }

  // Connection endpoints
  async getConnections(
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Connection>> {
    // backend_evan: /match/matches returns { matches }
    const response = await this.client.get('/match/matches');
    const list: Connection[] = response.data?.matches || [];
    // Simple client-side pagination
    const start = (page - 1) * limit;
    const data = list.slice(start, start + limit);
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data, pagination: { page, totalPages, total } } as PaginatedResponse<Connection>;
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