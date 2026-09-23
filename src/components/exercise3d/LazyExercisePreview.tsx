import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ExercisePreview3D = lazy(() => import('./ExercisePreview3D'));

/** Code-split wrapper so three.js only loads when a 3D guide is on screen. */
export function LazyExercisePreview(props: {
  motionKey: string | null;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Suspense fallback={<Skeleton className={props.className ?? 'h-64 rounded-xl'} />}>
      <ExercisePreview3D {...props} />
    </Suspense>
  );
}
