export const PLACEHOLDER_CHANNEL_ID = 'UCkwzh-O_x8t5_UO-Zf_bGmA';
export const REVALIDATE_SECONDS = 1800;

export const FALLBACK_COVER_IMAGES = [
  '/src/assets/images/story_cover_midnight_1795058765103.jpg',
  '/src/assets/images/story_cover_rain_1795058765433.jpg',
] as const;

export const BRAND_EMBLEM_URL = '/src/assets/images/goc_bep_emblem.png';

export function isPlaceholderChannelId(channelId?: string | null): boolean {
  if (!channelId) return true;
  const trimmed = channelId.trim();
  return !trimmed || trimmed === PLACEHOLDER_CHANNEL_ID;
}

export function buildYouTubeRssUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

export function getEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

export function getWatchUrl(videoId: string): string {
  return `https://youtu.be/${encodeURIComponent(videoId)}`;
}

export function getYouTubeAppSchemeUrl(videoId: string): string {
  return `vnd.youtube://${encodeURIComponent(videoId)}`;
}

export function getAndroidYouTubeIntentUrl(videoId: string): string {
  const fallback = encodeURIComponent(getWatchUrl(videoId));
  return `intent://youtu.be/${encodeURIComponent(videoId)}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallback};end`;
}

export function getChannelWebUrl(channelId: string): string {
  if (isPlaceholderChannelId(channelId)) {
    return 'https://www.youtube.com';
  }
  return `https://www.youtube.com/channel/${encodeURIComponent(channelId)}?sub_confirmation=1`;
}

export function getChannelAppSchemeUrl(channelId: string): string {
  if (isPlaceholderChannelId(channelId)) {
    return 'vnd.youtube://';
  }
  return `vnd.youtube://channel/${encodeURIComponent(channelId)}`;
}

/**
 * Mở video bằng ứng dụng YouTube (tối ưu cho trình duyệt in-app của TikTok).
 * Thử mở URL scheme vnd.youtube://{videoId} (hoặc Android intent) trước,
 * sau đó tự động fallback về https://youtu.be/{videoId} nếu máy chưa cài app hoặc trình duyệt chặn scheme.
 */
export function openVideoInYouTubeApp(videoId: string): void {
  if (typeof window === 'undefined' || !videoId) return;

  const fallbackUrl = getWatchUrl(videoId);
  const schemeUrl = getYouTubeAppSchemeUrl(videoId);
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isAndroid) {
    window.location.href = getAndroidYouTubeIntentUrl(videoId);
    return;
  }

  if (isIOS) {
    let didLeavePage = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        didLeavePage = true;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });

    window.location.href = schemeUrl;

    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!didLeavePage) {
        window.location.href = fallbackUrl;
      }
    }, 1200);
    return;
  }

  // Desktop fallback
  window.location.assign(fallbackUrl);
}

/**
 * Mở trang kênh YouTube trong app YouTube để người nghe bấm Đăng ký nhanh.
 */
export function openChannelInYouTubeApp(channelId: string): void {
  if (typeof window === 'undefined') return;

  const webUrl = getChannelWebUrl(channelId);
  if (isPlaceholderChannelId(channelId)) {
    window.location.assign(webUrl);
    return;
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isAndroid) {
    const fallback = encodeURIComponent(webUrl);
    window.location.href = `intent://www.youtube.com/channel/${encodeURIComponent(channelId)}?sub_confirmation=1#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallback};end`;
    return;
  }

  if (isIOS) {
    let didLeavePage = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        didLeavePage = true;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });

    window.location.href = getChannelAppSchemeUrl(channelId);

    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!didLeavePage) {
        window.location.href = webUrl;
      }
    }, 1200);
    return;
  }

  window.location.assign(webUrl);
}

export function extractEpisodeNumber(title: string): string | null {
  const patterns = [
    /(?:tập|tap|ep|episode)\s*#?\s*(\d{1,4})/i,
    /#(\d{1,4})\b/,
    /\bphần\s*(\d{1,3})/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

export function cleanEpisodeTitle(title: string): string {
  return title
    .replace(/\s*\|\s*Góc Bếp Audio.*$/i, '')
    .replace(/\s*-\s*Góc Bếp Audio.*$/i, '')
    .trim();
}

export function formatVietnameseDate(isoDate?: string): string {
  if (!isoDate) return 'Mới đăng';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Mới đăng';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
