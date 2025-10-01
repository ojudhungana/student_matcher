-- Migration: Add pronouns and commuter_status to profiles table
-- Run this in your Supabase SQL Editor

-- Add the new columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pronouns text,
ADD COLUMN IF NOT EXISTS commuter_status text CHECK (commuter_status IN ('on-campus', 'off-campus', 'commuter'));

-- Recreate the view to include new fields
DROP VIEW IF EXISTS public.profiles_view;

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

-- Grant permissions on the view
GRANT SELECT ON public.profiles_view TO authenticated;
GRANT SELECT ON public.profiles_view TO anon;

