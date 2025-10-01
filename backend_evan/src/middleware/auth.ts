import type { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../supabase.js';
import type { AuthedRequestUser } from '../types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthedRequestUser;
      accessToken?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization Bearer token' });

    const { data, error } = await supabaseService.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

    const email = data.user.email || '';
    // Temporarily disabled for testing - uncomment in production
    // const allowed = (process.env.ALLOWED_EMAIL_DOMAIN || '').toLowerCase();
    // if (!email.toLowerCase().endsWith(`@${allowed}`)) {
    //   return res.status(403).json({ error: `Email must be @${allowed}` });
    // }

    req.user = { id: data.user.id, email };
    req.accessToken = token;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Auth middleware failure' });
  }
}