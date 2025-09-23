// Provides auth state and actions (login, logout, profile).
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { UserProfile, AuthState } from '@/types';
import { apiService } from '@/services/api';
import { mockCurrentUser } from '@/services/mockData';
import { env } from '@/config/env';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithUniversity: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setUser = (user: User | null, profile: UserProfile | null = null) => {
    setState(prev => ({
      ...prev,
      user: user ? {
        id: user.id,
        email: user.email!,
        emailVerified: user.email_confirmed_at !== null,
        userMetadata: user.user_metadata,
      } : null,
      profile,
    }));
  };

  const fetchProfile = async (): Promise<UserProfile | null> => {
    try {
      if (env.IS_DEV) {
        // Use mock data in development
        return mockCurrentUser;
      }
      
      const response = await apiService.getProfile();
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    
    setLoading(true);
    try {
      const profile = await fetchProfile();
      setState(prev => ({ ...prev, profile, loading: false }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setError('Failed to refresh profile');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In development, simulate email login
      if (env.IS_DEV) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate successful login with mock user
        const mockUser = {
          id: 'mock-user-id',
          email: email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            university: mockCurrentUser.university,
            name: mockCurrentUser.name,
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        
        setUser(mockUser, mockCurrentUser);
        setLoading(false);
        return;
      }

      // Production Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchProfile();
        setUser(data.user, profile);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithUniversity = async () => {
    console.log('University login clicked');
    setLoading(true);
    setError(null);
    
    try {
      // In development, simulate university login
      if (env.IS_DEV) {
        console.log('Development mode - simulating login');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful login with mock user
        const mockUser = {
          id: 'mock-user-id',
          email: mockCurrentUser.email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            university: mockCurrentUser.university,
            name: mockCurrentUser.name,
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        
        console.log('Setting mock user:', mockUser);
        setUser(mockUser, mockCurrentUser);
        console.log('Login successful');
        return;
      }

      // Production OAuth flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'University login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null, null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // In development, skip Supabase session checks
    if (env.IS_DEV) {
      setLoading(false);
      return;
    }

    // Get initial session (production only)
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchProfile();
          setUser(session.user, profile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (production only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          const profile = await fetchProfile();
          setUser(session.user, profile);
        } else {
          setUser(null, null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithUniversity,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
