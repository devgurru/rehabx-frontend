import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' };

export function PatientAvatar({
  name,
  color,
  size = 'md',
  className,
}: {
  name: string;
  color: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizes[size],
        className,
      )}
      style={{ backgroundColor: `${color}1f`, color }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
