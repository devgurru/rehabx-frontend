import { cn } from '@/lib/utils';

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--primary)" />
        <path
          d="M9 22V10h6.2c2.6 0 4.3 1.5 4.3 3.8 0 1.8-1 3-2.6 3.5L20 22h-3.2l-2.7-4.4H12V22H9zm3-7h3c1 0 1.6-.6 1.6-1.4 0-.9-.6-1.4-1.6-1.4h-3V15z"
          fill="#fff"
        />
        <circle cx="23.5" cy="21.5" r="2.5" fill="var(--coral)" />
      </svg>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight">
          Rehab<span className="text-primary">X</span>
        </span>
      )}
    </span>
  );
}
