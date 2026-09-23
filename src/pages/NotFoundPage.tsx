import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you’re looking for doesn’t exist."
      action={
        <Button asChild size="sm">
          <Link to="/">Back to dashboard</Link>
        </Button>
      }
    />
  );
}
