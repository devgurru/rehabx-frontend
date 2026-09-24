
/** Parses ISO date-only strings (YYYY-MM-DD) as local dates to avoid timezone shifts. */
export function parseDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

export const formatDate = (value: string, locale = 'en-GB') =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(parseDate(value));

export const formatShortDate = (value: string, locale = 'en-GB') =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(parseDate(value));

export const formatTime = (value: string, locale = 'en-GB') =>
  new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(parseDate(value));
export const formatPercent = (value: number) => `${Math.round(value)}%`;

export function formatRelative(value: string, locale: string = 'en'): string {
  const diffMs = Date.now() - parseDate(value).getTime();
  const minutes = Math.round(diffMs / 60_000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (minutes < 1) return locale.startsWith('ar') ? 'الآن' : 'just now';
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(parseDate(value));
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
