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

export function ExercisesStep({ patientId, onComplete }: StepProps) {
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
        title="Create the program first"
        description="Exercises are assigned to an active rehabilitation program."
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
        toast.success(`${selected.length} exercises assigned`);
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
            {program.data.specialty.name} exercise library · {selected.length} selected
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
                    >
                      {exercise.name}
                      {exercise.motionKey && (
                        <Badge variant="outline" className="text-primary gap-1 font-medium">
                          <Box aria-hidden /> 3D guide
                        </Badge>
                      )}
                    </Label>
                    <p className="text-muted-foreground text-sm">{exercise.description}</p>
                    {exercise.targetKpi && (
                      <p className="text-muted-foreground text-xs">
                        Improves {exercise.targetKpi.name}
                      </p>
                    )}
                  </div>
                </div>
                {assignment && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 pl-7 text-sm">
                    <label className="flex items-center gap-2">
                      <span className="text-muted-foreground">Reps</span>
                      {numberField(
                        assignment.reps,
                        (v) => patch(exercise.id, { reps: v }),
                        `${exercise.name} repetitions`,
                        true,
                      )}
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-muted-foreground">Minutes</span>
                      {numberField(
                        assignment.durationMin,
                        (v) => patch(exercise.id, { durationMin: v ?? 1 }),
                        `${exercise.name} minutes`,
                      )}
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="text-muted-foreground">Per week</span>
                      {numberField(
                        assignment.frequencyPerWeek,
                        (v) => patch(exercise.id, { frequencyPerWeek: v ?? 1 }),
                        `${exercise.name} sessions per week`,
                      )}
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="space-y-3 xl:sticky xl:top-20 xl:self-start">
          <p className="text-sm font-semibold">Caregiver preview</p>
          <LazyExercisePreview motionKey={preview?.motionKey ?? null} className="h-80" />
          {preview && (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{preview.name}</p>
              <ol className="space-y-1.5">
                {preview.instructions.map((step, i) => (
                  <li key={step} className="text-muted-foreground flex gap-2">
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
        primaryLabel={`Assign ${selected.length} exercise${selected.length === 1 ? '' : 's'}`}
        onPrimary={submit}
        pending={assign.isPending}
        disabled={selected.length === 0}
        hint={
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5" aria-hidden /> Assigned exercises appear instantly in the
            caregiver app.
          </span>
        }
      />
    </div>
  );
}
