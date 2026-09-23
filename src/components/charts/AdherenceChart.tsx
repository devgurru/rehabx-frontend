import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface AdherenceDatum {
  label: string;
  completed: number;
  planned?: number;
}

const config = {
  completed: { label: 'Sessions completed', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/** Completed exercise sessions per period; the plan is a reference line rather than a second series. */
export function AdherenceChart({
  data,
  planned,
  className,
}: {
  data: AdherenceDatum[];
  planned?: number;
  className?: string;
}) {
  const max = Math.max(planned ?? 0, ...data.map((d) => d.completed));
  return (
    <ChartContainer config={config} className={className ?? 'h-56 w-full'}>
      <BarChart
        data={data}
        barCategoryGap="30%"
        margin={{ top: 16, right: 8, left: -20, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          allowDecimals={false}
          domain={[0, Math.ceil(max * 1.15)]}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
          content={<ChartTooltipContent />}
        />
        {planned !== undefined && (
          <ReferenceLine
            y={planned}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            label={{
              value: `Planned ${planned}`,
              position: 'insideTopRight',
              fill: 'var(--muted-foreground)',
              fontSize: 11,
            }}
          />
        )}
        <Bar
          dataKey="completed"
          fill="var(--color-completed)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ChartContainer>
  );
}
