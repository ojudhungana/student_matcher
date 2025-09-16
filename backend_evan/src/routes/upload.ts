import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';
import { randomUUID } from 'crypto';

const router = Router();

router.post('/photo/signed-url', requireAuth, async (req, res) => {
  const me = req.user!;
  const { ext } = (req.body || {}) as { ext?: string };
  const safeExt = (ext || 'jpg').replace('.', '').toLowerCase();
  const filename = `${me.id}/${randomUUID()}.${safeExt}`;

  try { await supabaseService.storage.createBucket('avatars', { public: true }); } catch {}

  const { data, error } = await supabaseService.storage
    .from('avatars')
    .createSignedUploadUrl(filename);
  if (error || !data) return res.status(500).json({ error: error?.message || 'Failed to create signed URL' });

  const publicUrl = supabaseService.storage.from('avatars').getPublicUrl(filename).data.publicUrl;

  res.json({ path: filename, signedUrl: data.signedUrl, publicUrl });
});

export default router;