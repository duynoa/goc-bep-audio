import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputId?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Tìm theo tên truyện hoặc số tập...',
  inputId = 'episode-search',
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Tìm kiếm tập truyện
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#A8A095]">
        <Search className="h-[18px] w-[18px]" aria-hidden="true" />
      </div>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="min-h-[48px] w-full rounded-2xl border border-[#2C2824] bg-[#1C1A18] pl-11 pr-12 text-[15px] text-[#F3EFEA] placeholder-[#A8A095]/75 transition-colors duration-150 focus:border-[#D97706] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Xóa từ khóa tìm kiếm"
          className="absolute inset-y-0 right-1 my-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#A8A095] transition-colors duration-150 hover:text-[#F3EFEA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
