import { ArrowRight, ClipboardList, Eye, Sparkles, TrendingUp, Users, X } from 'lucide-react';
import { useState } from 'react';
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
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const user = useAppSelector((s) => s.auth.user);
  const { data, isPending, error, refetch } = useDashboard();
  const [showBanner, setShowBanner] = useState(true);

  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const { stats } = data;
  
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(todayIso())}
        title={t('greeting.title', { greeting: t(`greeting.${greetingKey}`), name: user?.firstName ?? '' })}
        description={t('header.description')}
        actions={
          <Button asChild>
            <Link to="/patients">
              <Users /> {t('header.viewPatients')}
            </Link>
          </Button>
        }
      />

      {showBanner && (
        <div className="bg-brand-soft/50 border-brand/20 relative flex items-start gap-4 rounded-xl border p-4 shadow-sm sm:items-center">
          <div className="bg-brand text-brand-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-foreground font-semibold">{t('demoBanner.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('demoBanner.description')}</p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
            aria-label={t('demoBanner.dismiss')}
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('stats.totalPatients')}
          value={stats.totalPatients}
          icon={Users}
          hint={t('stats.pediatricCaseload')}
        />
        <StatCard
          label={t('stats.activePrograms')}
          value={stats.activePrograms}
          icon={ClipboardList}
          hint={t('stats.acrossSpecialties')}
        />
        <StatCard
          label={t('stats.requiringReview')}
          value={stats.requiringReview}
          icon={Eye}
          hint={stats.requiringReview ? t('stats.awaitingReview') : t('stats.allReviewed')}
        />
        <StatCard
          label={t('stats.averageProgress')}
          value={`${stats.averageProgress}%`}
          icon={TrendingUp}
          hint={t('stats.patientsInProgram')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('cards.kpi.title')}</CardTitle>
            <CardDescription>
              {t('cards.kpi.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KpiComparisonChart data={data.kpiOverview} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cards.requiresReview.title')}</CardTitle>
            <CardDescription>{t('cards.requiresReview.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.requiresReview.length === 0 ? (
              <EmptyState
                title={t('cards.requiresReview.allCaughtUp')}
                description={t('cards.requiresReview.allCaughtUpDesc')}
              />
            ) : (
              data.requiresReview.map((p) => (
                <div key={p.id} className="bg-warning-soft/40 space-y-3 rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <PatientAvatar name={p.fullName} color={p.avatarColor} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.fullName}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {t('cards.requiresReview.years', { age: p.age })} · {p.diagnosis.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t('cards.requiresReview.assessed')} {p.lastAssessmentAt ? formatShortDate(p.lastAssessmentAt) : '—'} ·
                    {' '}{t('cards.requiresReview.recommended')} {p.specialty?.name ?? t('cards.requiresReview.specialtyPending')}
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/patients/${p.id}/care-plan`}>
                      {t('cards.requiresReview.startCarePlan')} <ArrowRight className={document.documentElement.dir === 'rtl' ? 'rotate-180' : ''} />
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
            <CardTitle>{t('cards.patientProgress.title')}</CardTitle>
            <CardDescription>{t('cards.patientProgress.description')}</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/patients">{t('cards.patientProgress.all')}</Link>
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

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t('cards.homeExercise.title')}</CardTitle>
            <CardDescription>{t('cards.homeExercise.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <AdherenceChart
              className="h-full w-full min-h-[14rem] aspect-auto"
              data={data.adherenceTrend.map((w) => ({
                label: formatShortDate(w.weekStart),
                completed: w.completed,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cards.recentActivity.title')}</CardTitle>
            <CardDescription>{t('cards.recentActivity.description')}</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            <ActivityFeed events={data.recentActivity.slice(0, 8)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
