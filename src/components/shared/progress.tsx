import { cn } from '@/lib/utils';

/** Thin labelled progress bar with the value in tabular ink next to it. */
export function ProgressBar({
  value,
  className,
  showValue = true,
  color,
}: {
  value: number;
  className?: string;
  showValue?: boolean;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="bg-muted h-2 flex-1 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-700"
          style={{ width: `${clamped}%`, ...(color ? { backgroundColor: color } : {}) }}
        />
      </div>
      {showValue && (
        <span className="tabular w-10 text-right text-sm font-semibold">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}

/** Progress ring for headline numbers (overall rehabilitation progress). */
export function ProgressRing({
  value,
  size = 128,
  stroke = 10,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        role="img"
        aria-label={`${label ?? 'Progress'} ${Math.round(clamped)}%`}
      >
        <span className="tabular text-3xl font-bold tracking-tight">{Math.round(clamped)}%</span>
        {label && <span className="text-muted-foreground text-xs">{label}</span>}
      </div>
    </div>
  );
}
