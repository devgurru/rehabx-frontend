import { Stethoscope } from 'lucide-react';
import { useAssessment, useGoals, usePatient, usePatientKpis } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { ProgressBar } from '@/components/shared/progress';
import { CardSkeleton } from '@/components/shared/states';
import { StepFooter } from './StepFooter';
import type { StepProps } from './useCarePlan';
import { useTranslation } from 'react-i18next';

/** One-glance clinical review: diagnosis, baseline, primary goals and recommended specialty (spec §14). */
export function ReviewStep({ patientId, onComplete }: StepProps) {
  const { t } = useTranslation('carePlan');
  const patient = usePatient(patientId);
  const assessment = useAssessment(patientId);
  const kpis = usePatientKpis(patientId);
  const goals = useGoals(patientId);

  if (patient.isPending || assessment.isPending || kpis.isPending)
    return <CardSkeleton className="h-96" />;

  const latest = assessment.data?.latest;
  const recommended = latest?.recommendedSpecialty ?? null;
  const goalTitles = goals.data?.length
    ? goals.data.map((g) => g.title)
    : (kpis.data ?? []).slice(0, 2).map((k) => t('review.improve', { name: k.kpi.name.toLowerCase() }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2 rounded-xl border p-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t('review.diagnosis')}
          </p>
          <p className="text-xl font-semibold">{patient.data?.diagnosis.name}</p>
          <p className="text-muted-foreground text-sm">{latest?.summary}</p>
        </section>
        <section className="space-y-3 rounded-xl border p-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t('review.recommendedSpecialty')}
          </p>
          <SpecialtyBadge specialty={recommended} className="h-7 px-3 text-sm" />
          <p className="text-muted-foreground flex items-start gap-2 text-sm">
            <Stethoscope className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            {t('review.physicianNote')}
          </p>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {t('review.baseline')}
        </p>
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          {(kpis.data ?? []).map((k) => (
            <div key={k.id} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{k.kpi.name}</span>
                <span className="text-muted-foreground text-xs">
                  {t('review.target', { value: Math.round(k.target) })}
                </span>
              </div>
              <ProgressBar value={k.baseline} color="var(--series-baseline)" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-xl border p-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t('review.primaryGoals')}
          </p>
          <ul className="space-y-2">
            {goalTitles.map((g) => (
              <li key={g} className="flex items-center gap-2 text-sm font-medium">
                <span className="bg-primary size-1.5 rounded-full" aria-hidden /> {g}
              </li>
            ))}
          </ul>
        </section>
        <section className="border-warning/20 bg-warning-soft/40 space-y-3 rounded-xl border p-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t('review.risk')}
          </p>
          <p className="text-sm">{latest?.riskNotes ?? t('review.noneRecorded')}</p>
          <p className="text-muted-foreground text-sm">{latest?.clinicalConcerns}</p>
        </section>
      </div>

      <StepFooter
        primaryLabel={t('review.confirm')}
        onPrimary={onComplete}
        hint={t('review.hint')}
      />
    </div>
  );
}
