import { CheckCircle2 } from 'lucide-react';
import { useTimeline } from '@/api/queries';
import { timelineIcon } from '@/components/shared/timeline-icons';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatShortDate, formatTime } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export function translateDynamic(text: string, t: any): string {
  if (!text) return '';
  const direct = t(text);
  if (direct && direct !== text) return direct;

  let match;
  match = text.match(/(\d+) of (\d+) exercises completed at home\./);
  if (match) return t('exercisesCompletedAtHome', { completed: match[1], total: match[2] });

  match = text.match(/(\d+) milestones over (\d+) weeks/);
  if (match) return t('milestonesOverWeeks', { count: match[1], weeks: match[2] });

  match = text.match(/(\d+) exercises assigned/);
  if (match) return t('exercisesAssigned', { count: match[1] });

  match = text.match(/Week (\d+) review — (.*?) (\d+)% \(baseline (\d+)%\)\./);
  if (match) return t('kpiReviewFormat', { week: match[1], kpi: t(match[2]), val: match[3], base: match[4] });

  match = text.match(/(.*?) referral created/);
  if (match) return t('referralCreatedFormat', { specialty: t(match[1]) });

  match = text.match(/^Milestone achieved: (.*)$/);
  if (match) return t('milestoneAchievedFormat', { milestone: t(match[1]) });

  match = text.match(/(.*?) · (\d+) weeks · (\d+) sessions per week/);
  if (match) return t('programUpdatedFormat', { specialty: t(match[1]), weeks: match[2], sessions: match[3] });

  if (text.includes(' · ')) return text.split(' · ').map((item: string) => t(item)).join(' · ');
  if (text.includes(', ')) return text.split(', ').map((item: string) => t(item)).join('، ');

  return text;
}

export function TimelineTab({ patientId }: { patientId: string }) {
  const { t, i18n } = useTranslation('patientDetail');
  const { data, isPending, error, refetch } = useTimeline(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title={t('timeline.noActivity')} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('timeline.title')}</CardTitle>
        <CardDescription>{t('timeline.desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-0" dir={i18n.dir()}>
          {data.map((e, i) => {
            const Icon = e.title.startsWith('Milestone achieved')
              ? CheckCircle2
              : timelineIcon[e.type];
            return (
              <li key={e.id} className="grid grid-cols-[4.5rem_2.25rem_1fr] gap-3">
                <div className="pt-1.5 text-right">
                  <p className="text-sm font-semibold">{formatShortDate(e.occurredAt)}</p>
                  <p className="text-muted-foreground text-xs">{formatTime(e.occurredAt)}</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="bg-brand-soft text-primary flex size-9 items-center justify-center rounded-full">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  {i < data.length - 1 && <span className="bg-border w-0.5 flex-1" aria-hidden />}
                </div>
                <div className="pt-1.5 pb-6">
                  <p className="font-medium" dir="auto">{translateDynamic(e.title, t)}</p>
                  {e.description && (
                    <p className="text-muted-foreground text-sm" dir="auto">{translateDynamic(e.description, t)}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
