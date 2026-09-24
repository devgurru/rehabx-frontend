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
import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
  const { t } = useTranslation('reports');
  const { data, isPending, error, refetch } = usePlatformStats();

  const ROADMAP = [
    {
      title: t('roadmap1Title'),
      text: t('roadmap1Text'),
    },
    {
      title: t('roadmap2Title'),
      text: t('roadmap2Text'),
    },
    {
      title: t('roadmap3Title'),
      text: t('roadmap3Text'),
    },
    {
      title: t('roadmap4Title'),
      text: t('roadmap4Text'),
    },
  ];
  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={<Badge variant="outline">{t('adminPreview')}</Badge>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={t('statSpecialties')}
          value={data.totals.specialties}
          icon={Building2}
          hint={t('hintSpecialties')}
        />
        <StatCard
          label={t('statKpis')}
          value={data.totals.kpis}
          icon={Gauge}
          hint={t('hintKpis')}
        />
        <StatCard
          label={t('statExercises')}
          value={data.totals.exercises}
          icon={Dumbbell}
          hint={t('hintExercises')}
        />
        <StatCard label={t('statPrograms')} value={data.totals.programs} icon={ClipboardList} />
        <StatCard label={t('statReferrals')} value={data.totals.referrals} icon={Send} />
        <StatCard
          label={t('statSessions')}
          value={data.totals.completedSessions}
          icon={Layers}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('statSpecialties')}</CardTitle>
            <CardDescription>
              {t('cardSpecialtiesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">{t('tableSpecialty')}</TableHead>
                  <TableHead className="text-end">{t('tableExercises')}</TableHead>
                  <TableHead className="pr-6 text-end">{t('tablePrograms')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.specialties.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6">
                      <span className="flex items-center gap-2 font-medium" dir="auto">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                          aria-hidden
                        />
                        {s.name}
                      </span>
                    </TableCell>
                    <TableCell className="tabular text-end">{s.exercises}</TableCell>
                    <TableCell className="tabular pr-6 text-end">{s.programs}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('roadmapTitle')}</CardTitle>
            <CardDescription>
              {t('roadmapDesc')}
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
