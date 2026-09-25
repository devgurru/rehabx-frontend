import { ArrowLeft, ClipboardPen } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router';
import { usePatient } from '@/api/queries';
import { PatientStatusBadge, SpecialtyBadge } from '@/components/shared/badges';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { ProgressRing } from '@/components/shared/progress';
import { ErrorState, PageSkeleton } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentTab } from './AssessmentTab';
import { ExercisesTab } from './ExercisesTab';
import { KpisTab } from './KpisTab';
import { MilestonesTab } from './MilestonesTab';
import { OverviewTab } from './OverviewTab';
import { PlanTab } from './PlanTab';
import { ProgressTab } from './ProgressTab';
import { SessionsTab } from './SessionsTab';
import { TimelineTab } from './TimelineTab';

const TABS = [
  { value: 'overview', i18nKey: 'overview' },
  { value: 'assessment', i18nKey: 'assessment' },
  { value: 'plan', i18nKey: 'plan' },
  { value: 'exercises', i18nKey: 'exercises' },
  { value: 'sessions', i18nKey: 'sessions' },
  { value: 'kpis', i18nKey: 'kpis' },
  { value: 'progress', i18nKey: 'progress' },
  { value: 'milestones', i18nKey: 'milestones' },
  { value: 'timeline', i18nKey: 'timeline' },
] as const;

import { useTranslation } from 'react-i18next';

export default function PatientDetailPage() {
  const { t, i18n } = useTranslation('patientDetail');
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab')! : 'overview';
  const { data: patient, isPending, error, refetch } = usePatient(id);

  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ms-2">
        <Link to="/patients">
          <ArrowLeft className="rtl:rotate-180" /> {t('backToPatients')}
        </Link>
      </Button>

      <div className="bg-card flex flex-col gap-5 rounded-2xl border p-5 md:flex-row md:items-center md:p-6">
        <PatientAvatar name={patient.fullName} color={patient.avatarColor} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{patient.fullName}</h1>
            <PatientStatusBadge status={patient.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {t('years', { count: patient.age })} · {patient.gender === 'MALE' ? t('male') : t('female')} ·{' '}
            <span className="text-foreground font-medium">{patient.diagnosis.name}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SpecialtyBadge specialty={patient.specialty} />
            {patient.program && (
              <span className="text-muted-foreground text-xs">
                {t('weekOf', { current: patient.program.currentWeek, total: patient.program.durationWeeks })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5">
          {!patient.requiresReview && (
            <ProgressRing value={patient.progress} size={88} stroke={8} />
          )}
          <Button asChild size="lg">
            <Link to={`/patients/${patient.id}/care-plan`}>
              <ClipboardPen /> {patient.requiresReview ? t('startCarePlan') : t('carePlan')}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs dir={i18n.dir()} value={tab} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <TabsList>
            {TABS.map((tabInfo) => (
              <TabsTrigger key={tabInfo.value} value={tabInfo.value}>
                {t(`tabs.${tabInfo.i18nKey}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="overview" className="mt-4">
          <OverviewTab patient={patient} />
        </TabsContent>
        <TabsContent value="assessment" className="mt-4">
          <AssessmentTab patientId={id} />
        </TabsContent>
        <TabsContent value="plan" className="mt-4">
          <PlanTab patientId={id} />
        </TabsContent>
        <TabsContent value="exercises" className="mt-4">
          <ExercisesTab patientId={id} />
        </TabsContent>
        <TabsContent value="sessions" className="mt-4">
          <SessionsTab patientId={id} />
        </TabsContent>
        <TabsContent value="kpis" className="mt-4">
          <KpisTab patientId={id} />
        </TabsContent>
        <TabsContent value="progress" className="mt-4">
          <ProgressTab patientId={id} />
        </TabsContent>
        <TabsContent value="milestones" className="mt-4">
          <MilestonesTab patientId={id} />
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <TimelineTab patientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
