import { Line, LineChart, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts';

/** Compact trend for KPI cards — one series, target as a dashed reference, no axes. */
export function KpiSparkline({ values, target }: { values: number[]; target: number }) {
  const data = values.map((value, i) => ({ i, value }));
  return (
    <div className="h-14 w-full" aria-hidden>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <YAxis hide domain={[0, 100]} />
          <ReferenceLine y={target} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
          <Line
            dataKey="value"
            type="monotone"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
