import express from 'express';
import cors from 'cors';
import router from './api';
import { runner } from './services/runner';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', router);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  await runner.init();
  console.log(`[${new Date().toISOString()}] [INFO] server listening on port ${PORT}`);
});
