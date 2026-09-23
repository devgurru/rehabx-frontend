import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useKpiDefinitions,
  useMilestones,
  useProgram,
  useSaveGoals,
  useSaveMilestones,
} from '@/api/queries';
import { CardSkeleton, EmptyState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MilestoneStatus } from '@/lib/types';
import type { GoalDraft, MilestoneDraft } from '@/store/carePlanSlice';
import { StepFooter } from './StepFooter';
import { type StepProps, useCarePlan } from './useCarePlan';

const GOAL_SUGGESTIONS: { title: string; kpiCode: string }[] = [
  { title: 'Improve upper-limb mobility', kpiCode: 'MOBILITY' },
  { title: 'Improve balance', kpiCode: 'BALANCE' },
  { title: 'Improve walking', kpiCode: 'LOWER_LIMB' },
  { title: 'Improve functional independence', kpiCode: 'FUNCTION' },
];

const NO_KPI = 'none';

export function GoalsStep({ patientId, onComplete }: StepProps) {
  const program = useProgram(patientId);
  const milestones = useMilestones(patientId);
  const { data: kpis } = useKpiDefinitions();
  const { draft, update } = useCarePlan(patientId);
  const saveGoals = useSaveGoals(patientId);
  const saveMilestones = useSaveMilestones(patientId);

  if (program.isPending || milestones.isPending) return <CardSkeleton className="h-96" />;
  if (!program.data)
    return (
      <EmptyState
        title="Create the program first"
        description="Goals and milestones belong to a program."
      />
    );

  const goals: GoalDraft[] =
    draft.goals ?? program.data.goals.map((g) => ({ title: g.title, kpiId: g.kpiId }));
  const plan: MilestoneDraft[] =
    draft.milestones ??
    (milestones.data?.items ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      targetWeek: m.targetWeek,
      status: m.status,
    }));

  const setGoals = (next: GoalDraft[]) => update({ goals: next });
  const setPlan = (next: MilestoneDraft[]) => update({ milestones: next });
  const kpiIdFor = (code: string) => kpis?.find((k) => k.code === code)?.id ?? null;

  const submit = async () => {
    try {
      await saveGoals.mutateAsync(goals.filter((g) => g.title.trim().length >= 3));
      await saveMilestones.mutateAsync(
        [...plan]
          .filter((m) => m.title.trim().length >= 3)
          .sort((a, b) => a.targetWeek - b.targetWeek),
      );
      toast.success('Goals and milestones saved');
      onComplete();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Rehabilitation goals</h3>
          <div className="flex flex-wrap gap-2">
            {GOAL_SUGGESTIONS.filter((s) => !goals.some((g) => g.title === s.title)).map((s) => (
              <Button
                key={s.title}
                size="sm"
                variant="outline"
                onClick={() => setGoals([...goals, { title: s.title, kpiId: kpiIdFor(s.kpiCode) }])}
              >
                <Plus /> {s.title}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {goals.map((g, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center"
            >
              <Input
                value={g.title}
                onChange={(e) =>
                  setGoals(goals.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                }
                aria-label="Goal"
                className="flex-1"
              />
              <Select
                value={g.kpiId ?? NO_KPI}
                onValueChange={(v) =>
                  setGoals(
                    goals.map((x, j) => (j === i ? { ...x, kpiId: v === NO_KPI ? null : v } : x)),
                  )
                }
              >
                <SelectTrigger className="sm:w-56" aria-label="Measured by KPI">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_KPI}>No linked KPI</SelectItem>
                  {kpis?.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      Measured by {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGoals(goals.filter((_, j) => j !== i))}
                aria-label="Remove goal"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGoals([...goals, { title: '', kpiId: null }])}
          >
            <Plus /> Add custom goal
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Milestones</h3>
          <Badge variant="outline">{program.data.durationWeeks}-week program</Badge>
        </div>
        <div className="space-y-2">
          {plan.map((m, i) => (
            <div
              key={m.id ?? i}
              className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center"
            >
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Week</span>
                <Input
                  type="number"
                  min={1}
                  max={program.data!.durationWeeks}
                  className="h-8 w-16"
                  value={m.targetWeek}
                  onChange={(e) =>
                    setPlan(
                      plan.map((x, j) =>
                        j === i
                          ? { ...x, targetWeek: Math.max(1, Number(e.target.value) || 1) }
                          : x,
                      ),
                    )
                  }
                />
              </label>
              <Input
                value={m.title}
                onChange={(e) =>
                  setPlan(plan.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                }
                aria-label="Milestone"
                className="flex-1"
              />
              <Select
                value={m.status ?? 'PENDING'}
                onValueChange={(v) =>
                  setPlan(
                    plan.map((x, j) => (j === i ? { ...x, status: v as MilestoneStatus } : x)),
                  )
                }
              >
                <SelectTrigger className="sm:w-36" aria-label="Milestone status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Upcoming</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                  <SelectItem value="ACHIEVED">Achieved</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPlan(plan.filter((_, j) => j !== i))}
                aria-label="Remove milestone"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setPlan([
                ...plan,
                {
                  title: '',
                  targetWeek: Math.min(
                    program.data!.durationWeeks,
                    (plan.at(-1)?.targetWeek ?? 0) + 1,
                  ),
                },
              ])
            }
          >
            <Plus /> Add milestone
          </Button>
        </div>
      </section>

      <StepFooter
        primaryLabel="Save & finish care plan"
        onPrimary={() => void submit()}
        pending={saveGoals.isPending || saveMilestones.isPending}
        disabled={goals.length === 0}
      />
    </div>
  );
}
