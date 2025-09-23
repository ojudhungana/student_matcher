import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import apiRouter from './routes/api.js';

const app = express();
app.use('/api', apiRouter);
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));


const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`UAH Friends backend listening on http://localhost:${port}`);
});