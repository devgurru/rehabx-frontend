import { usePatientKpis } from '@/api/queries';
import { KpiCard } from '@/components/charts/KpiCard';
import { KpiComparisonChart } from '@/components/charts/KpiComparisonChart';
import { KpiTrendChart } from '@/components/charts/KpiTrendChart';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export function KpisTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('patientDetail');
  const { data, isPending, error, refetch } = usePatientKpis(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length)
    return (
      <EmptyState title={t('kpis.noKpis')} description={t('kpis.noKpisDesc')} />
    );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('kpis.baselineVsTarget')}</CardTitle>
            <CardDescription>{t('kpis.sharedScale')}</CardDescription>
          </CardHeader>
          <CardContent>
            <KpiComparisonChart
              data={data.map((k) => ({
                name: t(k.kpi.name),
                baseline: k.baseline,
                current: k.current,
                target: k.target,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('kpis.trendTitle')}</CardTitle>
            <CardDescription>{t('kpis.trendDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <KpiTrendChart kpis={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
