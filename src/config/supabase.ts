<<<<<<< HEAD
=======
// Initialize Supabase client from env; export storage bucket names.
>>>>>>> aaa84261f8429e5f3b3bea0ebd897acd2a3f4f08
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_PICTURES: 'profile-pictures',
} as const;
