import { useProgress } from '@/api/queries';
import { AdherenceChart } from '@/components/charts/AdherenceChart';
import { ProgressBar, ProgressRing } from '@/components/shared/progress';
import { CardSkeleton, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export function ProgressTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('patientDetail');
  const { data, isPending, error, refetch } = useProgress(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const planned = data.weeklyAdherence[0]?.planned;
  const tiles = [
    { label: t('progress.overall'), value: `${data.overall}%` },
    {
      label: t('progress.exercisesCompleted'),
      value: `${data.exercises.completed} / ${data.exercises.planned}`,
    },
    {
      label: t('progress.milestonesAchieved'),
      value: `${data.milestones.achieved} / ${data.milestones.total}`,
    },
    { label: t('progress.adherence'), value: `${data.adherence}%` },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>{t('progress.overall')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <ProgressRing value={data.overall} size={168} stroke={12} label={t('progress.overallLabel')} />
          <dl className="grid w-full grid-cols-2 gap-3">
            {tiles.slice(1).map((t) => (
              <div key={t.label} className="bg-muted/60 rounded-lg p-3">
                <dt className="text-muted-foreground text-xs">{t.label}</dt>
                <dd className="tabular mt-1 text-lg font-semibold">{t.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('progress.weeklyCompletion')}</CardTitle>
          <CardDescription>
            {t('progress.weeklyCompletionDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdherenceChart
            className="h-64 w-full"
            planned={planned}
            data={data.weeklyAdherence.map((w) => ({
              label: t('progress.week', { week: w.week }),
              completed: w.completed,
              planned: w.planned,
            }))}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{t('progress.goalProgress')}</CardTitle>
          <CardDescription>{t('progress.goalProgressDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-3">
          {data.goals.map((g) => (
            <div key={g.id} className="space-y-2">
              <p className="text-sm font-medium">{g.title}</p>
              <ProgressBar value={g.progress} />
              {g.kpiName && (
                <p className="text-muted-foreground text-xs">{t('progress.measuredBy', { name: g.kpiName })}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
