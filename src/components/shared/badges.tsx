import { CheckCircle2, CircleDashed, CircleDot, Clock3, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MilestoneStatus, PatientStatus, SpecialtyRef, TodayStatus } from '@/lib/types';
import { statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Specialty chip — the colored dot carries identity, the label stays in text ink. */
export function SpecialtyBadge({
  specialty,
  className,
}: {
  specialty: SpecialtyRef | null;
  className?: string;
}) {
  if (!specialty) return <span className="text-muted-foreground text-sm">Not assigned</span>;
  return (
    <Badge variant="outline" className={cn('bg-card gap-1.5 font-medium', className)}>
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: specialty.color }}
        aria-hidden
      />
      {specialty.name}
    </Badge>
  );
}

const patientStatusStyle: Record<PatientStatus, { className: string; icon: typeof CheckCircle2 }> =
  {
    ACTIVE: { className: 'bg-success-soft text-success', icon: CircleDot },
    UNDER_REVIEW: { className: 'bg-warning-soft text-warning', icon: Eye },
    NEW: { className: 'bg-secondary text-secondary-foreground', icon: CircleDashed },
    COMPLETED: { className: 'bg-brand-soft text-accent-foreground', icon: CheckCircle2 },
  };

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const { className, icon: Icon } = patientStatusStyle[status];
  return (
    <Badge className={cn('gap-1', className)}>
      <Icon aria-hidden />
      {statusLabel[status]}
    </Badge>
  );
}

const milestoneStyle: Record<
  MilestoneStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  ACHIEVED: { label: 'Achieved', className: 'bg-success-soft text-success', icon: CheckCircle2 },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-brand-soft text-accent-foreground',
    icon: Clock3,
  },
  PENDING: {
    label: 'Upcoming',
    className: 'bg-secondary text-muted-foreground',
    icon: CircleDashed,
  },
};

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const { label, className, icon: Icon } = milestoneStyle[status];
  return (
    <Badge className={cn('gap-1', className)}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}

const exerciseStyle: Record<
  TodayStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  COMPLETED: { label: 'Completed', className: 'bg-success-soft text-success', icon: CheckCircle2 },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-brand-soft text-accent-foreground',
    icon: Clock3,
  },
  NOT_STARTED: {
    label: 'Not started',
    className: 'bg-secondary text-muted-foreground',
    icon: CircleDashed,
  },
};

export function ExerciseStatusBadge({ status }: { status: TodayStatus }) {
  const { label, className, icon: Icon } = exerciseStyle[status];
  return (
    <Badge className={cn('gap-1', className)}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}
