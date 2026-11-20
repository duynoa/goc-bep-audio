export interface Episode {
  id: string;
  videoId: string;
  episodeNumber: string | null;
  title: string;
  cleanTitle: string;
  publishedAt: string;
  formattedDate: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  deepLinkUrl: string;
  embedUrl: string;
  description: string;
  isSample?: boolean;
}

export interface YouTubeFeedResponse {
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  subscribeUrl: string;
  episodes: Episode[];
  source: 'rss' | 'sample';
  revalidateSeconds: number;
  cachedAt: string;
  isConfigured: boolean;
  errorMessage?: string;
}
