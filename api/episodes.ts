import type { IncomingMessage, ServerResponse } from 'node:http';
import { REVALIDATE_SECONDS } from '../src/lib/youtube.ts';
import { fetchYouTubeEpisodes } from '../src/lib/youtube-server.ts';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ errorMessage: 'Method Not Allowed' });
    return;
  }

  const rawChannelId = req.query?.channelId;
  const channelId =
    typeof rawChannelId === 'string' ? rawChannelId : undefined;
  const forceRefresh = req.query?.refresh === '1';

  try {
    const data = await fetchYouTubeEpisodes(channelId, forceRefresh);
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS * 2}`,
    );
    res.status(200).json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Lỗi máy chủ khi tải dữ liệu RSS.';
    res.status(400).json({ errorMessage: message });
  }
}

