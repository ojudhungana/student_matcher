import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';

const router = Router();

// Simple compatibility scoring
function scoreCandidate(me: any, candidate: any): number {
  let score = 50; // Base score
  
  // Same major: +20
  if (me.major === candidate.major) score += 20;
  
  // Same year: +10
  if (me.year === candidate.year) score += 10;
  
  // Age compatibility: +15 if within their age range
  if (candidate.age >= me.ageRangeMin && candidate.age <= me.ageRangeMax) {
    score += 15;
  }
  
  // Shared interests: +2 per shared interest (max 20)
  const sharedInterests = me.interests.filter((i: string) => 
    candidate.interests.includes(i)
  );
  score += Math.min(sharedInterests.length * 2, 20);
  
  // Shared classes: +3 per shared class (max 15)
  const sharedClasses = me.classes.filter((c: string) => 
    candidate.classes.includes(c)
  );
  score += Math.min(sharedClasses.length * 3, 15);
  
  return Math.min(score, 100);
}

// Get next match suggestion
router.get('/next', requireAuth, async (req, res) => {
  const me = req.user!;
  
  // Get my profile
  const { data: myProfile, error: myError } = await supabaseService
    .from('profiles')
    .select('*')
    .eq('id', me.id)
    .single();
    
  if (myError || !myProfile) {
    return res.status(500).json({ error: 'Failed to fetch your profile' });
  }
  
  if (!myProfile.is_profile_complete) {
    return res.status(400).json({ 
      error: 'Complete your profile first.',
      missing: ['profile setup required']
    });
  }
  
  // Get users I've already swiped on
  const { data: swipedUsers } = await supabaseService
    .from('swipes')
    .select('target_id')
    .eq('swiper_id', me.id);
    
  const excludeIds = new Set<string>([
    me.id, 
    ...(swipedUsers?.map(s => s.target_id) || [])
  ]);
  
  // Get blocked users
  const { data: blockedByMe } = await supabaseService
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', me.id);
  blockedByMe?.forEach(b => excludeIds.add(b.blocked_id));
  
  const { data: blockedMe } = await supabaseService
    .from('blocks')
    .select('blocker_id')
    .eq('blocked_id', me.id);
  blockedMe?.forEach(b => excludeIds.add(b.blocker_id));
  
  // Get candidate pool (completed profiles only)
  const { data: pool, error: poolError } = await supabaseService
    .from('profiles')
    .select('*')
    .eq('is_profile_complete', true)
    .limit(1000);
    
  if (poolError) {
    return res.status(500).json({ error: poolError.message });
  }
  
  const candidates = (pool || []).filter(c => !excludeIds.has(c.id));
  
  if (candidates.length === 0) {
    return res.json({ candidate: null });
  }
  
  // Score and sort candidates
  const scored = candidates.map(c => ({
    candidate: c,
    score: scoreCandidate(myProfile, c)
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  // Return top candidate transformed to frontend format
  const top = scored[0]?.candidate;
  if (!top) {
    return res.json({ candidate: null });
  }
  
  // Calculate shared interests and classes
  const sharedInterests = (myProfile.interests || []).filter((i: string) => 
    (top.interests || []).includes(i)
  );
  const sharedClasses = (myProfile.classes || []).filter((c: string) => 
    (top.classes || []).includes(c)
  );
  
  const result = {
    id: top.id,
    email: top.email,
    name: top.name,
    age: top.age,
    ageRangeMin: top.age_range_min,
    ageRangeMax: top.age_range_max,
    major: top.major,
    year: top.year,
    profilePicture: top.profile_picture,
    interests: top.interests || [],
    classes: top.classes || [],
    bio: top.bio,
    university: top.university,
    isProfileComplete: top.is_profile_complete,
    createdAt: top.created_at,
    updatedAt: top.updated_at,
    sharedInterests,
    sharedClasses,
    compatibilityScore: scored[0].score,
  };
  
  res.json({ candidate: result });
});

// Like a user
router.post('/like', requireAuth, async (req, res) => {
  const me = req.user!;
  const { target_id } = req.body as { target_id: string };
  
  if (!target_id) {
    return res.status(400).json({ error: 'target_id required' });
  }
  
  const { error } = await supabaseService
    .from('swipes')
    .insert({ swiper_id: me.id, target_id, action: 'like' });
    
  if (error) {
    console.error('Like error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ ok: true });
});

// Pass on a user
router.post('/pass', requireAuth, async (req, res) => {
  const me = req.user!;
  const { target_id } = req.body as { target_id: string };
  
  if (!target_id) {
    return res.status(400).json({ error: 'target_id required' });
  }
  
  const { error } = await supabaseService
    .from('swipes')
    .insert({ swiper_id: me.id, target_id, action: 'pass' });
    
  if (error) {
    console.error('Pass error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ ok: true });
});

// Get all matches
router.get('/matches', requireAuth, async (req, res) => {
  const me = req.user!;
  
  const { data, error } = await supabaseService
    .from('matches_with_profiles')
    .select('*')
    .or(`user_a.eq.${me.id},user_b.eq.${me.id}`);
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ matches: data || [] });
});

export default router;

