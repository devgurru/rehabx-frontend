import { Bar, CartesianGrid, ComposedChart, Scatter, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface KpiComparisonDatum {
  name: string;
  baseline: number;
  current: number;
  target: number;
}

const config = {
  baseline: { label: 'Baseline', color: 'var(--series-baseline)' },
  current: { label: 'Current', color: 'var(--chart-1)' },
  target: { label: 'Target', color: 'var(--foreground)' },
} satisfies ChartConfig;

/** Target marker — a short horizontal tick centred over the KPI's bar group. */
function TargetTick(props: { cx?: number; cy?: number }) {
  if (props.cx === undefined || props.cy === undefined) return null;
  return (
    <rect
      x={props.cx - 18}
      y={props.cy - 1.5}
      width={36}
      height={3}
      rx={1.5}
      fill="var(--foreground)"
    />
  );
}

/** Baseline vs current per KPI, with the target shown as a tick — magnitude on one shared 0–100 axis. */
export function KpiComparisonChart({
  data,
  className,
}: {
  data: KpiComparisonDatum[];
  className?: string;
}) {
  return (
    <ChartContainer config={config} className={className ?? 'h-72 w-full'}>
      <ComposedChart
        data={data}
        barGap={2}
        barCategoryGap="28%"
        margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickLine={false}
          axisLine={false}
          unit="%"
          width={48}
        />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
          content={<ChartTooltipContent formatter={percentFormatter} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="baseline"
          fill="var(--color-baseline)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar dataKey="current" fill="var(--color-current)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Scatter
          dataKey="target"
          fill="var(--color-target)"
          shape={<TargetTick />}
          legendType="rect"
        />
      </ComposedChart>
    </ChartContainer>
  );
}

function percentFormatter(value: unknown, name: unknown) {
  const label = config[name as keyof typeof config]?.label ?? String(name);
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular text-foreground font-medium">{Math.round(Number(value))}%</span>
    </div>
  );
}
