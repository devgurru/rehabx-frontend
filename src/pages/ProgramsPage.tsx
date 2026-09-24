import { ClipboardList } from 'lucide-react';
import { Link } from 'react-router';
import { useAllPrograms } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { PageHeader } from '@/components/shared/PageHeader';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { ProgressBar } from '@/components/shared/progress';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/states';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export default function ProgramsPage() {
  const { t, i18n } = useTranslation('programs');
  const { data, isPending, error, refetch } = useAllPrograms();
  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('emptyTitle')}
          description={t('emptyDesc')}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => (
            <Link key={p.id} to={`/patients/${p.patient.id}?tab=plan`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={p.patient.fullName} color={p.patient.avatarColor} />
                      <div>
                        <p className="font-semibold" dir="auto">{p.patient.fullName}</p>
                        <p className="text-muted-foreground text-sm" dir="auto">{p.name}</p>
                      </div>
                    </div>
                  </div>
                  <SpecialtyBadge specialty={p.specialty} />
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('week')}</dt>
                      <dd className="tabular font-semibold">
                        {p.currentWeek} / {p.durationWeeks}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('frequency')}</dt>
                      <dd className="font-semibold">{t('timesPerWk', { times: p.sessionsPerWeek })}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('exercises')}</dt>
                      <dd className="tabular font-semibold">{p.exerciseCount}</dd>
                    </div>
                  </dl>
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                      {t('progress', { date: formatDate(p.startDate, i18n.language) })}
                    </p>
                    <ProgressBar value={p.progress} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
