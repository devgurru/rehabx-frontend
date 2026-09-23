import { ClipboardPlus } from 'lucide-react';
import { Link } from 'react-router';
import { useAssessment } from '@/api/queries';
import { EmptyState, ErrorState, CardSkeleton } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { AssessmentView } from './AssessmentView';

export function AssessmentTab({ patientId }: { patientId: string }) {
  const { data, isPending, error, refetch } = useAssessment(patientId);
  if (isPending) return <CardSkeleton className="h-96" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.latest)
    return (
      <EmptyState
        icon={ClipboardPlus}
        title="No assessment yet"
        description="Start with a structured functional assessment."
        action={
          <Button asChild size="sm">
            <Link to={`/patients/${patientId}/care-plan`}>Start assessment</Link>
          </Button>
        }
      />
    );
  return <AssessmentView assessment={data.latest} baseline={data.baseline} />;
}
