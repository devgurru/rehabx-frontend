import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PatientKpi } from '@/lib/types';
import { KpiSparkline } from './KpiSparkline';

const categoryLabel = {
  GENERAL: 'General',
  SPECIALTY: 'Specialty',
  DIAGNOSIS: 'Diagnosis',
} as const;

import { useTranslation } from 'react-i18next';

/** Baseline → current → target for one KPI, with a track that shows all three positions. */
export function KpiCard({ kpi }: { kpi: PatientKpi }) {
  const { t } = useTranslation('kpis');
  const { baseline, current, target } = kpi;
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{t(kpi.kpi.name)}</p>
            <p className="text-muted-foreground text-xs">{t(categoryLabel[kpi.kpi.category])} KPI</p>
          </div>
          <span className="bg-success-soft text-success inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
            <TrendingUp className="size-3" aria-hidden />+{Math.round(kpi.change)}
          </span>
        </div>

        <div className="flex items-end gap-6">
          <div>
            <p className="tabular text-3xl font-bold tracking-tight">{Math.round(current)}%</p>
            <p className="text-muted-foreground text-xs">Current</p>
          </div>
          <div className="text-sm">
            <p className="tabular font-semibold">{Math.round(baseline)}%</p>
            <p className="text-muted-foreground text-xs">Baseline</p>
          </div>
          <div className="text-sm">
            <p className="tabular font-semibold">{Math.round(target)}%</p>
            <p className="text-muted-foreground text-xs">Target</p>
          </div>
        </div>

        <div
          className="bg-muted relative h-2 rounded-full"
          role="img"
          aria-label={`${kpi.kpi.name}: baseline ${baseline}%, current ${current}%, target ${target}%`}
        >
          <div
            className="absolute inset-y-0 rounded-full bg-[var(--series-baseline)]/50"
            style={{ left: 0, width: `${baseline}%` }}
          />
          <div
            className="bg-primary absolute inset-y-0 rounded-full"
            style={{ left: `${baseline}%`, width: `${Math.max(0, current - baseline)}%` }}
          />
          <div
            className="bg-foreground absolute -top-1 h-4 w-0.5 rounded"
            style={{ left: `${target}%` }}
          />
        </div>

        <KpiSparkline values={kpi.trend.map((t) => t.value)} target={target} />
        <p className="text-muted-foreground text-xs">
          <span className="text-foreground font-semibold">{kpi.goalProgress}%</span> of the way from
          baseline to target
        </p>
      </CardContent>
    </Card>
  );
}
