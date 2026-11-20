import { Play, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { FALLBACK_COVER_IMAGES } from '../../../lib/youtube';
import type { Episode } from '../types';

interface EpisodeCardProps {
  episode: Episode;
  index: number;
  isActive: boolean;
  onSelect: (episode: Episode) => void;
}

export function EpisodeCard({
  episode,
  index,
  isActive,
  onSelect,
}: EpisodeCardProps) {
  const fallbackSrc = FALLBACK_COVER_IMAGES[index % FALLBACK_COVER_IMAGES.length];
  const [imgSrc, setImgSrc] = useState(episode.thumbnailUrl || fallbackSrc);

  return (
    <button
      type="button"
      onClick={() => onSelect(episode)}
      aria-pressed={isActive}
      className={`group flex min-h-[88px] w-full items-center gap-3.5 rounded-2xl border p-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] sm:gap-4 sm:p-3.5 ${
        isActive
          ? 'border-[#D97706]/80 bg-[#231E1A]'
          : 'border-[#2C2824] bg-[#1C1A18] hover:border-[#D97706]/40 hover:bg-[#25221F]'
      }`}
    >
      {/* Thumbnail bên trái */}
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl border border-[#2C2824] bg-[#121110] sm:w-40">
        <img
          src={imgSrc}
          alt={episode.cleanTitle}
          loading={index < 4 ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== fallbackSrc) {
              setImgSrc(fallbackSrc);
            }
          }}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
          aria-hidden="true"
        />
        <div
          className={`absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            isActive
              ? 'bg-[#D97706] text-[#121110]'
              : 'bg-[#121110]/85 text-[#F3EFEA] group-hover:bg-[#D97706] group-hover:text-[#121110]'
          }`}
          aria-hidden="true"
        >
          {isActive ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-[0.5px]" />
          )}
        </div>
      </div>

      {/* Tiêu đề & ngày đăng bên phải */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <h3
          className={`line-clamp-2 font-serif text-[15px] font-semibold leading-snug sm:text-base ${
            isActive ? 'text-[#F59E0B]' : 'text-[#F3EFEA]'
          }`}
        >
          {episode.cleanTitle}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#A8A095] tabular-nums">
          {isActive && (
            <>
              <span className="font-semibold text-[#D97706]">Đang phát</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          {episode.episodeNumber && (
            <>
              <span>Tập {episode.episodeNumber}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{episode.formattedDate}</span>
        </div>
      </div>
    </button>
  );
}
