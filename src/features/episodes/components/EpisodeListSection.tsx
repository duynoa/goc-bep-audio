import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { SearchInput } from '../../../components/ui/SearchInput';
import { SectionHeading } from '../../../components/ui/SectionHeading';
import type { Episode } from '../types';
import { EpisodeCard } from './EpisodeCard';

interface EpisodeListSectionProps {
  episodes: Episode[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeEpisodeId: string | null;
  onSelectEpisode: (episode: Episode) => void;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
  hasActivePlayer: boolean;
}

function normalizeVietnameseText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function EpisodeListSection({
  episodes,
  searchQuery,
  onSearchChange,
  activeEpisodeId,
  onSelectEpisode,
  isLoading,
  errorMessage,
  onRetry,
  hasActivePlayer,
}: EpisodeListSectionProps) {
  const filteredEpisodes = useMemo(() => {
    const query = normalizeVietnameseText(searchQuery);
    if (!query) return episodes;

    const numericOnly = query.replace(/[^\d]/g, '');

    return episodes.filter((ep) => {
      const normalizedTitle = normalizeVietnameseText(ep.title);
      const normalizedClean = normalizeVietnameseText(ep.cleanTitle);
      const episodeTag = ep.episodeNumber
        ? `tap ${ep.episodeNumber} #${ep.episodeNumber} ${ep.episodeNumber}`
        : '';

      if (normalizedTitle.includes(query) || normalizedClean.includes(query)) {
        return true;
      }
      if (episodeTag && episodeTag.includes(query)) {
        return true;
      }
      if (numericOnly && ep.episodeNumber === numericOnly) {
        return true;
      }
      return false;
    });
  }, [episodes, searchQuery]);

  const countLabel =
    searchQuery.trim().length > 0
      ? `${filteredEpisodes.length} / ${episodes.length} tập`
      : `${episodes.length} tập mới nhất`;

  return (
    <section aria-label="Danh sách tập truyện" className="space-y-4">
      <SectionHeading title="Kho truyện đêm khuya" meta={countLabel} />

      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Tìm tên truyện ..."
      />

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Đang tải tập truyện">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-[#2C2824] bg-[#1C1A18] p-3.5"
            >
              <div className="aspect-video w-32 shrink-0 rounded-xl bg-[#25221F] sm:w-40" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-4/5 rounded bg-[#25221F]" />
                <div className="h-3 w-1/3 rounded bg-[#25221F]" />
              </div>
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-[#2C2824] bg-[#1C1A18] p-6 text-center">
          <p className="text-sm leading-relaxed text-[#F3EFEA]">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#D97706] px-5 py-2.5 text-sm font-semibold text-[#121110] transition-colors hover:bg-[#F59E0B]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Thử tải lại</span>
          </button>
        </div>
      ) : filteredEpisodes.length === 0 ? (
        <div className="rounded-2xl border border-[#2C2824] bg-[#1C1A18] p-6 text-center">
          <p className="text-sm text-[#A8A095]">
            Không tìm thấy tập truyện nào khớp với “{searchQuery}”.
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#2C2824] bg-[#121110] px-4 py-2 text-sm font-medium text-[#F3EFEA] transition-colors hover:border-[#D97706]/60"
            >
              Xem tất cả tập truyện
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-3 ${
            hasActivePlayer ? 'lg:grid-cols-1' : 'lg:grid-cols-2'
          }`}
        >
          {filteredEpisodes.map((episode, index) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              index={index}
              isActive={activeEpisodeId === episode.id}
              onSelect={onSelectEpisode}
            />
          ))}
        </div>
      )}
    </section>
  );
}
