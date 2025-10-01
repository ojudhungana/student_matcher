-- Fix: Recreate the profiles_view to include pronouns and commuterStatus
-- Run this in Supabase SQL Editor

-- Drop the old view
DROP VIEW IF EXISTS public.profiles_view;

-- Create the updated view with all fields including pronouns and commuter_status
CREATE OR REPLACE VIEW public.profiles_view AS
SELECT 
  id, 
  email, 
  name, 
  age,
  age_range_min as "ageRangeMin",
  age_range_max as "ageRangeMax",
  major, 
  year,
  pronouns,
  commuter_status as "commuterStatus",
  profile_picture as "profilePicture",
  interests,
  classes,
  bio, 
  university,
  is_profile_complete as "isProfileComplete",
  created_at as "createdAt", 
  updated_at as "updatedAt"
FROM public.profiles;

-- Grant permissions
GRANT SELECT ON public.profiles_view TO authenticated;
GRANT SELECT ON public.profiles_view TO anon;

