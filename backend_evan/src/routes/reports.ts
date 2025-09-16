import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';

const router = Router();

router.post('/report', requireAuth, async (req, res) => {
  const me = req.user!;
  const { reported_user_id, reason, details } = req.body as { reported_user_id: string; reason?: string; details?: string };
  if (!reported_user_id) return res.status(400).json({ error: 'reported_user_id required' });
  const { data, error } = await supabaseService
    .from('reports')
    .insert({ reporter_id: me.id, reported_user_id, reason: reason || null, details: details || null })
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ report: data?.[0] });
});

router.post('/block', requireAuth, async (req, res) => {
  const me = req.user!;
  const { blocked_id } = req.body as { blocked_id: string };
  if (!blocked_id) return res.status(400).json({ error: 'blocked_id required' });
  const { error } = await supabaseService
    .from('blocks')
    .insert({ blocker_id: me.id, blocked_id });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;