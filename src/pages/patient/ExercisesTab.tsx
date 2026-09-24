import { ShieldAlert } from 'lucide-react';
import { useTodayExercises } from '@/api/queries';
import { LazyExercisePreview } from '@/components/exercise3d/LazyExercisePreview';
import { ExerciseStatusBadge } from '@/components/shared/badges';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export function ExercisesTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('patientDetail');
  const { data, isPending, error, refetch } = useTodayExercises(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.items.length)
    return (
      <EmptyState
        title={t('exercises.noExercises')}
        description={t('exercises.assignDesc')}
      />
    );

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {t('exercises.todayProgram')}:{' '}
        <span className="text-foreground font-semibold">
          {t('exercises.completed', { completed: data.completed, total: data.total })}
        </span>{' '}
        {t('exercises.statusUpdates')}
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {data.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{t(item.exercise.name)}</CardTitle>
                  <CardDescription>
                    {item.reps ? `${t('exercises.repetitions', { reps: item.reps })} · ` : ''}
                    {t('exercises.minutes', { min: item.durationMin })} · {t('exercises.perWeek', { times: item.frequencyPerWeek })}
                  </CardDescription>
                </div>
                <ExerciseStatusBadge status={item.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <LazyExercisePreview motionKey={item.exercise.motionKey} className="h-56" />
              <div className="space-y-4 text-sm">
                <ol className="space-y-2">
                  {item.exercise.instructions.map((step, i) => (
                    <li key={step} className="text-muted-foreground flex items-start gap-2" dir="auto">
                      <span className="bg-muted text-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                        {i + 1}
                      </span>
                      <span>{t(step)}</span>
                    </li>
                  ))}
                </ol>
                <div className="bg-warning-soft/60 rounded-lg p-3 text-xs">
                  <p className="text-warning mb-2 flex items-center gap-1.5 font-semibold">
                    <ShieldAlert className="size-3.5" aria-hidden /> {t('exercises.safety')}
                  </p>
                  <ul className="text-muted-foreground space-y-1.5">
                    {item.exercise.safetyNotes.map((note) => (
                      <li key={note} className="flex items-start gap-2" dir="auto">
                        <span className="bg-warning/40 mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden />
                        <span>{t(note)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('exercises.sessionsTotal', { total: item.totalCompleted })}
                  {item.completedAt && ` · ${t('exercises.todayAt', { time: formatTime(item.completedAt) })}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
