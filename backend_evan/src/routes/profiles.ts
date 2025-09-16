import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';

const router = Router();

// ---------- enums & schema ----------
const YearEnum = z.enum(['freshman','sophomore','junior','senior','graduate','other']);
const CommuterEnum = z.enum(['commuter_other_city','commuter_huntsville','non_commuter']);

const PronounEnum = z.enum([
  'she/her','he/him','they/them','she/they','he/they'
]);

const ProfileSchema = z.object({
  name: z.string().min(1, 'name required'),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthday must be YYYY-MM-DD'),
  major: z.string().min(1, 'major required'),
  student_id_number: z.string().min(3, 'student id required'),
  pronouns: PronounEnum.optional().nullable(),
  year: YearEnum,
  commuter_status: CommuterEnum,
  bio: z.string().min(20, 'bio must be at least 20 chars').max(200, 'max 200 chars'),
  featured_tags: z.array(z.string()).max(5).optional().default([]),
  photos: z.array(z.string().url()).min(5, 'min 5 photos').max(10, 'max 10 photos')
});

// ---------- helpers ----------
const AVATAR_BUCKET = 'avatars';
const PUBLIC_BUCKET_BASE =
  (process.env.SUPABASE_URL || '').replace(/\/+$/,'') + `/storage/v1/object/public/${AVATAR_BUCKET}`;

// ---------- routes ----------

// who am I / current profile
router.get('/me', requireAuth, async (req, res) => {
  const user = req.user!;
  const { data, error } = await supabaseService
    .from('profiles_view')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  if (!data) return res.json({ profile: null });
  res.json({ profile: data });
});

// upsert profile (required fields enforced)
router.post('/', requireAuth, async (req, res) => {
  const user = req.user!;
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const p = parsed.data;

  const salt = await bcrypt.genSalt(10);
  const student_id_hash = await bcrypt.hash(p.student_id_number, salt);

  const row = {
    id: user.id,
    email: user.email,
    name: p.name,
    birthday: p.birthday,
    major: p.major,
    pronouns: p.pronouns ?? null,
    year: p.year,
    commuter_status: p.commuter_status,
    bio: p.bio,
    featured_tags: p.featured_tags ?? [],
    photo_url: p.photos?.[0] ?? null, // keep first for legacy mini card
    photos: p.photos,
    student_id_hash
  };

  const { data, error } = await supabaseService
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data?.[0] });
});

// create a signed upload URL for avatar/photos
router.post('/photo/signed-url', requireAuth, async (req, res) => {
  const user = req.user!;
  const extRaw = (req.body?.ext as string | undefined) || 'jpg';
  const ext = extRaw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
  const objectPath = `${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabaseService
    .storage
    .from(AVATAR_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data?.signedUrl) {
    return res.status(500).json({ error: error?.message || 'failed to sign upload url' });
  }

  const publicUrl = `${PUBLIC_BUCKET_BASE}/${objectPath}`;
  res.json({ signedUrl: data.signedUrl, path: objectPath, publicUrl });
});

// ---- tags: get my tags
router.get('/my-tags', requireAuth, async (req, res) => {
  const user = req.user!;
  const { data, error } = await supabaseService
    .from('user_tags_with_names')
    .select('name')
    .eq('user_id', user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tags: (data || []).map(r => r.name) });
});

// ---- tags: replace set (min 5, max 10)
router.put('/tags', requireAuth, async (req, res) => {
  const user = req.user!;
  let tags = (req.body?.tags as string[] | undefined) || [];
  tags = Array.from(new Set(tags.map(t => t.toLowerCase().trim()).filter(Boolean)));

  if (tags.length < 5 || tags.length > 10) {
    return res.status(400).json({ error: 'Pick between 5 and 10 tags.' });
  }

  // upsert tags by name
  const upserts = tags.map(name => ({ name }));
  const { data: tagRows, error: tagErr } = await supabaseService
    .from('tags')
    .upsert(upserts, { onConflict: 'name' })
    .select();
  if (tagErr) return res.status(500).json({ error: tagErr.message });

  const finalIds = new Set((tagRows || []).map(t => t.id));

  // current links
  const { data: existing, error: exErr } = await supabaseService
    .from('user_tags')
    .select('tag_id')
    .eq('user_id', user.id);
  if (exErr) return res.status(500).json({ error: exErr.message });

  const existingIds = new Set((existing || []).map(e => e.tag_id));
  const toInsert = [...finalIds].filter(id => !existingIds.has(id));
  const toDelete = [...existingIds].filter(id => !finalIds.has(id));

  if (toDelete.length) {
    const { error: delErr } = await supabaseService
      .from('user_tags')
      .delete()
      .eq('user_id', user.id)
      .in('tag_id', toDelete);
    if (delErr) return res.status(500).json({ error: delErr.message });
  }

  if (toInsert.length) {
    const rows = toInsert.map(id => ({ user_id: user.id, tag_id: id }));
    const { error: insErr } = await supabaseService
      .from('user_tags')
      .insert(rows);
    if (insErr) return res.status(500).json({ error: insErr.message });
  }

  res.json({ ok: true, count: finalIds.size });
});

export default router;
