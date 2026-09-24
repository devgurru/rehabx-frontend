import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAssessment, useCreateReferral, useReferrals, useSpecialties } from '@/api/queries';
import { CardSkeleton } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Referral } from '@/lib/types';
import { cn } from '@/lib/utils';
import { StepFooter } from './StepFooter';
import { type StepProps, useCarePlan } from './useCarePlan';
import { useTranslation } from 'react-i18next';

export function ReferralStep({ patientId, onComplete }: StepProps) {
  const { data: specialties } = useSpecialties();
  const assessment = useAssessment(patientId);
  const referrals = useReferrals(patientId);
  if (!specialties || assessment.isPending || referrals.isPending)
    return <CardSkeleton className="h-80" />;
  const recommended = assessment.data?.latest?.recommendedSpecialty?.id;
  return (
    <ReferralForm
      patientId={patientId}
      onComplete={onComplete}
      hasExisting={Boolean(referrals.data?.length)}
      specialties={specialties}
      defaultSpecialtyIds={recommended ? [recommended] : []}
    />
  );
}

function ReferralForm({
  patientId,
  onComplete,
  specialties,
  defaultSpecialtyIds,
  hasExisting,
}: StepProps & {
  specialties: { id: string; name: string; description: string; color: string }[];
  defaultSpecialtyIds: string[];
  hasExisting: boolean;
}) {
  const { t } = useTranslation('carePlan');
  const { draft, update } = useCarePlan(patientId);
  const create = useCreateReferral(patientId);
  const [created, setCreated] = useState<Referral[] | null>(null);
  const selected = draft.referral?.specialtyIds ?? defaultSpecialtyIds;
  const reason = draft.referral?.reason ?? t('referral.reasonDefault');

  const setReferral = (patch: Partial<{ specialtyIds: string[]; reason: string }>) =>
    update({ referral: { specialtyIds: selected, reason, ...patch } });

  const toggle = (id: string, checked: boolean) =>
    setReferral({ specialtyIds: checked ? [...selected, id] : selected.filter((s) => s !== id) });

  const submit = () =>
    create.mutate(
      { specialtyIds: selected, reason: reason.trim() },
      {
        onSuccess: (referrals) => {
          setCreated(referrals);
          toast.success(t('referral.success'));
        },
        onError: (e) => toast.error(e.message),
      },
    );

  if (created) {
    return (
      <div className="bg-success-soft/40 flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center">
        <span className="bg-success-soft text-success flex size-14 items-center justify-center rounded-full">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-xl font-semibold">{t('referral.success')}</p>
          <p className="text-muted-foreground text-sm">
            {created.map((r) => r.specialty.name).join(', ')} · {reason}
          </p>
        </div>
        <Button onClick={onComplete}>{t('referral.continue')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold">{t('referral.required')}</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {specialties.map((s) => {
            const checked = selected.includes(s.id);
            return (
              <Label
                key={s.id}
                htmlFor={`sp-${s.id}`}
                className={cn(
                  'hover:bg-muted/50 flex cursor-pointer flex-col items-start gap-3 rounded-xl border p-4 font-normal transition-colors',
                  checked && 'border-primary bg-brand-soft/50 ring-primary ring-1',
                )}
              >
                <div className="flex w-full items-center gap-2">
                  <Checkbox
                    id={`sp-${s.id}`}
                    checked={checked}
                    onCheckedChange={(v) => toggle(s.id, v === true)}
                  />
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                  <span className="font-semibold">{s.name}</span>
                </div>
                <span className="text-muted-foreground text-sm">{s.description}</span>
              </Label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="reason">{t('referral.reason')}</Label>
        <Textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReferral({ reason: e.target.value })}
        />
      </div>

      <p className="text-muted-foreground text-xs">
        {t('referral.note')}
      </p>

      <StepFooter
        primaryLabel={t('referral.create')}
        onPrimary={submit}
        pending={create.isPending}
        disabled={selected.length === 0 || reason.trim().length < 3}
        secondary={
          hasExisting ? (
            <Button variant="ghost" onClick={onComplete}>
              {t('referral.skip')}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
