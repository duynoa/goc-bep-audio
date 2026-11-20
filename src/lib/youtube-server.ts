import Parser from 'rss-parser';
import type { Episode, YouTubeFeedResponse } from '../features/episodes/types.ts';
import {
  FALLBACK_COVER_IMAGES,
  PLACEHOLDER_CHANNEL_ID,
  REVALIDATE_SECONDS,
  buildYouTubeRssUrl,
  cleanEpisodeTitle,
  extractEpisodeNumber,
  formatVietnameseDate,
  getChannelWebUrl,
  getEmbedUrl,
  getWatchUrl,
  getYouTubeAppSchemeUrl,
  isPlaceholderChannelId,
} from './youtube.ts';

interface YouTubeCustomFeed {
  title?: string;
  link?: string;
  'yt:channelId'?: string;
}

interface YouTubeMediaThumbnail {
  $?: {
    url?: string;
  };
}

interface YouTubeMediaGroup {
  'media:thumbnail'?: YouTubeMediaThumbnail[];
  'media:description'?: string[];
}

interface YouTubeCustomItem {
  id?: string;
  'yt:videoId'?: string;
  'media:group'?: YouTubeMediaGroup;
  author?: string;
}

const parser = new Parser<YouTubeCustomFeed, YouTubeCustomItem>({
  timeout: 10000,
  headers: {
    'User-Agent': 'GocBepAudio/1.0 (+https://youtube.com)',
    Accept: 'application/atom+xml, application/xml, text/xml',
  },
  customFields: {
    feed: ['yt:channelId'],
    item: ['yt:videoId', 'media:group', 'id'],
  },
});

interface CacheEntry {
  expiresAt: number;
  data: YouTubeFeedResponse;
}

const feedCache = new Map<string, CacheEntry>();

function buildSampleEpisodes(): Episode[] {
  const now = Date.now();
  const samples = [
    {
      videoId: 'sample-tap-18',
      title: 'Tập 18: Chuyến Tàu Đêm Qua Đèo Hải Vân & Bức Thư Chưa Gửi',
      daysAgo: 1,
      description:
        'Giọng đọc trầm ấm bên tiếng mưa khuya và bếp than hồng. Kết nối Channel ID YouTube của bạn để tự động đồng bộ tập mới.',
      cover: FALLBACK_COVER_IMAGES[0],
    },
    {
      videoId: 'sample-tap-17',
      title: 'Tập 17: Ánh Đèn Dầu Nơi Chái Bếp Cũ Của Ngoại',
      daysAgo: 4,
      description:
        'Ký ức những đêm mất điện vùng quê, mùi khói bếp rơm và câu chuyện cổ ngoại kể trước giờ đi ngủ.',
      cover: FALLBACK_COVER_IMAGES[1],
    },
    {
      videoId: 'sample-tap-16',
      title: 'Tập 16: Quán Cà Phê Nhỏ Cuối Ngõ Sau Mười Hai Giờ Đêm',
      daysAgo: 8,
      description:
        'Những người khách lạ ghé trú mưa và mảnh ký ức bỏ quên trên chiếc bàn gỗ cũ.',
      cover: FALLBACK_COVER_IMAGES[0],
    },
    {
      videoId: 'sample-tap-15',
      title: 'Tập 15: Mùa Gió Bấc Về Trên Triền Đê Làng',
      daysAgo: 12,
      description:
        'Truyện ngắn đồng quê nhẹ nhàng giúp thả lỏng tâm trí trước giấc ngủ sâu.',
      cover: FALLBACK_COVER_IMAGES[1],
    },
    {
      videoId: 'sample-tap-14',
      title: 'Tập 14: Người Đưa Thư Ở Thị Trấn Sương Mù',
      daysAgo: 17,
      description:
        'Một câu chuyện chậm rãi về sự kiên nhẫn, những lá thư viết tay và bình yên muộn màng.',
      cover: FALLBACK_COVER_IMAGES[0],
    },
  ];

  return samples.map((item) => {
    const publishedAt = new Date(now - item.daysAgo * 86400_000).toISOString();
    return {
      id: item.videoId,
      videoId: item.videoId,
      episodeNumber: extractEpisodeNumber(item.title),
      title: item.title,
      cleanTitle: cleanEpisodeTitle(item.title),
      publishedAt,
      formattedDate: formatVietnameseDate(publishedAt),
      thumbnailUrl: item.cover,
      youtubeUrl: 'https://www.youtube.com',
      deepLinkUrl: 'vnd.youtube://',
      embedUrl: '',
      description: item.description,
      isSample: true,
    };
  });
}

function extractVideoId(item: YouTubeCustomItem & Parser.Item): string {
  if (item['yt:videoId']) {
    return item['yt:videoId'].trim();
  }
  if (item.id && item.id.startsWith('yt:video:')) {
    return item.id.replace('yt:video:', '').trim();
  }
  if (item.link) {
    try {
      const url = new URL(item.link);
      const v = url.searchParams.get('v');
      if (v) return v;
      const parts = url.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last) return last;
    } catch {
      // ignore invalid URL
    }
  }
  return '';
}

function extractThumbnailUrl(item: YouTubeCustomItem & Parser.Item, videoId: string): string {
  const mediaThumb = item['media:group']?.['media:thumbnail']?.[0]?.$?.url;
  if (mediaThumb) return mediaThumb;
  if (videoId) return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  return FALLBACK_COVER_IMAGES[0];
}

/**
 * Hỗ trợ nhập trực tiếp Channel ID (UC...) hoặc link kênh YouTube (@handle / /channel/UC...)
 */
export async function resolveChannelId(input: string): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed || trimmed === PLACEHOLDER_CHANNEL_ID) {
    return PLACEHOLDER_CHANNEL_ID;
  }

  // Đã là Channel ID chuẩn (UC + 22 ký tự)
  if (/^UC[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  // Trích xuất trực tiếp nếu người dùng dán URL /channel/UC...
  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{20,})/i);
  if (channelMatch?.[1]) {
    return channelMatch[1];
  }

  // Nếu là @handle hoặc URL kênh dạng @handle, lấy từ HTML trang kênh YouTube
  let targetUrl = trimmed;
  if (trimmed.startsWith('@')) {
    targetUrl = `https://www.youtube.com/${trimmed}`;
  } else if (!/^https?:\/\//i.test(trimmed)) {
    targetUrl = `https://www.youtube.com/@${trimmed}`;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; GocBepAudio/1.0; +https://www.youtube.com)',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const html = await response.text();
    const idMatch =
      html.match(/"externalId"\s*:\s*"(UC[a-zA-Z0-9_-]{20,})"/) ||
      html.match(/channel_id=(UC[a-zA-Z0-9_-]{20,})/) ||
      html.match(/<meta\s+itemprop="identifier"\s+content="(UC[a-zA-Z0-9_-]{20,})"/i);

    if (idMatch?.[1]) {
      return idMatch[1];
    }
  } catch {
    // Fall through to throw descriptive error below
  }

  throw new Error('Không tìm thấy Channel ID hợp lệ từ đường dẫn hoặc handle đã nhập.');
}

export async function fetchYouTubeEpisodes(
  requestedChannelId?: string,
  forceRefresh = false,
): Promise<YouTubeFeedResponse> {
  const rawChannelId =
    requestedChannelId?.trim() ||
    process.env.YOUTUBE_CHANNEL_ID?.trim() ||
    PLACEHOLDER_CHANNEL_ID;

  if (isPlaceholderChannelId(rawChannelId)) {
    return {
      channelId: PLACEHOLDER_CHANNEL_ID,
      channelTitle: 'Góc Bếp Audio',
      channelUrl: 'https://www.youtube.com',
      subscribeUrl: 'https://www.youtube.com',
      episodes: buildSampleEpisodes(),
      source: 'sample',
      revalidateSeconds: REVALIDATE_SECONDS,
      cachedAt: new Date().toISOString(),
      isConfigured: false,
    };
  }

  const resolvedChannelId = await resolveChannelId(rawChannelId);
  const now = Date.now();
  const cached = feedCache.get(resolvedChannelId);

  if (!forceRefresh && cached && cached.expiresAt > now) {
    return cached.data;
  }

  const rssUrl = buildYouTubeRssUrl(resolvedChannelId);

  try {
    const feed = await parser.parseURL(rssUrl);
    const episodes: Episode[] = (feed.items || [])
      .map((item) => {
        const videoId = extractVideoId(item);
        const rawTitle = item.title?.trim() || 'Tập truyện chưa đặt tên';
        const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
        const description =
          item['media:group']?.['media:description']?.[0]?.trim() ||
          item.contentSnippet?.trim() ||
          '';

        return {
          id: videoId || rawTitle,
          videoId,
          episodeNumber: extractEpisodeNumber(rawTitle),
          title: rawTitle,
          cleanTitle: cleanEpisodeTitle(rawTitle),
          publishedAt,
          formattedDate: formatVietnameseDate(publishedAt),
          thumbnailUrl: extractThumbnailUrl(item, videoId),
          youtubeUrl: getWatchUrl(videoId),
          deepLinkUrl: getYouTubeAppSchemeUrl(videoId),
          embedUrl: getEmbedUrl(videoId, true),
          description,
          isSample: false,
        };
      })
      .filter((ep) => Boolean(ep.videoId));

    const result: YouTubeFeedResponse = {
      channelId: resolvedChannelId,
      channelTitle: feed.title?.trim() || 'Góc Bếp Audio',
      channelUrl: getChannelWebUrl(resolvedChannelId),
      subscribeUrl: getChannelWebUrl(resolvedChannelId),
      episodes,
      source: 'rss',
      revalidateSeconds: REVALIDATE_SECONDS,
      cachedAt: new Date().toISOString(),
      isConfigured: true,
    };

    feedCache.set(resolvedChannelId, {
      expiresAt: now + REVALIDATE_SECONDS * 1000,
      data: result,
    });

    return result;
  } catch (error) {
    if (cached) {
      return cached.data;
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Không thể kết nối tới YouTube RSS Feed vào lúc này.';

    return {
      channelId: resolvedChannelId,
      channelTitle: 'Góc Bếp Audio',
      channelUrl: getChannelWebUrl(resolvedChannelId),
      subscribeUrl: getChannelWebUrl(resolvedChannelId),
      episodes: [],
      source: 'rss',
      revalidateSeconds: REVALIDATE_SECONDS,
      cachedAt: new Date().toISOString(),
      isConfigured: true,
      errorMessage: `Không tải được danh sách tập từ RSS (${message}). Vui lòng kiểm tra lại Channel ID.`,
    };
  }
}
