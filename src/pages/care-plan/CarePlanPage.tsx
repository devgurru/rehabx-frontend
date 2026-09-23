import { ArrowLeft, CheckCircle2, Smartphone } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { usePatient } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { ErrorState, PageSkeleton } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CARE_PLAN_STEPS, type CarePlanStep, draftCleared } from '@/store/carePlanSlice';
import { useAppDispatch } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { AssessmentStep } from './AssessmentStep';
import { ExercisesStep } from './ExercisesStep';
import { GoalsStep } from './GoalsStep';
import { ProgramStep } from './ProgramStep';
import { ReferralStep } from './ReferralStep';
import { ReviewStep } from './ReviewStep';
import { useCarePlan } from './useCarePlan';

const STEP_META: Record<CarePlanStep, { title: string; description: string }> = {
  assessment: { title: 'Assessment', description: 'Structured functional assessment' },
  review: { title: 'Clinical review', description: 'Diagnosis, baseline and recommendation' },
  referral: { title: 'Specialty referral', description: 'Refer to the required specialties' },
  program: { title: 'Rehabilitation program', description: 'Duration, frequency and schedule' },
  exercises: { title: 'Exercises', description: 'Assign guided home exercises' },
  goals: { title: 'Goals & milestones', description: 'Define measurable outcomes' },
};

export default function CarePlanPage() {
  const { id = '' } = useParams();
  const patient = usePatient(id);
  const { draft, goTo, complete } = useCarePlan(id);
  const dispatch = useAppDispatch();

  // Each step starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [draft.step]);

  if (patient.isPending) return <PageSkeleton />;
  if (patient.error)
    return <ErrorState error={patient.error} onRetry={() => void patient.refetch()} />;

  const finished = draft.completed.includes('goals');
  const stepIndex = CARE_PLAN_STEPS.indexOf(draft.step);
  const onComplete = () => complete(draft.step);
  const props = { patientId: id, onComplete };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to patient">
            <Link to={`/patients/${id}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <PatientAvatar name={patient.data.fullName} color={patient.data.avatarColor} />
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Care plan · {patient.data.fullName}
            </h1>
            <p className="text-muted-foreground text-sm">
              {patient.data.age} years · {patient.data.diagnosis.name}
            </p>
          </div>
        </div>
        <SpecialtyBadge specialty={patient.data.specialty} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Care plan steps">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {CARE_PLAN_STEPS.map((step, i) => {
              const done = draft.completed.includes(step);
              const current = step === draft.step && !finished;
              return (
                <li key={step} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(step)}
                    aria-current={current ? 'step' : undefined}
                    className={cn(
                      'hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      current && 'bg-card ring-border shadow-sm ring-1',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        done
                          ? 'bg-success text-white'
                          : current
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {done ? <CheckCircle2 className="size-4" aria-label="Completed" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{STEP_META[step].title}</span>
                      <span className="text-muted-foreground hidden truncate text-xs lg:block">
                        {STEP_META[step].description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {finished ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-5 px-6 py-14 text-center">
              <span className="bg-success-soft text-success flex size-16 items-center justify-center rounded-full">
                <CheckCircle2 className="size-8" aria-hidden />
              </span>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Care plan ready</h2>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  {patient.data.firstName}’s program, exercises, goals and milestones are live. The
                  caregiver sees today’s exercises with the 3D guide in the RehabX mobile app.
                </p>
              </div>
              <div className="bg-brand-soft text-accent-foreground flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                <Smartphone className="size-4" aria-hidden /> Shared with{' '}
                {patient.data.caregiver.name} ({patient.data.caregiver.relationship})
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link
                    to={`/patients/${id}?tab=overview`}
                    onClick={() => dispatch(draftCleared({ patientId: id }))}
                  >
                    View patient
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => goTo('assessment')}>
                  Review steps again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="pb-0">
            <CardHeader>
              <p className="text-primary text-xs font-medium">
                Step {stepIndex + 1} of {CARE_PLAN_STEPS.length}
              </p>
              <CardTitle className="text-xl">{STEP_META[draft.step].title}</CardTitle>
              <CardDescription>{STEP_META[draft.step].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {draft.step === 'assessment' && <AssessmentStep {...props} />}
              {draft.step === 'review' && <ReviewStep {...props} />}
              {draft.step === 'referral' && <ReferralStep {...props} />}
              {draft.step === 'program' && <ProgramStep {...props} />}
              {draft.step === 'exercises' && <ExercisesStep {...props} />}
              {draft.step === 'goals' && <GoalsStep {...props} />}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
