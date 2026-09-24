import { Box, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAssignExercises, useExerciseLibrary, useProgram } from '@/api/queries';
import { LazyExercisePreview } from '@/components/exercise3d/LazyExercisePreview';
import { CardSkeleton, EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Exercise, ExerciseAssignmentInput } from '@/lib/types';
import { cn } from '@/lib/utils';
import { StepFooter } from './StepFooter';
import { type StepProps, useCarePlan } from './useCarePlan';
import { useTranslation } from 'react-i18next';

export function ExercisesStep({ patientId, onComplete }: StepProps) {
  const { t } = useTranslation('carePlan');
  const program = useProgram(patientId);
  const library = useExerciseLibrary(program.data?.specialty.id);
  const { draft, update } = useCarePlan(patientId);
  const assign = useAssignExercises(patientId);
  const [previewId, setPreviewId] = useState<string | null>(null);

  if (program.isPending || (program.data && library.isPending))
    return <CardSkeleton className="h-96" />;
  if (!program.data)
    return (
      <EmptyState
        title={t('exercises.createFirst')}
        description={t('exercises.createFirstDesc')}
      />
    );

  const exercises = library.data ?? [];
  const defaults: ExerciseAssignmentInput[] = program.data.exercises.length
    ? program.data.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        reps: e.reps,
        durationMin: e.durationMin,
        frequencyPerWeek: e.frequencyPerWeek,
      }))
    : exercises
        .filter((e) => e.motionKey)
        .slice(0, 3)
        .map((e) => ({
          exerciseId: e.id,
          reps: e.defaultReps,
          durationMin: e.defaultDurationMin,
          frequencyPerWeek: program.data!.sessionsPerWeek,
        }));
  const selected = draft.exercises ?? defaults;
  const setSelected = (next: ExerciseAssignmentInput[]) => update({ exercises: next });

  const toggle = (exercise: Exercise, on: boolean) =>
    setSelected(
      on
        ? [
            ...selected,
            {
              exerciseId: exercise.id,
              reps: exercise.defaultReps,
              durationMin: exercise.defaultDurationMin,
              frequencyPerWeek: program.data!.sessionsPerWeek,
            },
          ]
        : selected.filter((s) => s.exerciseId !== exercise.id),
    );
  const patch = (exerciseId: string, p: Partial<ExerciseAssignmentInput>) =>
    setSelected(selected.map((s) => (s.exerciseId === exerciseId ? { ...s, ...p } : s)));

  const preview =
    exercises.find((e) => e.id === (previewId ?? selected[0]?.exerciseId)) ?? exercises[0];

  const submit = () =>
    assign.mutate(selected, {
      onSuccess: () => {
        toast.success(t('exercises.assignedSuccess', { count: selected.length }));
        onComplete();
      },
      onError: (e) => toast.error(e.message),
    });

  const numberField = (
    value: number | null | undefined,
    onChange: (v: number | null) => void,
    label: string,
    optional = false,
  ) => (
    <Input
      type="number"
      min={1}
      className="h-8 w-20"
      aria-label={label}
      value={value ?? ''}
      placeholder={optional ? '—' : undefined}
      onChange={(e) =>
        onChange(
          e.target.value === '' ? (optional ? null : 1) : Math.max(1, Number(e.target.value)),
        )
      }
    />
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {t('exercises.library', { specialty: program.data.specialty.name, count: selected.length })}
          </p>
          {exercises.map((exercise) => {
            const assignment = selected.find((s) => s.exerciseId === exercise.id);
            return (
              <div
                key={exercise.id}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  assignment ? 'border-primary/60 bg-brand-soft/30' : 'hover:bg-muted/40',
                )}
                onMouseEnter={() => setPreviewId(exercise.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`ex-${exercise.id}`}
                    checked={Boolean(assignment)}
                    onCheckedChange={(v) => toggle(exercise, v === true)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label
                      htmlFor={`ex-${exercise.id}`}
                      className="flex flex-wrap items-center gap-2 text-base font-semibold"
                      dir="auto"
                    >
                      {exercise.name}
                      {exercise.motionKey && (
                        <Badge variant="outline" className="text-primary gap-1 font-medium">
                          <Box aria-hidden /> {t('exercises.guide')}
                        </Badge>
                      )}
                    </Label>
                    <p className="text-muted-foreground text-sm" dir="auto">{exercise.description}</p>
                    {exercise.targetKpi && (
                      <p className="text-muted-foreground text-xs" dir="auto">
                        {t('exercises.improves', { name: exercise.targetKpi.name })}
                      </p>
                    )}
                  </div>
                </div>
                {assignment && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 pl-7 text-sm">
                    <label className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('exercises.reps')}</span>
                      {numberField(
                        assignment.reps,
                        (v) => patch(exercise.id, { reps: v }),
                        t('exercises.repsPlaceholder', { name: exercise.name }),
                        true,
                      )}
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('exercises.minutes')}</span>
                      {numberField(
                        assignment.durationMin,
                        (v) => patch(exercise.id, { durationMin: v ?? 1 }),
                        t('exercises.minutesPlaceholder', { name: exercise.name }),
                      )}
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('exercises.perWeek')}</span>
                      {numberField(
                        assignment.frequencyPerWeek,
                        (v) => patch(exercise.id, { frequencyPerWeek: v ?? 1 }),
                        t('exercises.perWeekPlaceholder', { name: exercise.name }),
                      )}
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="space-y-3 xl:sticky xl:top-20 xl:self-start">
          <p className="text-sm font-semibold">{t('exercises.preview')}</p>
          <LazyExercisePreview motionKey={preview?.motionKey ?? null} className="h-80" />
          {preview && (
            <div className="space-y-2 text-sm">
              <p className="font-semibold" dir="auto">{preview.name}</p>
              <ol className="space-y-1.5">
                {preview.instructions.map((step, i) => (
                  <li key={step} className="text-muted-foreground flex gap-2" dir="auto">
                    <span className="bg-muted text-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>

      <StepFooter
        primaryLabel={selected.length === 1 ? t('exercises.assign', { count: selected.length }) : t('exercises.assignPlural', { count: selected.length })}
        onPrimary={submit}
        pending={assign.isPending}
        disabled={selected.length === 0}
        hint={
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5" aria-hidden /> {t('exercises.hint')}
          </span>
        }
      />
    </div>
  );
}
