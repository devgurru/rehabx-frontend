import { AlertTriangle, FileText, Lightbulb } from 'lucide-react';
import { SpecialtyBadge } from '@/components/shared/badges';
import { ProgressBar } from '@/components/shared/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import type { Assessment } from '@/lib/types';

/** Read-only structured assessment — used on the patient page and in the clinical review step. */
export function AssessmentView({
  assessment,
  baseline,
}: {
  assessment: Assessment;
  baseline?: Assessment | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Functional assessment</CardTitle>
          <CardDescription>
            {formatDate(assessment.assessedAt)} · {assessment.assessedBy ?? 'Clinician'}
            {assessment.isBaseline && ' · baseline'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {assessment.domains.map((d) => {
            const base =
              baseline && baseline.id !== assessment.id
                ? baseline.domains.find((b) => b.key === d.key)
                : null;
            return (
              <div key={d.key} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{d.label}</span>
                  {base?.score != null && d.score != null && (
                    <span className="text-muted-foreground text-xs">baseline {base.score}%</span>
                  )}
                </div>
                {d.score == null ? (
                  <p className="text-muted-foreground text-sm">Not assessed</p>
                ) : (
                  <ProgressBar value={d.score} />
                )}
                {d.notes && <p className="text-muted-foreground text-xs">{d.notes}</p>}
              </div>
            );
          })}
          <p className="text-muted-foreground text-xs">
            Scores are 0–100 prototype ratings and are not a substitute for standardised clinical
            instruments.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary size-4" aria-hidden /> Clinical summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>{assessment.summary ?? '—'}</p>
            {assessment.currentAbilities && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Current abilities</p>
                <p>{assessment.currentAbilities}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                Recommended specialty
              </p>
              <SpecialtyBadge specialty={assessment.recommendedSpecialty} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning-soft/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-warning size-4" aria-hidden /> Risk & concerns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Risk notes</p>
              <p>{assessment.riskNotes ?? 'None recorded'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium">
                <Lightbulb className="size-3" aria-hidden /> Clinical concerns
              </p>
              <p>{assessment.clinicalConcerns ?? 'None recorded'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
