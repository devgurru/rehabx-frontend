import { useState } from 'react';
import { toast } from 'sonner';
import { useAssessment, useCreateAssessment, useSpecialties } from '@/api/queries';
import { CardSkeleton, ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import type { Assessment, AssessmentInput, DomainKey } from '@/lib/types';
import { StepFooter } from './StepFooter';
import type { StepProps } from './useCarePlan';

type FormState = {
  scores: Record<DomainKey, number | null>;
  notes: Record<DomainKey, string>;
  currentAbilities: string;
  riskNotes: string;
  clinicalConcerns: string;
  summary: string;
  recommendedSpecialtyId: string;
};

const DOMAIN_ORDER: { key: DomainKey; label: string; group: 'Motor' | 'Function' }[] = [
  { key: 'mobility', label: 'Mobility', group: 'Motor' },
  { key: 'motorSkills', label: 'Motor skills', group: 'Motor' },
  { key: 'balance', label: 'Balance', group: 'Motor' },
  { key: 'upperLimb', label: 'Upper-limb function', group: 'Motor' },
  { key: 'lowerLimb', label: 'Lower-limb function', group: 'Motor' },
  { key: 'communication', label: 'Communication', group: 'Function' },
  { key: 'dailyFunction', label: 'Daily activity / function', group: 'Function' },
];

function toForm(a: Assessment | null): FormState {
  const scores = {} as FormState['scores'];
  const notes = {} as FormState['notes'];
  for (const { key } of DOMAIN_ORDER) {
    const domain = a?.domains.find((d) => d.key === key);
    scores[key] = domain?.score ?? null;
    notes[key] = domain?.notes ?? '';
  }
  return {
    scores,
    notes,
    currentAbilities: a?.currentAbilities ?? '',
    riskNotes: a?.riskNotes ?? '',
    clinicalConcerns: a?.clinicalConcerns ?? '',
    summary: a?.summary ?? '',
    recommendedSpecialtyId: a?.recommendedSpecialty?.id ?? '',
  };
}

function toInput(form: FormState): AssessmentInput {
  const input: AssessmentInput = {};
  for (const { key } of DOMAIN_ORDER) {
    const score = form.scores[key];
    if (score !== null) input[`${key}Score`] = score;
    if (form.notes[key]) input[`${key}Notes`] = form.notes[key];
  }
  for (const field of ['currentAbilities', 'riskNotes', 'clinicalConcerns', 'summary'] as const) {
    if (form[field]) input[field] = form[field];
  }
  if (form.recommendedSpecialtyId) input.recommendedSpecialtyId = form.recommendedSpecialtyId;
  return input;
}

export function AssessmentStep({ patientId, onComplete }: StepProps) {
  const { data, isPending, error, refetch } = useAssessment(patientId);
  if (isPending) return <CardSkeleton className="h-[32rem]" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  return <AssessmentForm patientId={patientId} onComplete={onComplete} latest={data.latest} />;
}

function AssessmentForm({
  patientId,
  onComplete,
  latest,
}: StepProps & { latest: Assessment | null }) {
  const { data: specialties } = useSpecialties();
  const create = useCreateAssessment(patientId);
  const [form, setForm] = useState<FormState>(() => toForm(latest));
  const [dirty, setDirty] = useState(false);

  const patch = (p: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
  };

  const save = () =>
    create.mutate(toInput(form), {
      onSuccess: () => {
        toast.success(latest ? 'Re-assessment saved' : 'Assessment saved');
        onComplete();
      },
      onError: (e) => toast.error(e.message),
    });

  return (
    <div className="space-y-8">
      {latest && (
        <p className="bg-brand-soft/60 text-accent-foreground rounded-lg px-4 py-3 text-sm">
          Showing the assessment from{' '}
          <span className="font-semibold">{formatDate(latest.assessedAt)}</span>. Review it, adjust
          any score, and save as a re-assessment — or continue if nothing changed.
        </p>
      )}

      <section className="space-y-5">
        <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Functional assessment
        </h3>
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {DOMAIN_ORDER.map(({ key, label }) => {
            const score = form.scores[key];
            return (
              <div key={key} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`score-${key}`}>{label}</Label>
                  <span className="tabular bg-muted rounded-md px-2 py-0.5 text-sm font-semibold">
                    {score === null ? '—' : `${score}%`}
                  </span>
                </div>
                <Slider
                  id={`score-${key}`}
                  min={0}
                  max={100}
                  step={1}
                  value={[score ?? 0]}
                  onValueChange={([v]) => patch({ scores: { ...form.scores, [key]: v } })}
                  aria-label={`${label} score`}
                />
                <Textarea
                  value={form.notes[key]}
                  onChange={(e) => patch({ notes: { ...form.notes, [key]: e.target.value } })}
                  placeholder="Observations"
                  rows={2}
                  className="min-h-0 text-sm"
                  aria-label={`${label} observations`}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="abilities">Current abilities</Label>
          <Textarea
            id="abilities"
            rows={3}
            value={form.currentAbilities}
            onChange={(e) => patch({ currentAbilities: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Clinical summary</Label>
          <Textarea
            id="summary"
            rows={3}
            value={form.summary}
            onChange={(e) => patch({ summary: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="risk">Risk notes</Label>
          <Textarea
            id="risk"
            rows={2}
            value={form.riskNotes}
            onChange={(e) => patch({ riskNotes: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="concerns">Clinical concerns</Label>
          <Textarea
            id="concerns"
            rows={2}
            value={form.clinicalConcerns}
            onChange={(e) => patch({ clinicalConcerns: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Recommended specialty</Label>
          <Select
            value={form.recommendedSpecialtyId}
            onValueChange={(v) => patch({ recommendedSpecialtyId: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialties?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <StepFooter
        hint="Scores are prototype 0–100 ratings, not standardised clinical instruments."
        primaryLabel={dirty || !latest ? 'Save assessment' : 'Continue to review'}
        pending={create.isPending}
        onPrimary={dirty || !latest ? save : onComplete}
        secondary={
          dirty && latest ? (
            <Button
              variant="ghost"
              onClick={() => {
                setForm(toForm(latest));
                setDirty(false);
              }}
            >
              Discard changes
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
