import { BellPlus, ExternalLink } from 'lucide-react';
import {
  BRAND_EMBLEM_URL,
  getChannelWebUrl,
  openChannelInYouTubeApp,
} from '../../../lib/youtube';

interface HeroHeaderProps {
  channelId: string;
  channelTitle: string;
}

export function HeroHeader({
  channelId,
  channelTitle,
}: HeroHeaderProps) {
  const subscribeHref = getChannelWebUrl(channelId);
  const displayName =
    channelTitle && channelTitle !== 'Góc Bếp Audio'
      ? channelTitle
      : 'Góc Bếp Audio';

  const handleSubscribeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openChannelInYouTubeApp(channelId);
  };

  return (
    <header className="border-b border-[#2C2824] bg-[#121110]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:py-6 lg:px-8">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#2C2824] bg-[#1C1A18] sm:h-14 sm:w-14">
            <img
              src={BRAND_EMBLEM_URL}
              alt="Biểu tượng Góc Bếp Audio"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#F3EFEA] sm:text-3xl">
              {displayName}
            </h1>
            <p className="mt-0.5 text-sm leading-relaxed text-[#A8A095]">
              Truyện audio đêm khuya bên ánh đèn bếp ấm — nghe bản đầy đủ từ YouTube.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={subscribeHref}
            onClick={handleSubscribeClick}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#D97706] px-5 py-2.5 text-sm font-semibold text-[#121110] transition-colors duration-150 hover:bg-[#F59E0B] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121110] sm:flex-initial"
          >
            <BellPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Đăng ký kênh YouTube</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
