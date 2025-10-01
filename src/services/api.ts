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
    // Step 1: Get a signed upload URL from backend
    const ext = file.name.split('.').pop() || 'jpg';
    const signedUrlResponse = await this.client.post('/profiles/photo/signed-url', { ext });
    const { signedUrl, publicUrl } = signedUrlResponse.data;
    
    // Step 2: Upload file directly to Supabase storage using signed URL
    await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    return { data: { url: publicUrl } };
  }

  // Match endpoints
  async getMatchSuggestions(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<MatchSuggestion>> {
    // backend_evan provides a single top suggestion at /match/next
    const response = await this.client.get('/match/next');
    const candidate = response.data?.candidate;
    
    // Transform backend format to frontend MatchSuggestion format
    const data = candidate ? [{
      id: candidate.id,
      user: {
        id: candidate.id,
        email: candidate.email,
        name: candidate.name,
        age: candidate.age,
        ageRangeMin: candidate.ageRangeMin,
        ageRangeMax: candidate.ageRangeMax,
        major: candidate.major,
        year: candidate.year,
        profilePicture: candidate.profilePicture,
        interests: candidate.interests || [],
        classes: candidate.classes || [],
        bio: candidate.bio,
        university: candidate.university,
        isProfileComplete: candidate.isProfileComplete,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
      },
      sharedInterests: candidate.sharedInterests || [],
      sharedClasses: candidate.sharedClasses || [],
      compatibilityScore: candidate.compatibilityScore || 75,
    }] : [];
    
    return {
      data,
      pagination: { page: 1, limit: 10, total: data.length, totalPages: 1 },
    };
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
    // backend_evan: /match/matches returns { matches } from matches_with_profiles view
    const response = await this.client.get('/match/matches');
    const matches = response.data?.matches || [];
    
    // Get current user's profile to determine which user in the match is the "other" user
    const myProfile = await this.getProfile();
    const myId = myProfile.data.id;
    
    // Transform backend matches to Connection format
    const list: Connection[] = matches.map((match: any) => {
      // Determine which user is the "other" user
      const isUserA = match.user_a === myId;
      const otherUserId = isUserA ? match.user_b : match.user_a;
      const otherUserName = isUserA ? match.user_b_name : match.user_a_name;
      const otherUserPhoto = isUserA ? match.user_b_photo : match.user_a_photo;
      
      return {
        id: match.match_id,
        user: {
          id: otherUserId,
          name: otherUserName,
          profilePicture: otherUserPhoto,
          // These fields aren't in the view, so we'll use defaults
          email: '',
          age: 0,
          ageRangeMin: 18,
          ageRangeMax: 24,
          major: '',
          year: 'Freshman',
          interests: [],
          classes: [],
          bio: '',
          university: 'UAH',
          isProfileComplete: true,
          createdAt: match.created_at,
          updatedAt: match.created_at,
        },
        matchedAt: match.created_at,
        sharedInterests: [],
        sharedClasses: [],
      };
    });
    
    // Simple client-side pagination
    const start = (page - 1) * limit;
    const data = list.slice(start, start + limit);
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data, pagination: { page, limit, totalPages, total } };
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