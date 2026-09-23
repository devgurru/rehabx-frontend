import { ArrowRight, ClipboardList, Eye, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useDashboard } from '@/api/queries';
import { AdherenceChart } from '@/components/charts/AdherenceChart';
import { KpiComparisonChart } from '@/components/charts/KpiComparisonChart';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import { SpecialtyBadge } from '@/components/shared/badges';
import { PageHeader } from '@/components/shared/PageHeader';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { ProgressBar } from '@/components/shared/progress';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/states';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate, formatShortDate, todayIso } from '@/lib/format';
import { useAppSelector } from '@/store/hooks';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data, isPending, error, refetch } = useDashboard();

  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const { stats } = data;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(todayIso())}
        title={`${greeting()}, Dr. ${user?.firstName ?? ''}`}
        description="Here is how your pediatric rehabilitation caseload is progressing."
        actions={
          <Button asChild>
            <Link to="/patients">
              <Users /> View patients
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total patients"
          value={stats.totalPatients}
          icon={Users}
          hint="Pediatric caseload"
        />
        <StatCard
          label="Active programs"
          value={stats.activePrograms}
          icon={ClipboardList}
          hint="Across 3 specialties"
        />
        <StatCard
          label="Requiring review"
          value={stats.requiringReview}
          icon={Eye}
          hint={stats.requiringReview ? 'Awaiting physician review' : 'All patients reviewed'}
        />
        <StatCard
          label="Average progress"
          value={`${stats.averageProgress}%`}
          icon={TrendingUp}
          hint="Patients in an active program"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>KPI overview</CardTitle>
            <CardDescription>
              Cohort average of general KPIs — baseline, current and target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KpiComparisonChart data={data.kpiOverview} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requires review</CardTitle>
            <CardDescription>New assessments awaiting a care plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.requiresReview.length === 0 ? (
              <EmptyState
                title="All caught up"
                description="Every assessed patient has an active care plan."
              />
            ) : (
              data.requiresReview.map((p) => (
                <div key={p.id} className="bg-warning-soft/40 space-y-3 rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <PatientAvatar name={p.fullName} color={p.avatarColor} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.fullName}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.age} years · {p.diagnosis.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Assessed {p.lastAssessmentAt ? formatShortDate(p.lastAssessmentAt) : '—'} ·
                    recommended {p.specialty?.name ?? 'specialty pending'}
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/patients/${p.id}/care-plan`}>
                      Start care plan <ArrowRight />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patient progress</CardTitle>
            <CardDescription>Overall rehabilitation progress</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/patients">All</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topPatients.map((p) => (
              <Link
                key={p.id}
                to={`/patients/${p.id}`}
                className="hover:bg-muted/60 block space-y-2 rounded-lg p-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <PatientAvatar name={p.fullName} color={p.avatarColor} size="sm" />
                    <span className="truncate text-sm font-medium">{p.firstName}</span>
                  </span>
                  <SpecialtyBadge specialty={p.specialty} />
                </div>
                <ProgressBar value={p.progress} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home exercise sessions</CardTitle>
            <CardDescription>Completed by caregivers, last 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <AdherenceChart
              data={data.adherenceTrend.map((w) => ({
                label: formatShortDate(w.weekStart),
                completed: w.completed,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Across all patients</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            <ActivityFeed events={data.recentActivity.slice(0, 8)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
