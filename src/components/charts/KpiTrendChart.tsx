import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatShortDate } from '@/lib/format';
import type { PatientKpi } from '@/lib/types';
import { useTranslation } from 'react-i18next';

/** Categorical slots in fixed, validated order — colour follows the KPI's position, never its rank. */
const SERIES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

/** KPI trends over time on one 0–100 axis. More than four KPIs are split into small multiples by callers. */
export function KpiTrendChart({ kpis, className }: { kpis: PatientKpi[]; className?: string }) {
  const { t } = useTranslation('kpis');
  const series = kpis.slice(0, SERIES.length);

  const { data, config } = useMemo(() => {
    const byDay = new Map<string, Record<string, number | string>>();
    for (const k of series) {
      for (const point of k.trend) {
        const day = point.recordedAt.slice(0, 10);
        const row = byDay.get(day) ?? { day };
        row[k.kpi.code] = Math.round(point.value);
        byDay.set(day, row);
      }
    }
    const cfg: ChartConfig = {};
    series.forEach((k, i) => (cfg[k.kpi.code] = { label: t(k.kpi.name), color: SERIES[i] }));
    return {
      data: [...byDay.values()].sort((a, b) => String(a.day).localeCompare(String(b.day))),
      config: cfg,
    };
  }, [series]);

  return (
    <ChartContainer config={config} className={className ?? 'h-72 w-full'}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) => formatShortDate(v)}
          minTickGap={24}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickLine={false}
          axisLine={false}
          unit="%"
          width={48}
        />
        <ChartTooltip
          cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(v) => formatShortDate(String(v))}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((k) => (
          <Line
            key={k.kpi.code}
            dataKey={k.kpi.code}
            type="monotone"
            stroke={`var(--color-${k.kpi.code})`}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: 'var(--card)' }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
