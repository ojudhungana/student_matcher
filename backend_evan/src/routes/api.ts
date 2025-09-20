/**
 * /api adapter routes
 * -------------------
 * This file exposes endpoints the new frontend expects, and maps them to our existing backend logic.
 * All routes (except /health elsewhere) require a Supabase Access Token in the Authorization header.
 */

import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';
import { scoreCandidate } from '../utils/matching.js';

const router = Router();

// Multer handles file uploads from forms (we keep files in memory; size capped at 8 MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Our public Supabase Storage bucket for profile pictures
const AVATAR_BUCKET = 'avatars';

/* ------------------------- small helper utilities ------------------------- */

// Turn YYYY-MM-DD birthday into a number (e.g., 21). If missing, return null.
function calcAge(birthday?: string | null): number | null {
  if (!birthday) return null;
  const dob = new Date(birthday);
  if (isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// Make stored year enum look nice for the UI
function capitalizeYear(y?: string | null) {
  if (!y) return null;
  const m: Record<string,string> = { freshman:'Freshman', sophomore:'Sophomore', junior:'Junior', senior:'Senior', graduate:'Graduate', other:'Other' };
  return m[y] || y;
}

// Accept flexible year from UI and map to our enum
function normalizeYear(input?: string | null) {
  if (!input) return null;
  const key = input.toLowerCase();
  const map: Record<string,string> = {
    'freshman':'freshman','sophomore':'sophomore','junior':'junior','senior':'senior','graduate':'graduate','grad':'graduate','other':'other'
  };
  return map[key] || 'other';
}

// If UI only provides an age, fabricate an approximate birthday so age can be computed later
function approxBirthdayFromAge(age?: number | null): string | null {
  if (typeof age !== 'number' || !isFinite(age) || age <= 0) return null;
  const now = new Date();
  const year = now.getUTCFullYear() - Math.round(age);
  return `${year}-07-01`; // mid-year placeholder
}

// Fetch my (or someone else’s) profile from the DB view
async function getProfile(userId: string) {
  const { data, error } = await supabaseService.from('profiles_view').select('*').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

// Get a user’s interest tags as plain strings
async function getTags(userId: string): Promise<string[]> {
  const { data, error } = await supabaseService.from('user_tags_with_names').select('name').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return (data || []).map(r => r.name);
}

// Quick completeness check used to guard matching
function isCompleteProfile(p: any): boolean {
  if (!p) return false;
  if (!p.name || !p.birthday || !p.major || !p.year || !p.commuter_status) return false;
  if (!p.bio || typeof p.bio !== 'string' || p.bio.trim().length < 20 || p.bio.trim().length > 200) return false;
  if (!Array.isArray(p.photos) || p.photos.length < 5 || p.photos.length > 10) return false;
  return true;
}

// Convert DB profile + tags into the shape the new frontend expects
function toUserProfile(p: any, tags: string[]) {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    age: calcAge(p.birthday) ?? 0,
    ageRangeMin: 18, // not stored yet; placeholder for UI
    ageRangeMax: 99, // not stored yet; placeholder for UI
    major: p.major,
    year: capitalizeYear(p.year) || 'Other',
    profilePicture: (Array.isArray(p.photos) && p.photos[0]) || p.photo_url || null,
    interests: tags,
    classes: [], // not implemented yet
    bio: p.bio || '',
    university: 'University of Alabama in Huntsville',
    isProfileComplete: isCompleteProfile(p)
  };
}

/* --------------------------------- AUTH ---------------------------------- */
/** GET /api/auth/me
 *  Returns the signed-in user’s profile in the new UI shape.
 */
router.get('/auth/me', requireAuth, async (req, res) => {
  try {
    const me = req.user!;
    const p = await getProfile(me.id);
    const tags = await getTags(me.id);
    if (!p) return res.json({ data: null, message: 'No profile' });
    return res.json({ data: toUserProfile(p, tags) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed' });
  }
});

/* -------------------------------- PROFILE -------------------------------- */
/** GET /api/profile
 *  My profile (same as /auth/me but under /profile).
 */
router.get('/profile', requireAuth, async (req, res) => {
  const me = req.user!;
  try {
    const p = await getProfile(me.id);
    const tags = await getTags(me.id);
    if (!p) return res.json({ data: null, message: 'No profile' });
    res.json({ data: toUserProfile(p, tags) });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/** GET /api/profile/:id
 *  Someone else’s public profile preview (for detail view).
 */
router.get('/profile/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const p = await getProfile(id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    const tags = await getTags(id);
    res.json({ data: toUserProfile(p, tags) });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/** PUT /api/profile
 *  Upserts the current user’s profile. Accepts flexible input from the new UI
 *  and maps it to our DB shape. Also replaces the user’s tags if provided.
 */
router.put('/profile', requireAuth, async (req, res) => {
  const me = req.user!;
  try {
    const body = req.body || {};

    // Normalize common fields
    const major = body.major ?? '';
    const yearNorm = normalizeYear(body.year);
    const birthday = body.birthday || approxBirthdayFromAge(body.age) || null;
    const bio = body.bio ?? '';
    const photos = Array.isArray(body.photos) ? body.photos : undefined;
    const interests: string[] = Array.isArray(body.interests) ? body.interests : [];

    // Replace tag set if provided
    if (interests.length) {
      const upserts = interests.map((name: string) => ({ name: String(name).toLowerCase().trim() })).filter(r => r.name);
      const { data: tagRows, error: tagErr } = await supabaseService.from('tags').upsert(upserts, { onConflict: 'name' }).select();
      if (tagErr) return res.status(500).json({ error: tagErr.message });

      const finalIds = new Set((tagRows || []).map(t => t.id));
      const { data: existing } = await supabaseService.from('user_tags').select('tag_id').eq('user_id', me.id);
      const existingIds = new Set((existing || []).map(e => e.tag_id));

      const toInsert = [...finalIds].filter(id => !existingIds.has(id)).map(id => ({ user_id: me.id, tag_id: id }));
      const toDelete = [...existingIds].filter(id => !finalIds.has(id));

      if (toDelete.length) await supabaseService.from('user_tags').delete().eq('user_id', me.id).in('tag_id', toDelete);
      if (toInsert.length) await supabaseService.from('user_tags').insert(toInsert);
    }

    // Upsert the profile row
    const row: any = {
      id: me.id,
      email: me.email,
      name: body.name,
      birthday,
      major,
      year: yearNorm,
      commuter_status: body.commuter_status || 'non_commuter',
      bio,
    };
    if (photos) {
      row.photos = photos;
      row.photo_url = photos[0] || null;
    }

    const { data, error } = await supabaseService.from('profiles').upsert(row, { onConflict: 'id' }).select();
    if (error) return res.status(500).json({ error: error.message });

    const saved = data?.[0];
    const tags = await getTags(me.id);
    return res.json({ data: toUserProfile(saved, tags) });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

 //  Accepts file upload from user, stores it in Supabase Storage (public),
router.post('/profile/upload-picture', requireAuth, upload.single('file'), async (req, res) => {
  const me = req.user!;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'file required' });

  try {
    
    const ext = file.originalname.split('.').pop() || 'jpg';
    const path = `${me.id}/${Date.now()}.${ext}`;

    const { error } = await supabaseService.storage.from(AVATAR_BUCKET).upload(path, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false,
    });
    if (error) return res.status(500).json({ error: error.message });

    const publicUrl = supabaseService.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
    res.json({ data: { url: publicUrl } });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});


// Returns a list of best matches for user.
router.get('/match/suggestions', requireAuth, async (req, res) => {
  const me = req.user!;
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit || '10'), 10) || 10));

  try {
    const myProfile = await getProfile(me.id);
    if (!isCompleteProfile(myProfile)) {
      return res.status(400).json({ error: 'Complete your profile first.' });
    }

    // Excludes certain people from being in matching pool
    const exclude = new Set<string>([me.id]);
    const { data: already } = await supabaseService.from('swipes').select('target_id').eq('swiper_id', me.id);
    already?.forEach(r => exclude.add(r.target_id));
    const { data: blockedByMe } = await supabaseService.from('blocks').select('blocked_id').eq('blocker_id', me.id);
    blockedByMe?.forEach(b => exclude.add(b.blocked_id));
    const { data: blockedMe } = await supabaseService.from('blocks').select('blocker_id').eq('blocked_id', me.id);
    blockedMe?.forEach(b => exclude.add(b.blocker_id));

    // Possible pool of people to match with
    const { data: pool, error } = await supabaseService.from('profiles_view').select('*').limit(1000);
    if (error) return res.status(500).json({ error: error.message });
    const candidates = (pool || []).filter(c => !exclude.has(c.id)).filter(isCompleteProfile);

    // User Tags
    const myTags = await getTags(me.id);
    const { data: tagsRows } = await supabaseService.from('user_tags_with_names').select('user_id,name').in('user_id', candidates.map(c => c.id));
    const tagMap = new Map<string, string[]>();
    (tagsRows || []).forEach(r => {
      const arr = tagMap.get(r.user_id) || [];
      arr.push(r.name);
      tagMap.set(r.user_id, arr);
    });

    // Score candidates
    const meInput = { id: me.id, major: myProfile!.major, year: myProfile!.year, commuter_status: myProfile!.commuter_status, birthday: myProfile!.birthday, tags: myTags };
    const scored = candidates.map(c => {
      const cTags = tagMap.get(c.id) || [];
      return {
        candidate: c,
        tags: cTags,
        score: scoreCandidate(meInput, { id: c.id, major: c.major, year: c.year, commuter_status: c.commuter_status, birthday: c.birthday, tags: cTags })
      };
    }).sort((a,b) => b.score - a.score);

    // Pagination
    const start = (page - 1) * limit;
    const pageItems = scored.slice(start, start + limit);

    // Map to the frontend’s expected shape
    const dataOut = await Promise.all(pageItems.map(async (item) => {
      const user = toUserProfile(item.candidate, item.tags);
      const shared = user.interests.filter((x: string) => myTags.includes(x));
      return {
        id: `sugg_${item.candidate.id}`,
        user,
        sharedInterests: shared,
        sharedClasses: [],
        compatibilityScore: Math.round(item.score)
      };
    }));

    res.json({
      data: dataOut,
      pagination: {
        page,
        limit,
        total: scored.length,
        totalPages: Math.ceil(scored.length / limit) || 1
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/** POST /api/match/connect
 *  Alias for “like” a user.
 */
router.post('/match/connect', requireAuth, async (req, res) => {
  const me = req.user!;
  const targetUserId = req.body?.targetUserId as string;
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });
  try {
    const myProfile = await getProfile(me.id);
    if (!isCompleteProfile(myProfile)) return res.status(400).json({ error: 'Complete your profile first.' });
    const { error } = await supabaseService.from('swipes').insert({ swiper_id: me.id, target_id: targetUserId, action: 'like' });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data: { id: `req_${Date.now()}`, fromUserId: me.id, toUserId: targetUserId, status: 'pending', createdAt: new Date().toISOString() } });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/** POST /api/match/skip
 *  Alias for “pass” a user (never show again).
 */
router.post('/match/skip', requireAuth, async (req, res) => {
  const me = req.user!;
  const targetUserId = req.body?.targetUserId as string;
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });
  try {
    const myProfile = await getProfile(me.id);
    if (!isCompleteProfile(myProfile)) return res.status(400).json({ error: 'Complete your profile first.' });
    const { error } = await supabaseService.from('swipes').insert({ swiper_id: me.id, target_id: targetUserId, action: 'pass' });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data: null });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/* ------------------------------- CONNECTIONS ----------------------------- */
/** GET /api/connections
 *  List my mutual matches in a simple shape for the UI.
 */
router.get('/connections', requireAuth, async (req, res) => {
  const me = req.user!;
  try {
    const { data, error } = await supabaseService.from('matches_with_profiles').select('*').or(`user_a.eq.${me.id},user_b.eq.${me.id}`);
    if (error) return res.status(500).json({ error: error.message });

    const out = (data || []).map((m: any) => {
      const otherId = m.user_a === me.id ? m.user_b : m.user_a;
      const other = {
        id: otherId,
        email: null,
        name: m.user_a === me.id ? m.user_b_name : m.user_a_name,
        age: 0,
        ageRangeMin: 0,
        ageRangeMax: 0,
        major: '',
        year: 'Other',
        profilePicture: m.user_a === me.id ? m.user_b_photo : m.user_a_photo,
        interests: [],
        classes: [],
        bio: '',
        university: 'University of Alabama in Huntsville',
        isProfileComplete: true
      };
      return {
        id: m.match_id,
        user: other,
        matchedAt: m.created_at,
        lastMessageAt: undefined,
        sharedInterests: [],
        sharedClasses: []
      };
    });

    res.json({ data: out, pagination: { page: 1, limit: out.length, total: out.length, totalPages: 1 } });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/** GET /api/connections/:id
 *  Basic details for a single connection (other user’s face/name/photo).
 */
router.get('/connections/:id', requireAuth, async (req, res) => {
  const me = req.user!;
  const id = req.params.id;
  try {
    const { data, error } = await supabaseService.from('matches_with_profiles').select('*').eq('match_id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Not found' });

    const otherId = data.user_a === me.id ? data.user_b : data.user_a;
    const otherName = data.user_a === me.id ? data.user_b_name : data.user_a_name;
    const otherPhoto = data.user_a === me.id ? data.user_b_photo : data.user_a_photo;

    const out = {
      id: data.match_id,
      user: {
        id: otherId,
        email: null,
        name: otherName,
        age: 0,
        ageRangeMin: 0,
        ageRangeMax: 0,
        major: '',
        year: 'Other',
        profilePicture: otherPhoto,
        interests: [],
        classes: [],
        bio: '',
        university: 'University of Alabama in Huntsville',
        isProfileComplete: true
      },
      matchedAt: data.created_at,
      lastMessageAt: undefined,
      sharedInterests: [],
      sharedClasses: []
    };
    res.json({ data: out });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/* ------------------------------ simple stubs ----------------------------- */
// Settings/account endpoints your UI might call; safe no-ops until we flesh them out
router.put('/settings', requireAuth, async (_req, res) => {
  res.json({ data: null, message: 'Settings update not implemented yet' });
});
router.delete('/account', requireAuth, async (_req, res) => {
  res.json({ data: null, message: 'Account deletion not implemented yet' });
});

export default router;
