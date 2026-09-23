import { toast } from 'sonner';
import { useProgram, useReferrals, useSaveProgram, useSpecialties } from '@/api/queries';
import { CardSkeleton } from '@/components/shared/states';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { todayIso } from '@/lib/format';
import type { CarePlanDraft } from '@/store/carePlanSlice';
import { StepFooter } from './StepFooter';
import { type StepProps, useCarePlan } from './useCarePlan';

const DURATIONS = [4, 6, 8, 12];
const FREQUENCIES = [1, 2, 3, 4, 5];
const SELECTED =
  'flex-1 data-[state=on]:border-primary data-[state=on]:bg-brand-soft data-[state=on]:text-accent-foreground';

export function ProgramStep({ patientId, onComplete }: StepProps) {
  const program = useProgram(patientId);
  const referrals = useReferrals(patientId);
  const { data: specialties } = useSpecialties();
  const { draft, update } = useCarePlan(patientId);
  const save = useSaveProgram(patientId);

  if (program.isPending || referrals.isPending || !specialties)
    return <CardSkeleton className="h-80" />;

  const referredId =
    draft.referral?.specialtyIds[0] ?? referrals.data?.[0]?.specialty.id ?? specialties[0].id;
  const specialtyName = (id: string) => specialties.find((s) => s.id === id)?.name ?? '';
  const values: NonNullable<CarePlanDraft['program']> = draft.program ?? {
    name: program.data?.name ?? `Pediatric ${specialtyName(referredId)}`,
    specialtyId: program.data?.specialty.id ?? referredId,
    startDate: program.data?.startDate ?? todayIso(),
    durationWeeks: program.data?.durationWeeks ?? 8,
    sessionsPerWeek: program.data?.sessionsPerWeek ?? 3,
  };
  const set = (patch: Partial<typeof values>) => update({ program: { ...values, ...patch } });

  const submit = () => {
    const referralId = referrals.data?.find((r) => r.specialty.id === values.specialtyId)?.id;
    save.mutate(
      { ...values, ...(referralId ? { referralId } : {}) },
      {
        onSuccess: () => {
          toast.success(program.data ? 'Program updated' : 'Rehabilitation program created');
          onComplete();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const changingSpecialty = program.data && program.data.specialty.id !== values.specialtyId;

  return (
    <div className="space-y-6">
      {program.data && (
        <p className="bg-brand-soft/60 text-accent-foreground rounded-lg px-4 py-3 text-sm">
          An active program exists. Saving updates it in place — recorded exercise history and
          progress are kept.
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="program-name">Program name</Label>
          <Input
            id="program-name"
            value={values.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Specialty</Label>
          <Select
            value={values.specialtyId}
            onValueChange={(v) => set({ specialtyId: v, name: `Pediatric ${specialtyName(v)}` })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {changingSpecialty && (
            <p className="text-warning text-xs">
              Changing specialty starts a new pathway and closes the current program.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-date">Start date</Label>
          <Input
            id="start-date"
            type="date"
            value={values.startDate}
            onChange={(e) => set({ startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(values.durationWeeks)}
            onValueChange={(v) => v && set({ durationWeeks: Number(v) })}
            className="w-full"
          >
            {DURATIONS.map((d) => (
              <ToggleGroupItem key={d} value={String(d)} className={SELECTED}>
                {d} weeks
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Frequency</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(values.sessionsPerWeek)}
            onValueChange={(v) => v && set({ sessionsPerWeek: Number(v) })}
            className="w-full md:w-auto"
          >
            {FREQUENCIES.map((f) => (
              <ToggleGroupItem key={f} value={String(f)} className={`${SELECTED} px-4`}>
                {f} × / week
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <StepFooter
        primaryLabel={program.data ? 'Save program' : 'Create program'}
        onPrimary={submit}
        pending={save.isPending}
        disabled={values.name.trim().length < 3 || !values.startDate}
        hint="Milestones are generated from the specialty pathway template and can be edited in the last step."
      />
    </div>
  );
}
