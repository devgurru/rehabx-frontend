import { Building2, ClipboardList, Dumbbell, Gauge, Layers, Send } from 'lucide-react';
import { usePlatformStats } from '@/api/queries';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState, PageSkeleton } from '@/components/shared/states';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ROADMAP = [
  {
    title: 'Additional pathways',
    text: 'Neurological, stroke and orthopedic rehabilitation as configured specialties.',
  },
  {
    title: 'Real motion tracking',
    text: 'Computer-vision rep counting and form feedback replacing the simulated coach.',
  },
  {
    title: 'Integrations',
    text: 'EMR/HIS, national health platforms and insurance — out of prototype scope.',
  },
  {
    title: 'Scheduling & telehealth',
    text: 'Therapist matching, appointments and video sessions.',
  },
];

export default function ReportsPage() {
  const { data, isPending, error, refetch } = usePlatformStats();
  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & platform"
        description="Platform statistics and the configuration that makes RehabX multi-specialty."
        actions={<Badge variant="outline">Administration preview</Badge>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Specialties"
          value={data.totals.specialties}
          icon={Building2}
          hint="Configured as data"
        />
        <StatCard
          label="Outcome KPIs"
          value={data.totals.kpis}
          icon={Gauge}
          hint="General, specialty & diagnosis"
        />
        <StatCard
          label="Exercise library"
          value={data.totals.exercises}
          icon={Dumbbell}
          hint="3 with AI / 3D guides"
        />
        <StatCard label="Programs" value={data.totals.programs} icon={ClipboardList} />
        <StatCard label="Referrals" value={data.totals.referrals} icon={Send} />
        <StatCard
          label="Home sessions completed"
          value={data.totals.completedSessions}
          icon={Layers}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
            <CardDescription>
              Each pathway is a database entity with its own exercises, KPIs and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Specialty</TableHead>
                  <TableHead className="text-right">Exercises</TableHead>
                  <TableHead className="pr-6 text-right">Programs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.specialties.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6">
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                          aria-hidden
                        />
                        {s.name}
                      </span>
                    </TableCell>
                    <TableCell className="tabular text-right">{s.exercises}</TableCell>
                    <TableCell className="tabular pr-6 text-right">{s.programs}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product roadmap</CardTitle>
            <CardDescription>
              Designed for, but intentionally not built in, the prototype
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ROADMAP.map((r) => (
              <div key={r.title} className="rounded-lg border p-3">
                <p className="font-medium">{r.title}</p>
                <p className="text-muted-foreground text-sm">{r.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
