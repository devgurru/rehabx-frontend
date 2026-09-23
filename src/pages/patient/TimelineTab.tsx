import { CheckCircle2 } from 'lucide-react';
import { useTimeline } from '@/api/queries';
import { timelineIcon } from '@/components/shared/timeline-icons';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatShortDate, formatTime } from '@/lib/format';

export function TimelineTab({ patientId }: { patientId: string }) {
  const { data, isPending, error, refetch } = useTimeline(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title="No activity yet" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rehabilitation timeline</CardTitle>
        <CardDescription>The patient journey from assessment to outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-0">
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
                  <p className="font-medium">{e.title}</p>
                  {e.description && (
                    <p className="text-muted-foreground text-sm">{e.description}</p>
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
