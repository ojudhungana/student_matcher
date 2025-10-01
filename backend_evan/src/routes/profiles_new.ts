import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';

const router = Router();

// Profile schema matching frontend
const ProfileSchema = z.object({
  name: z.string().min(1, 'name required'),
  age: z.number().min(16).max(100),
  ageRangeMin: z.number().min(16).max(100).optional(),
  ageRangeMax: z.number().min(16).max(100).optional(),
  major: z.string().min(1, 'major required'),
  year: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
  profilePicture: z.string().url().optional().nullable(),
  interests: z.array(z.string()).optional().default([]),
  classes: z.array(z.string()).optional().default([]),
  bio: z.string().optional().nullable(),
  university: z.string().optional().default('UAH'),
});

// Get current user's profile
router.get('/me', requireAuth, async (req, res) => {
  const user = req.user!;
  const { data, error } = await supabaseService
    .from('profiles_view')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }
  
  if (!data) {
    return res.json({ profile: null });
  }
  
  res.json({ profile: data });
});

// Create or update profile
router.post('/', requireAuth, async (req, res) => {
  const user = req.user!;
  const parsed = ProfileSchema.safeParse(req.body);
  
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  
  const p = parsed.data;
  
  const row = {
    id: user.id,
    email: user.email,
    name: p.name,
    age: p.age,
    age_range_min: p.ageRangeMin ?? 18,
    age_range_max: p.ageRangeMax ?? 24,
    major: p.major,
    year: p.year,
    profile_picture: p.profilePicture ?? null,
    interests: p.interests ?? [],
    classes: p.classes ?? [],
    bio: p.bio ?? null,
    university: p.university ?? 'UAH',
    is_profile_complete: true, // Set to true when profile is created/updated
  };
  
  const { data, error } = await supabaseService
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
    
  if (error) {
    console.error('Profile upsert error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  // Transform to match frontend expectations
  const profile = {
    id: data.id,
    email: data.email,
    name: data.name,
    age: data.age,
    ageRangeMin: data.age_range_min,
    ageRangeMax: data.age_range_max,
    major: data.major,
    year: data.year,
    profilePicture: data.profile_picture,
    interests: data.interests,
    classes: data.classes,
    bio: data.bio,
    university: data.university,
    isProfileComplete: data.is_profile_complete,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
  
  res.json({ profile });
});

// Create a signed upload URL for profile picture
router.post('/photo/signed-url', requireAuth, async (req, res) => {
  const user = req.user!;
  const extRaw = (req.body?.ext as string | undefined) || 'jpg';
  const ext = extRaw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
  const objectPath = `${user.id}/${Date.now()}.${ext}`;
  
  const { data, error } = await supabaseService
    .storage
    .from('avatars')
    .createSignedUploadUrl(objectPath);
  
  if (error || !data?.signedUrl) {
    return res.status(500).json({ error: error?.message || 'failed to sign upload url' });
  }
  
  const publicUrl = supabaseService.storage
    .from('avatars')
    .getPublicUrl(objectPath).data.publicUrl;
    
  res.json({ signedUrl: data.signedUrl, path: objectPath, publicUrl });
});

export default router;

