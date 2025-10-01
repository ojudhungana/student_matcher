// Provides auth state and actions (login, logout, profile).
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { UserProfile, AuthState } from '@/types';
import { apiService } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
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
      console.log('Fetching profile from backend...');
      
      // Add timeout to profile fetch
      const profilePromise = apiService.getProfile();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const response = await Promise.race([profilePromise, timeoutPromise]);
      console.log('Profile fetched successfully');
      return response.data;
    } catch (error: any) {
      // If profile doesn't exist or backend error, return null (user needs to create profile)
      console.error('Error fetching profile:', error?.response?.status || error?.message);
      // Don't throw - just return null so app can continue
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
      console.log('Attempting login...');
      
      // Add timeout protection
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - please check your connection')), 10000)
      );
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Login successful, fetching profile...');
        const profile = await fetchProfile();
        setUser(data.user, profile);
        console.log('Profile loaded, login complete');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      console.error('Login failed:', message, error);
      setError(message);
      throw error; // Re-throw so LoginScreen can handle it
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting signup...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Signup successful, user created');
        // Profile will be null for new users - they'll be redirected to profile setup
        setUser(data.user, null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      console.error('Signup failed:', message, error);
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithUniversity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // OAuth flow with Google (or your university SSO provider)
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
      throw error; // Re-throw so LoginScreen can handle it
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
    let isMounted = true;
    
    // Safety timeout - force loading to false after 5 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000);
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          console.log('User session found, fetching profile...');
          const profile = await fetchProfile();
          if (!isMounted) return;
          console.log('Profile fetched:', profile ? 'success' : 'null');
          setUser(session.user, profile);
        } else {
          // No session - user not logged in
          console.log('No session found');
          setUser(null, null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (!isMounted) return;
        setError('Failed to initialize authentication');
        setUser(null, null);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (!isMounted) return;
        
        if (session?.user) {
          const profile = await fetchProfile();
          if (!isMounted) return;
          setUser(session.user, profile);
        } else {
          setUser(null, null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    signup,
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
