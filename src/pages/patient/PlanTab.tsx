import { ClipboardList, Send, Target } from 'lucide-react';
import { Link } from 'react-router';
import { useGoals, useProgram, useReferrals } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { ProgressBar } from '@/components/shared/progress';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';

export function PlanTab({ patientId }: { patientId: string }) {
  const program = useProgram(patientId);
  const goals = useGoals(patientId);
  const referrals = useReferrals(patientId);

  if (program.isPending) return <CardSkeleton className="h-80" />;
  if (program.error)
    return <ErrorState error={program.error} onRetry={() => void program.refetch()} />;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="text-primary size-4" aria-hidden /> Rehabilitation program
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!program.data ? (
            <EmptyState
              title="No active program"
              description="Create a rehabilitation program after the specialty referral."
              action={
                <Button asChild size="sm">
                  <Link to={`/patients/${patientId}/care-plan`}>Open care plan</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-semibold">{program.data.name}</p>
                <SpecialtyBadge specialty={program.data.specialty} />
              </div>
              <dl className="grid gap-4 sm:grid-cols-4">
                {[
                  ['Start date', formatDate(program.data.startDate)],
                  ['Duration', `${program.data.durationWeeks} weeks`],
                  ['Frequency', `${program.data.sessionsPerWeek} sessions / week`],
                  ['Current week', `Week ${program.data.currentWeek}`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-muted/60 rounded-lg p-3">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="mb-3 text-sm font-semibold">Exercise schedule</p>
                <div className="divide-y rounded-lg border">
                  {program.data.exercises.map((e) => (
                    <div
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                    >
                      <span className="font-medium">{e.name}</span>
                      <span className="text-muted-foreground">
                        {e.reps ? `${e.reps} reps · ` : ''}
                        {e.durationMin} min · {e.frequencyPerWeek}× per week
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary size-4" aria-hidden /> Goals
            </CardTitle>
            <CardDescription>Progress from baseline to KPI target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.data?.length ? (
              goals.data.map((g) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{g.title}</span>
                    {g.status === 'ACHIEVED' && (
                      <Badge className="bg-success-soft text-success">Achieved</Badge>
                    )}
                  </div>
                  <ProgressBar value={g.progress} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No goals set yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="text-primary size-4" aria-hidden /> Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals.data?.length ? (
              referrals.data.map((r) => (
                <div key={r.id} className="space-y-1.5 rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <SpecialtyBadge specialty={r.specialty} />
                    <span className="text-muted-foreground text-xs">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-muted-foreground">{r.reason}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No referrals yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
