const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const shortDateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Parses ISO date-only strings (YYYY-MM-DD) as local dates to avoid timezone shifts. */
export function parseDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

export const formatDate = (value: string) => dateFmt.format(parseDate(value));
export const formatShortDate = (value: string) => shortDateFmt.format(parseDate(value));
export const formatTime = (value: string) => timeFmt.format(parseDate(value));
export const formatPercent = (value: number) => `${Math.round(value)}%`;

export function formatRelative(value: string): string {
  const diffMs = Date.now() - parseDate(value).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatShortDate(value);
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const statusLabel: Record<string, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Requires review',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
};
