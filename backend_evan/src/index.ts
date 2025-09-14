import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import profiles from './routes/profiles.js';
import match from './routes/match.js';
import messages from './routes/messages.js';
import reports from './routes/reports.js';
import upload from './routes/upload.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/profiles', profiles);
app.use('/match', match);
app.use('/messages', messages);
app.use('/moderation', reports);
app.use('/profiles', upload);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`UAH Friends backend listening on http://localhost:${port}`);
});

// random comment