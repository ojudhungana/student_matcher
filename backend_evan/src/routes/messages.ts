import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';

const router = Router();

router.get('/:match_id', requireAuth, async (req, res) => {
  const me = req.user!;
  const match_id = req.params.match_id;
  const { data: match, error: matchErr } = await supabaseService
    .from('matches')
    .select('*')
    .eq('id', match_id)
    .single();
  if (matchErr || !match) return res.status(404).json({ error: 'Match not found' });
  if (![match.user_a, match.user_b].includes(me.id)) return res.status(403).json({ error: 'Not your match' });

  const { data, error } = await supabaseService
    .from('messages')
    .select('*')
    .eq('match_id', match_id)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ messages: data });
});

router.post('/', requireAuth, async (req, res) => {
  const me = req.user!;
  const { match_id, content } = req.body as { match_id: string; content: string };
  if (!match_id || !content) return res.status(400).json({ error: 'match_id and content required' });

  const { data: match, error: matchErr } = await supabaseService
    .from('matches')
    .select('*')
    .eq('id', match_id)
    .single();
  if (matchErr || !match) return res.status(404).json({ error: 'Match not found' });
  if (![match.user_a, match.user_b].includes(me.id)) return res.status(403).json({ error: 'Not your match' });

  const { data, error } = await supabaseService
    .from('messages')
    .insert({ match_id, sender_id: me.id, content })
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: data?.[0] });
});

export default router;