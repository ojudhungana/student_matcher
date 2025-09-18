<<<<<<< HEAD
=======
// Centralized environment variables and flags for API, Supabase, and app.
>>>>>>> aaa84261f8429e5f3b3bea0ebd897acd2a3f4f08
// Environment configuration
export const env = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // App
  APP_NAME: 'Campus Connect',
  APP_VERSION: '1.0.0',
  
  // Development
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Validation
if (env.IS_PROD && (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY)) {
  throw new Error('Missing required environment variables for production');
}
