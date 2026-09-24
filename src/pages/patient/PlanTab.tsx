import { ClipboardList, Send, Target } from 'lucide-react';
import { Link } from 'react-router';
import { useGoals, useProgram, useReferrals } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { ProgressBar } from '@/components/shared/progress';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export function PlanTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('patientDetail');
  const program = useProgram(patientId);
  const goals = useGoals(patientId);
  const referrals = useReferrals(patientId);

  if (program.isPending) return <CardSkeleton className="h-80" />;
  if (program.error)
    return <ErrorState error={program.error} onRetry={() => void program.refetch()} />;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="text-primary size-4" aria-hidden /> {t('plan.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!program.data ? (
            <EmptyState
              title={t('plan.noProgram')}
              description={t('plan.noProgramDesc')}
              action={
                <Button asChild size="sm">
                  <Link to={`/patients/${patientId}/care-plan`}>{t('plan.openCarePlan')}</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-semibold">{t(program.data.name)}</p>
                <SpecialtyBadge specialty={program.data.specialty} />
              </div>
              <dl className="grid gap-4 sm:grid-cols-4">
                {[
                  [t('plan.startDate'), formatDate(program.data.startDate)],
                  [t('plan.duration'), t('plan.durationWeeks', { weeks: program.data.durationWeeks })],
                  [t('plan.frequency'), t('plan.sessionsPerWeek', { sessions: program.data.sessionsPerWeek })],
                  [t('plan.currentWeek'), t('plan.weekNum', { week: program.data.currentWeek })],
                ].map(([label, value]) => (
                  <div key={label} className="bg-muted/60 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="mb-3 text-sm font-semibold">{t('plan.exerciseSchedule')}</p>
                <div className="divide-y rounded-lg border">
                  {program.data.exercises.map((e) => (
                    <div
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                    >
                      <span className="font-medium">{t(e.name)}</span>
                      <span className="text-muted-foreground">
                        {e.reps ? `${t('plan.reps', { reps: e.reps })} · ` : ''}
                        {t('plan.min', { min: e.durationMin })} · {t('plan.perWeek', { times: e.frequencyPerWeek })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary size-4" aria-hidden /> {t('plan.goals')}
            </CardTitle>
            <CardDescription>{t('plan.goalsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.data?.length ? (
              goals.data.map((g) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{t(g.title)}</span>
                    {g.status === 'ACHIEVED' && (
                      <Badge className="bg-success-soft text-success">{t('plan.achieved')}</Badge>
                    )}
                  </div>
                  <ProgressBar value={g.progress} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">{t('plan.noGoals')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="text-primary size-4" aria-hidden /> {t('plan.referrals')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals.data?.length ? (
              referrals.data.map((r) => (
                <div key={r.id} className="space-y-1.5 rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <SpecialtyBadge specialty={r.specialty} />
                    <span className="text-muted-foreground text-xs">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-muted-foreground">{t(r.reason)}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">{t('plan.noReferrals')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
