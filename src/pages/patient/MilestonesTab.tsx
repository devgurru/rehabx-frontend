import { CheckCircle2, CircleDashed, Clock3 } from 'lucide-react';
import { toast } from 'sonner';
import { useMilestones, useUpdateMilestoneStatus } from '@/api/queries';
import { MilestoneStatusBadge } from '@/components/shared/badges';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/format';
import type { MilestoneStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const icon = { ACHIEVED: CheckCircle2, IN_PROGRESS: Clock3, PENDING: CircleDashed };

export function MilestonesTab({ patientId }: { patientId: string }) {
  const { data, isPending, error, refetch } = useMilestones(patientId);
  const update = useUpdateMilestoneStatus(patientId);

  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.program)
    return (
      <EmptyState
        title="No milestones yet"
        description="Milestones are created with the program."
      />
    );

  const setStatus = (milestoneId: string, status: MilestoneStatus) =>
    update.mutate(
      { milestoneId, status },
      {
        onSuccess: () => toast.success('Milestone updated'),
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals & milestones</CardTitle>
        <CardDescription>
          {data.achieved} of {data.total} achieved · currently week {data.program.currentWeek} of{' '}
          {data.program.durationWeeks}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-6">
          {data.items.map((m, i) => {
            const Icon = icon[m.status];
            const isLast = i === data.items.length - 1;
            return (
              <li key={m.id} className="relative flex gap-4">
                {!isLast && (
                  <span
                    className={cn(
                      'absolute top-9 left-[17px] h-[calc(100%-12px)] w-0.5',
                      m.status === 'ACHIEVED' ? 'bg-success/40' : 'bg-border',
                    )}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'z-10 flex size-9 shrink-0 items-center justify-center rounded-full',
                    m.status === 'ACHIEVED' && 'bg-success-soft text-success',
                    m.status === 'IN_PROGRESS' &&
                      'bg-brand-soft text-primary ring-primary/10 ring-4',
                    m.status === 'PENDING' && 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="flex flex-1 flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">
                      Week {m.targetWeek}
                      {m.targetDate && ` · ${formatDate(m.targetDate)}`}
                    </p>
                    <p className="font-semibold">{m.title}</p>
                    {m.description && (
                      <p className="text-muted-foreground text-sm">{m.description}</p>
                    )}
                    {m.achievedAt && (
                      <p className="text-success text-xs">Achieved {formatDate(m.achievedAt)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MilestoneStatusBadge status={m.status} />
                    <Select
                      value={m.status}
                      onValueChange={(v) => setStatus(m.id, v as MilestoneStatus)}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-36"
                        aria-label={`Update status of ${m.title}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Upcoming</SelectItem>
                        <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                        <SelectItem value="ACHIEVED">Achieved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
