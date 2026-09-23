import { ShieldAlert } from 'lucide-react';
import { useTodayExercises } from '@/api/queries';
import { LazyExercisePreview } from '@/components/exercise3d/LazyExercisePreview';
import { ExerciseStatusBadge } from '@/components/shared/badges';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/lib/format';

export function ExercisesTab({ patientId }: { patientId: string }) {
  const { data, isPending, error, refetch } = useTodayExercises(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.items.length)
    return (
      <EmptyState
        title="No exercises assigned"
        description="Assign exercises from the care plan."
      />
    );

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Today’s home program:{' '}
        <span className="text-foreground font-semibold">
          {data.completed} of {data.total}
        </span>{' '}
        completed. Status updates live as the caregiver completes exercises in the mobile app.
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {data.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{item.exercise.name}</CardTitle>
                  <CardDescription>
                    {item.reps ? `${item.reps} repetitions · ` : ''}
                    {item.durationMin} minutes · {item.frequencyPerWeek}× per week
                  </CardDescription>
                </div>
                <ExerciseStatusBadge status={item.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <LazyExercisePreview motionKey={item.exercise.motionKey} className="h-56" />
              <div className="space-y-3 text-sm">
                <ol className="list-decimal space-y-1.5 pl-4">
                  {item.exercise.instructions.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="bg-warning-soft/60 rounded-lg p-3 text-xs">
                  <p className="text-warning mb-1 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="size-3.5" aria-hidden /> Safety
                  </p>
                  <ul className="space-y-0.5">
                    {item.exercise.safetyNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-muted-foreground text-xs">
                  {item.totalCompleted} sessions completed in total
                  {item.completedAt && ` · today at ${formatTime(item.completedAt)}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
