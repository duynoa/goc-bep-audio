import { useCallback, useEffect, useRef, useState } from 'react';
import { EpisodeListSection } from './features/episodes/components/EpisodeListSection';
import { EpisodePlayer } from './features/episodes/components/EpisodePlayer';
import { HeroHeader } from './features/episodes/components/HeroHeader';
import type { Episode, YouTubeFeedResponse } from './features/episodes/types';

export default function App() {
  const [feed, setFeed] = useState<YouTubeFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);

  const playerAnchorRef = useRef<HTMLDivElement>(null);

  const loadEpisodes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const response = await fetch('/api/episodes');
      const payload = (await response.json()) as YouTubeFeedResponse;

      if (!response.ok) {
        throw new Error(payload.errorMessage || 'Không thể tải danh sách truyện.');
      }

      setFeed(payload);
      if (payload.errorMessage) {
        setErrorMessage(payload.errorMessage);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không thể kết nối máy chủ để tải dữ liệu RSS.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEpisodes();
  }, [loadEpisodes]);

  const handleSelectEpisode = (episode: Episode) => {
    setActiveEpisode(episode);
    window.setTimeout(() => {
      playerAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
  };

  const resolvedChannelId = feed?.channelId || '';
  const resolvedChannelTitle = feed?.channelTitle || 'Góc Bếp Audio';
  const episodes = feed?.episodes || [];

  return (
    <div className="flex min-h-dvh flex-col bg-[#121110] text-[#F3EFEA]">
      <HeroHeader
        channelId={resolvedChannelId}
        channelTitle={resolvedChannelTitle}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-6 ${
            activeEpisode ? 'lg:grid-cols-12 lg:items-start lg:gap-8' : ''
          }`}
        >
          {activeEpisode && (
            <div
              ref={playerAnchorRef}
              className="scroll-mt-4 lg:sticky lg:top-6 lg:col-span-6"
            >
              <EpisodePlayer
                episode={activeEpisode}
                onClose={() => setActiveEpisode(null)}
              />
            </div>
          )}

          <div className={activeEpisode ? 'lg:col-span-6' : ''}>
            <EpisodeListSection
              episodes={episodes}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeEpisodeId={activeEpisode?.id || null}
              onSelectEpisode={handleSelectEpisode}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onRetry={() => void loadEpisodes()}
              hasActivePlayer={Boolean(activeEpisode)}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#2C2824] bg-[#121110]">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-5 text-xs text-[#A8A095] sm:px-6 lg:px-8">
          <span>Góc Bếp Audio — Nghe truyện thư giãn mỗi đêm</span>
        </div>
      </footer>
    </div>
  );
}
