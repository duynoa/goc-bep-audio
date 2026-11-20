import { X } from 'lucide-react';
import { useState } from 'react';
import { PLACEHOLDER_CHANNEL_ID } from '../../../lib/youtube';

interface ChannelSetupModalProps {
  isOpen: boolean;
  currentChannelId: string;
  onClose: () => void;
  onApplyChannelId: (channelId: string) => void;
}

export function ChannelSetupModal({
  isOpen,
  currentChannelId,
  onClose,
  onApplyChannelId,
}: ChannelSetupModalProps) {
  const initialValue =
    currentChannelId === PLACEHOLDER_CHANNEL_ID ? '' : currentChannelId;
  const [inputValue, setInputValue] = useState(initialValue);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onApplyChannelId(trimmed);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="channel-setup-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-t-3xl border border-[#2C2824] bg-[#1C1A18] p-5 pb-7 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#2C2824] sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="channel-setup-title"
              className="font-serif text-lg font-semibold text-[#F3EFEA]"
            >
              Kết nối kênh YouTube
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#A8A095]">
              Dán Channel ID (bắt đầu bằng UC...) hoặc đường dẫn @handle của kênh để nạp danh sách tập truyện tự động từ YouTube RSS.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#A8A095] hover:bg-[#25221F] hover:text-[#F3EFEA]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="youtube-channel-input"
              className="mb-1.5 block text-xs font-medium text-[#F3EFEA]"
            >
              YouTube Channel ID hoặc @handle
            </label>
            <input
              id="youtube-channel-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ví dụ: UCxxxxxxxxxxxxxxxxxxxxxx hoặc @GocBepAudio"
              className="min-h-[48px] w-full rounded-xl border border-[#2C2824] bg-[#121110] px-4 text-sm text-[#F3EFEA] placeholder-[#A8A095]/70 focus:border-[#D97706] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] flex-1 rounded-xl border border-[#2C2824] bg-[#121110] px-4 text-sm font-medium text-[#A8A095] transition-colors hover:text-[#F3EFEA]"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="min-h-[44px] flex-1 rounded-xl bg-[#D97706] px-4 text-sm font-semibold text-[#121110] transition-colors hover:bg-[#F59E0B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nạp danh sách tập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
