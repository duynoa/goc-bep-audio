import { ChevronLeft, ChevronRight, ExternalLink, Headphones, X } from 'lucide-react';
import {
  FALLBACK_COVER_IMAGES,
  getEmbedUrl,
  getWatchUrl,
  openVideoInYouTubeApp,
} from '../../../lib/youtube';
import type { Episode } from '../types';

interface EpisodePlayerProps {
  episode: Episode;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function EpisodePlayer({
  episode,
  onClose,
  onPrev,
  onNext,
}: EpisodePlayerProps) {
  const isSample = Boolean(episode.isSample);
  const embedSrc = isSample ? '' : getEmbedUrl(episode.videoId, true);
  const fallbackWebUrl = getWatchUrl(episode.videoId);

  const handleOpenYouTubeApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isSample) {
      return;
    }
    openVideoInYouTubeApp(episode.videoId);
  };

  return (
    <section
      aria-label="Trình phát truyện audio"
      className="rounded-3xl border border-[#2C2824] bg-[#1C1A18] p-4 shadow-2xl shadow-black/50 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-[#A8A095] tabular-nums">
          <span className="font-medium text-[#D97706]">Đang chọn nghe</span>
          {episode.episodeNumber && (
            <>
              <span aria-hidden="true">·</span>
              <span>Tập {episode.episodeNumber}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{episode.formattedDate}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Thu gọn trình phát"
          className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl border border-[#2C2824] bg-[#121110] text-[#A8A095] transition-colors duration-150 hover:text-[#F3EFEA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Khung video nhúng tỷ lệ 16:9 bo góc mềm mại */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#2C2824] bg-[#121110]">
        {isSample ? (
          <div className="relative flex h-full w-full flex-col justify-end p-5 sm:p-6">
            <img
              src={episode.thumbnailUrl || FALLBACK_COVER_IMAGES[0]}
              alt={episode.cleanTitle}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/70 to-transparent"
              aria-hidden="true"
            />
            <div className="relative z-10 max-w-lg space-y-3">
              <p className="text-sm leading-relaxed text-[#F3EFEA]">
                Đây là tập minh họa vì biến <code className="text-[#F59E0B]">YOUTUBE_CHANNEL_ID</code> trong <code className="text-[#F59E0B]">.env</code> chưa được cấu hình.
              </p>
            </div>
          </div>
        ) : (
          <iframe
            key={episode.videoId}
            src={embedSrc}
            title={episode.cleanTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        )}
      </div>

      <h2
        title={episode.cleanTitle}
        className="mt-3.5 line-clamp-2 font-serif text-base font-semibold leading-snug text-[#F3EFEA] sm:text-lg"
      >
        {episode.cleanTitle}
      </h2>

      {/* Điều hướng tập & mở bằng app YouTube */}
      <div className="mt-4 space-y-3">
        {(onPrev || onNext) && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2C2824] bg-[#121110] px-3 py-2 text-xs font-medium text-[#F3EFEA] transition-colors hover:border-[#D97706]/50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Tập mới hơn</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2C2824] bg-[#121110] px-3 py-2 text-xs font-medium text-[#F3EFEA] transition-colors hover:border-[#D97706]/50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              <span>Tập cũ hơn</span>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        )}

        <a
          href={isSample ? '#' : fallbackWebUrl}
          onClick={handleOpenYouTubeApp}
          className="flex min-h-[48px] w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl border border-[#D97706]/50 bg-[#D97706]/15 px-5 py-3 text-[15px] font-semibold text-[#F59E0B] transition-colors duration-150 hover:bg-[#D97706] hover:text-[#121110] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
        >
          <Headphones className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Mở bằng ứng dụng YouTube</span>
          <ExternalLink className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
        </a>

        <p className="text-center text-xs leading-relaxed text-[#A8A095]">
          Đang mở từ TikTok? Chạm nút trên để chuyển sang ứng dụng YouTube nghe khi tắt màn hình.
        </p>
      </div>
    </section>
  );
}
