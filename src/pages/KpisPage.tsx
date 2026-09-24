import { Layers, Settings2 } from 'lucide-react';
import { useDashboard, useKpiDefinitions } from '@/api/queries';
import { KpiComparisonChart } from '@/components/charts/KpiComparisonChart';
import { SpecialtyBadge } from '@/components/shared/badges';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState, PageSkeleton } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { KpiCategory } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export default function KpisPage() {
  const { t } = useTranslation('kpis');
  
  const CATEGORIES: { key: KpiCategory; title: string; description: string }[] = [
    {
      key: 'GENERAL',
      title: t('catGeneralTitle'),
      description: t('catGeneralDesc'),
    },
    {
      key: 'SPECIALTY',
      title: t('catSpecialtyTitle'),
      description: t('catSpecialtyDesc'),
    },
    {
      key: 'DIAGNOSIS',
      title: t('catDiagnosisTitle'),
      description: t('catDiagnosisDesc'),
    },
  ];

  const definitions = useKpiDefinitions();
  const dashboard = useDashboard();
  if (definitions.isPending) return <PageSkeleton />;
  if (definitions.error)
    return <ErrorState error={definitions.error} onRetry={() => void definitions.refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Badge variant="outline" className="gap-1">
            <Settings2 aria-hidden /> {t('configPreview')}
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('cohortOutcomes')}</CardTitle>
          <CardDescription>
            {t('cohortDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard.data && <KpiComparisonChart data={dashboard.data.kpiOverview} />}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Card key={c.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="text-primary size-4" aria-hidden /> {c.title}
              </CardTitle>
              <CardDescription>{c.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {definitions.data
                .filter((k) => k.category === c.key)
                .map((k) => (
                  <div key={k.id} className="space-y-1.5 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium" dir="auto">{k.name}</p>
                      <span className="text-muted-foreground text-xs" dir="auto">{k.unit}</span>
                    </div>
                    <p className="text-muted-foreground text-xs" dir="auto">{k.description}</p>
                    {k.specialty && <SpecialtyBadge specialty={k.specialty} />}
                    {k.diagnosis && <Badge variant="secondary" dir="auto">{k.diagnosis.name}</Badge>}
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
