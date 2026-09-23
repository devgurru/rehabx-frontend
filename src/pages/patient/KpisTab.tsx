import { usePatientKpis } from '@/api/queries';
import { KpiCard } from '@/components/charts/KpiCard';
import { KpiComparisonChart } from '@/components/charts/KpiComparisonChart';
import { KpiTrendChart } from '@/components/charts/KpiTrendChart';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function KpisTab({ patientId }: { patientId: string }) {
  const { data, isPending, error, refetch } = usePatientKpis(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length)
    return (
      <EmptyState title="No KPIs yet" description="KPIs are set from the baseline assessment." />
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
            <CardTitle>Baseline vs current vs target</CardTitle>
            <CardDescription>All KPIs on a shared 0–100 scale</CardDescription>
          </CardHeader>
          <CardContent>
            <KpiComparisonChart
              data={data.map((k) => ({
                name: k.kpi.name,
                baseline: k.baseline,
                current: k.current,
                target: k.target,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trend over time</CardTitle>
            <CardDescription>Weekly KPI reviews since the baseline assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <KpiTrendChart kpis={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
