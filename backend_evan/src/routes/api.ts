import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';
import { scoreCandidate } from '../utils/matching.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const AVATAR_BUCKET = 'avatars';

function getUserId(req: any): string | undefined {
  return req.user?.id || req.auth?.user?.id || req.userId || req?.supabaseUser?.id;
}

const SettingsSchema = z.object({
  notificationsEmail: z.boolean().optional(),
  notificationsPush: z.boolean().optional(),
  discoveryEnabled: z.boolean().optional(),
});

/* ------------------------- small helper utilities ------------------------- */

// Turns YYYY-MM-DD birthday into an age
function calcAge(birthday?: string | null): number | null {
  if (!birthday) return null;
  const dob = new Date(birthday);
  if (isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// Capitalizes school year
function capitalizeYear(y?: string | null) {
  if (!y) return null;
  const m: Record<string, string> = { freshman:'Freshman', sophomore:'Sophomore', junior:'Junior', senior:'Senior', graduate:'Graduate', other:'Other' };
  return m[y] || y;
}

// Accepts year from UI and maps to enum
function normalizeYear(input?: string | null) {
  if (!input) return null;
  const key = input.toLowerCase();
  const map: Record<string, string> = {
    freshman:'freshman', sophomore:'sophomore', junior:'junior', senior:'senior', graduate:'graduate', grad:'graduate', other:'other'
  };
  return map[key] || 'other';
}

// If UI only provides an age, fabricates an approximate birthday so age can be computed
function approxBirthdayFromAge(age?: number | null): string | null {
  if (typeof age !== 'number' || !isFinite(age) || age <= 0) return null;
  const now = new Date();
  const year = now.getUTCFullYear() - Math.round(age);
  return `${year}-07-01`; // mid-year placeholder
}

// Fetches a user profile from the DB view
async function getProfile(userId: string) {
  const { data, error } = await supabaseService.from('profiles_view').select('*').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

// Gets a user’s interest tags as plain strings
async function getTags(userId: string): Promise<string[]> {
  const { data, error } = await supabaseService.from('user_tags_with_names').select('name').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return (data || []).map(r => r.name);
}

// Checks if user profile is complete
function isCompleteProfile(p: any): boolean {
  if (!p) return false;
  if (!p.name || !p.birthday || !p.major || !p.year || !p.commuter_status) return false;
  if (!p.bio || typeof p.bio !== 'string' || p.bio.trim().length < 20 || p.bio.trim().length > 200) return false;
  if (!Array.isArray(p.photos) || p.photos.length < 5 || p.photos.length > 10) return false;
  return true;
}

// Converts DB profile + tags into the shape frontend expects
function toUserProfile(p: any, tags: string[]) {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    age: calcAge(p.birthday) ?? 0,
    ageRangeMin: 18, // placeholder
    ageRangeMax: 99, // placeholder
    major: p.major,
    year: capitalizeYear(p.year) || 'Other',
    profilePicture: (Array.isArray(p.photos) && p.photos[0]) || p.photo_url || null,
    interests: tags,
    classes: [], // not implemented yet
    bio: p.bio || '',
    university: 'University of Alabama in Huntsville',
    isProfileComplete: isCompleteProfile(p),
  };
}

/* --------------------------------- AUTH ---------------------------------- */

// Returns the signed-in user’s profile in UI shape
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

// GETs User profile
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

// GETs other users' public profile preview
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

// PUTs the current user’s profile. Accepts flexible input from the new UI
//  and maps it to our DB shape. Also replaces the user’s tags if provided
router.put('/profile', requireAuth, async (req, res) => {
  const me = req.user!;
  try {
    const body = req.body || {};

    // Normalizes common fields
    const major = body.major ?? '';
    const yearNorm = normalizeYear(body.year);
    const birthday = body.birthday || approxBirthdayFromAge(body.age) || null;
    const bio = body.bio ?? '';
    const photos = Array.isArray(body.photos) ? body.photos : undefined;
    const interests: string[] = Array.isArray(body.interests) ? body.interests : [];

    // Replaces tag set if provided
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

    // Upserts the profile row
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

// POSTs and Accepts file upload from user, stores it in Supabase
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

/* --------------------------- MATCHING / SUGGESTIONS --------------------------- */

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
    const { data: tagsRows } = await supabaseService
      .from('user_tags_with_names')
      .select('user_id,name')
      .in('user_id', candidates.map(c => c.id));
    const tagMap = new Map<string, string[]>();
    (tagsRows || []).forEach(r => {
      const arr = tagMap.get(r.user_id) || [];
      arr.push(r.name);
      tagMap.set(r.user_id, arr);
    });

    // Scores candidates
    const meInput = { id: me.id, major: myProfile!.major, year: myProfile!.year, commuter_status: myProfile!.commuter_status, birthday: myProfile!.birthday, tags: myTags };
    const scored = candidates
      .map(c => {
        const cTags = tagMap.get(c.id) || [];
        return {
          candidate: c,
          tags: cTags,
          score: scoreCandidate(meInput, { id: c.id, major: c.major, year: c.year, commuter_status: c.commuter_status, birthday: c.birthday, tags: cTags }),
        };
      })
      .sort((a, b) => b.score - a.score);

    // Pagination
    const start = (page - 1) * limit;
    const pageItems = scored.slice(start, start + limit);

    // Maps to the frontend’s shape
    const dataOut = await Promise.all(
      pageItems.map(async (item) => {
        const user = toUserProfile(item.candidate, item.tags);
        const shared = user.interests.filter((x: string) => myTags.includes(x));
        return {
          id: `sugg_${item.candidate.id}`,
          user,
          sharedInterests: shared,
          sharedClasses: [],
          compatibilityScore: Math.round(item.score),
        };
      })
    );

    res.json({
      data: dataOut,
      pagination: {
        page,
        limit,
        total: scored.length,
        totalPages: Math.ceil(scored.length / limit) || 1,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

// POSTs alias for liking someone
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

// POSTs alias for passing on someone
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
// GETs and lists user's matches in shape of UI
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
        isProfileComplete: true,
      };
      return {
        id: m.match_id,
        user: other,
        matchedAt: m.created_at,
        lastMessageAt: undefined,
        sharedInterests: [],
        sharedClasses: [],
      };
    });

    res.json({ data: out, pagination: { page: 1, limit: out.length, total: out.length, totalPages: 1 } });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

//  GETs basic details of other user’s face/name/photo
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
        isProfileComplete: true,
      },
      matchedAt: data.created_at,
      lastMessageAt: undefined,
      sharedInterests: [],
      sharedClasses: [],
    };
    res.json({ data: out });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed' });
  }
});

/* -------------------------- SETTINGS & ACCOUNT --------------------------- */

router.put('/settings', requireAuth, async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const parsed = SettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });

  const { data: current, error: loadErr } = await supabaseService
    .from('profiles')
    .select('settings')
    .eq('id', userId)
    .single();
  if (loadErr) return res.status(500).json({ error: loadErr.message });

  const merged = { ...(current?.settings ?? {}), ...parsed.data };

  const { data, error } = await supabaseService
    .from('profiles')
    .update({ settings: merged })
    .eq('id', userId)
    .select('settings')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data.settings);
});

const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;

// DELETEs /api/account
// Soft-deletes the profile and scrub non-required fields. Optionally hard-deletes Auth user
router.delete('/account', requireAuth, async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { error } = await supabaseService
    .from('profiles')
    .update({
      deleted_at: new Date().toISOString(),
      bio: null,
      featured_tags: [],
      photo_url: null,
    } as any)
    .eq('id', userId);

  if (error) return res.status(500).json({ error: error.message });

  // Optional hard delete of the Auth user (server-only)
  if (supabaseAdmin) {
    try {
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (delErr) console.error('admin deleteUser failed:', delErr);
    } catch (e) {
      console.error('admin deleteUser exception:', e);
    }
  }

  return res.status(204).send();
});

/* ------------------------------ ROUTE ALIASES ---------------------------- */
// Aliases to match frontend pluralized paths (GET only)
router.get('/profiles/me', (_req, res) => {
  res.redirect(308, '/api/profile');
});

router.get('/profiles/:id', (req, res) => {
  res.redirect(308, `/api/profile/${encodeURIComponent(req.params.id)}`);
});

export default router;

