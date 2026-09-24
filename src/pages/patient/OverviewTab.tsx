import { CalendarDays, Dumbbell, Flag, HeartHandshake, Stethoscope } from 'lucide-react';
import { usePatientKpis } from '@/api/queries';
import { MilestoneStatusBadge } from '@/components/shared/badges';
import { ProgressBar, ProgressRing } from '@/components/shared/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import type { PatientDetail } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export function OverviewTab({ patient }: { patient: PatientDetail }) {
  const { t } = useTranslation('patientDetail');
  const { data: kpis } = usePatientKpis(patient.id);
  const b = patient.progressBreakdown;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('overview.rehabProgressTitle')}</CardTitle>
          <CardDescription>
            {t('overview.rehabProgressDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 sm:flex-row sm:items-center">
          <ProgressRing value={patient.progress} size={148} label={t('overview.overall')} />
          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('overview.kpiImprovement')}</span>
              </div>
              <ProgressBar value={b.kpiAttainment} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('overview.exerciseAdherence')}</span>
                <span className="tabular text-muted-foreground text-xs">
                  {t('overview.sessions', { completed: b.exercises.completed, planned: b.exercises.planned })}
                </span>
              </div>
              <ProgressBar value={b.adherence} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('overview.milestones')}</span>
                <span className="tabular text-muted-foreground text-xs">
                  {t('overview.achieved', { achieved: b.milestones.achieved, total: b.milestones.total })}
                </span>
              </div>
              <ProgressBar value={b.milestoneCompletion} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('overview.todayTitle')}</CardTitle>
          <CardDescription>{t('overview.todayDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="bg-brand-soft text-primary flex size-10 items-center justify-center rounded-lg">
              <Dumbbell className="size-5" aria-hidden />
            </span>
            <div>
              <p className="tabular text-2xl font-bold">
                {t('overview.exercisesCompleted', { completed: patient.today.completed, total: patient.today.total })}
              </p>
              <p className="text-muted-foreground text-xs">{t('overview.exercisesCompletedSub')}</p>
            </div>
          </div>
          {patient.nextMilestone && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <Flag className="size-3.5" aria-hidden /> {t('overview.nextMilestone', { week: patient.nextMilestone.targetWeek })}
              </p>
              <p className="font-semibold">{patient.nextMilestone.title}</p>
              <MilestoneStatusBadge status={patient.nextMilestone.status} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('overview.keyOutcomesTitle')}</CardTitle>
          <CardDescription>{t('overview.keyOutcomesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {kpis?.map((k) => (
            <div key={k.id} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{k.kpi.name}</span>
                <span className="tabular text-muted-foreground text-xs">
                  {Math.round(k.baseline)}% →{' '}
                  <span className="text-foreground font-semibold">{Math.round(k.current)}%</span> ·{' '}
                  {t('overview.target', { value: Math.round(k.target) })}
                </span>
              </div>
              <ProgressBar value={k.current} showValue={false} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('overview.careTeamTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex gap-3">
            <Stethoscope className="text-primary mt-0.5 size-4" aria-hidden />
            <div>
              <p className="font-medium">{patient.clinician.name}</p>
              <p className="text-muted-foreground text-xs">{patient.clinician.title}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <HeartHandshake className="text-primary mt-0.5 size-4" aria-hidden />
            <div>
              <p className="font-medium">{patient.caregiver.name}</p>
              <p className="text-muted-foreground text-xs">
                {patient.caregiver.relationship} · {t('overview.caregiverApp')}
              </p>
            </div>
          </div>
          {patient.program && (
            <div className="flex gap-3">
              <CalendarDays className="text-primary mt-0.5 size-4" aria-hidden />
              <div>
                <p className="font-medium">{patient.program.name}</p>
                <p className="text-muted-foreground text-xs">
                  {t('overview.started', { 
                    date: formatDate(patient.program.startDate),
                    current: patient.program.currentWeek,
                    total: patient.program.durationWeeks 
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
