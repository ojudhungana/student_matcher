import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseService } from '../supabase.js';
import { scoreCandidate } from '../utils/matching.js';
const router = Router();
async function getMyProfile(userId) {
    const { data } = await supabaseService
        .from('profiles_view')
        .select('*')
        .eq('id', userId)
        .single();
    return data || null;
}
async function getMyTags(userId) {
    const { data } = await supabaseService
        .from('user_tags_with_names')
        .select('name')
        .eq('user_id', userId);
    return data?.map(r => r.name) || [];
}
function incompleteReasons(p) {
    const reasons = [];
    if (!p) {
        reasons.push('no profile');
        return reasons;
    }
    if (!p.name)
        reasons.push('name');
    if (!p.birthday)
        reasons.push('birthday');
    if (!p.major)
        reasons.push('major');
    if (!p.year)
        reasons.push('year');
    if (!p.commuter_status)
        reasons.push('commuter_status');
    if (!p.bio || typeof p.bio !== 'string' || p.bio.trim().length < 20 || p.bio.trim().length > 200) {
        reasons.push('bio (20–200 chars)');
    }
    if (!Array.isArray(p.photos) || p.photos.length < 5)
        reasons.push('at least 5 photos');
    if (Array.isArray(p.photos) && p.photos.length > 10)
        reasons.push('max 10 photos');
    return reasons;
}
const isComplete = (p) => incompleteReasons(p).length === 0;
router.get('/next', requireAuth, async (req, res) => {
    const me = req.user;
    // 1) Ensure MY profile is complete
    const myProfile = await getMyProfile(me.id);
    const reasons = incompleteReasons(myProfile);
    if (reasons.length) {
        return res.status(400).json({
            error: 'Complete your profile first.',
            missing: reasons
        });
    }
    // 2) Gather exclusions: myself, anyone I already liked/passed, and anyone I blocked / who blocked me
    const { data: already } = await supabaseService
        .from('swipes')
        .select('target_id')
        .eq('swiper_id', me.id);
    const excludeIds = new Set([me.id, ...(already?.map(r => r.target_id) || [])]);
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
    // 3) Candidate pool (we’ll also filter out INCOMPLETE profiles)
    const { data: pool, error } = await supabaseService
        .from('profiles_view')
        .select('*')
        .limit(1000);
    if (error)
        return res.status(500).json({ error: error.message });
    const candidates = (pool || [])
        .filter(c => !excludeIds.has(c.id))
        .filter(c => isComplete(c)); // hide incomplete users from everyone
    // 4) Build tag maps for scoring
    const { data: myTagsRows } = await supabaseService
        .from('user_tags_with_names')
        .select('name')
        .eq('user_id', me.id);
    const myTags = (myTagsRows || []).map(r => r.name);
    const { data: tagsRows } = await supabaseService
        .from('user_tags_with_names')
        .select('user_id,name')
        .in('user_id', candidates.map(c => c.id));
    const tagMap = new Map();
    (tagsRows || []).forEach(r => {
        const arr = tagMap.get(r.user_id) || [];
        arr.push(r.name);
        tagMap.set(r.user_id, arr);
    });
    // 5) Score and return the top suggestion
    const meInput = {
        id: me.id,
        major: myProfile.major,
        year: myProfile.year,
        commuter_status: myProfile.commuter_status,
        birthday: myProfile.birthday,
        tags: myTags,
    };
    const scored = candidates.map(c => ({
        candidate: c,
        score: scoreCandidate(meInput, {
            id: c.id,
            major: c.major,
            year: c.year,
            commuter_status: c.commuter_status,
            birthday: c.birthday,
            tags: tagMap.get(c.id) || []
        })
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0]?.candidate || null;
    res.json({ candidate: top });
});
// (Optional hard-guard: prevent like/pass if your profile is incomplete)
router.post('/like', requireAuth, async (req, res) => {
    const me = req.user;
    const myProfile = await getMyProfile(me.id);
    const reasons = incompleteReasons(myProfile);
    if (reasons.length)
        return res.status(400).json({ error: 'Complete your profile first.', missing: reasons });
    const { target_id } = req.body;
    if (!target_id)
        return res.status(400).json({ error: 'target_id required' });
    const { error } = await supabaseService
        .from('swipes')
        .insert({ swiper_id: me.id, target_id, action: 'like' });
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});
router.post('/pass', requireAuth, async (req, res) => {
    const me = req.user;
    const myProfile = await getMyProfile(me.id);
    const reasons = incompleteReasons(myProfile);
    if (reasons.length)
        return res.status(400).json({ error: 'Complete your profile first.', missing: reasons });
    const { target_id } = req.body;
    if (!target_id)
        return res.status(400).json({ error: 'target_id required' });
    const { error } = await supabaseService
        .from('swipes')
        .insert({ swiper_id: me.id, target_id, action: 'pass' });
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});
router.get('/matches', requireAuth, async (req, res) => {
    const me = req.user;
    const { data, error } = await supabaseService
        .from('matches_with_profiles')
        .select('*')
        .or(`user_a.eq.${me.id},user_b.eq.${me.id}`);
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ matches: data });
});
export default router;
