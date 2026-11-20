interface SectionHeadingProps {
  title: string;
  meta?: string;
}

export function SectionHeading({ title, meta }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#2C2824] pb-3">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-[#F3EFEA] sm:text-2xl">
        {title}
      </h2>
      {meta && (
        <span className="shrink-0 whitespace-nowrap text-xs font-medium text-[#A8A095] tabular-nums">
          {meta}
        </span>
      )}
    </div>
  );
}
