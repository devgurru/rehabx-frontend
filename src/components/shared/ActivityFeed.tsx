import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { formatRelative } from '@/lib/format';
import type { PatientRef, TimelineEvent } from '@/lib/types';
import { timelineIcon } from './timeline-icons';
import { useTranslation } from 'react-i18next';

/** Compact cross-patient activity feed for the dashboard. */
export function ActivityFeed({ events }: { events: (TimelineEvent & { patient: PatientRef })[] }) {
  const { t, i18n } = useTranslation('dashboard');
  
  return (
    <ul className="space-y-1">
      {events.map((event) => {
        const Icon = event.title.startsWith('Milestone achieved')
          ? CheckCircle2
          : timelineIcon[event.type];
        return (
          <li key={event.id}>
            <Link
              to={`/patients/${event.patient.id}?tab=timeline`}
              className="hover:bg-muted flex gap-3 rounded-lg p-2 transition-colors"
            >
              <span className="bg-brand-soft text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{t(`activity.${event.title}`, { defaultValue: event.title })}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {event.patient.fullName} · {formatRelative(event.occurredAt, i18n.language)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
