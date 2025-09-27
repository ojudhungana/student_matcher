import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import apiRouter from './routes/api.js';
const app = express();
// Applies middleware before mounting routes
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));
// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));
// Plural path aliases expected by the frontend (GET only)
app.get('/api/profiles/me', (_req, res) => {
    res.redirect(308, '/api/profile');
});
app.get('/api/profiles/:id', (req, res) => {
    res.redirect(308, `/api/profile/${encodeURIComponent(req.params.id)}`);
});
// Mounts API router
app.use('/api', apiRouter);
const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
    console.log(`UAH Friends backend listening on http://localhost:${port}`);
});
