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

export default function ProgramsPage() {
  const { data, isPending, error, refetch } = useAllPrograms();
  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rehabilitation programs"
        description="Active programs across all specialties."
      />
      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No active programs"
          description="Programs are created from a patient’s care plan."
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
                        <p className="font-semibold">{p.patient.fullName}</p>
                        <p className="text-muted-foreground text-sm">{p.name}</p>
                      </div>
                    </div>
                  </div>
                  <SpecialtyBadge specialty={p.specialty} />
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">Week</dt>
                      <dd className="tabular font-semibold">
                        {p.currentWeek} / {p.durationWeeks}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Frequency</dt>
                      <dd className="font-semibold">{p.sessionsPerWeek}× / wk</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Exercises</dt>
                      <dd className="tabular font-semibold">{p.exerciseCount}</dd>
                    </div>
                  </dl>
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                      Overall progress · started {formatDate(p.startDate)}
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
