import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REVALIDATE_SECONDS } from './src/lib/youtube.ts';
import { fetchYouTubeEpisodes } from './src/lib/youtube-server.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/episodes', async (req, res) => {
    const channelId =
      typeof req.query.channelId === 'string' ? req.query.channelId : undefined;
    const forceRefresh = req.query.refresh === '1';

    try {
      const data = await fetchYouTubeEpisodes(channelId, forceRefresh);
      res.setHeader(
        'Cache-Control',
        `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS * 2}`,
      );
      res.json(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Lỗi máy chủ khi tải dữ liệu RSS.';
      res.status(400).json({
        errorMessage: message,
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Goc Bep Audio listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
