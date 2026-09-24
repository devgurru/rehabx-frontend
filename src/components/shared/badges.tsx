import { CheckCircle2, CircleDashed, CircleDot, Clock3, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MilestoneStatus, PatientStatus, SpecialtyRef, TodayStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/** Specialty chip — the colored dot carries identity, the label stays in text ink. */
export function SpecialtyBadge({
  specialty,
  className,
}: {
  specialty: SpecialtyRef | null;
  className?: string;
}) {
  const { t } = useTranslation('common');
  if (!specialty) return <span className="text-muted-foreground text-sm">{t('specialty.notAssigned')}</span>;
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
  const { t } = useTranslation('common');
  const { className, icon: Icon } = patientStatusStyle[status];
  return (
    <Badge className={cn('gap-1', className)}>
      <Icon aria-hidden />
      {t(`status.${status}`)}
    </Badge>
  );
}

const milestoneStyle: Record<
  MilestoneStatus,
  { className: string; icon: typeof CheckCircle2 }
> = {
  ACHIEVED: { className: 'bg-success-soft text-success', icon: CheckCircle2 },
  IN_PROGRESS: {
    className: 'bg-brand-soft text-accent-foreground',
    icon: Clock3,
  },
  PENDING: {
    className: 'bg-secondary text-muted-foreground',
    icon: CircleDashed,
  },
};

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const { t } = useTranslation('common');
  const { className, icon: Icon } = milestoneStyle[status];
  return (
    <Badge className={cn('gap-1', className)}>
      <Icon aria-hidden />
      {t(`milestoneStatus.${status}`)}
    </Badge>
  );
}

const exerciseStyle: Record<
  TodayStatus,
  { className: string; icon: typeof CheckCircle2 }
> = {
  COMPLETED: { className: 'bg-success-soft text-success', icon: CheckCircle2 },
  IN_PROGRESS: {
    className: 'bg-brand-soft text-accent-foreground',
    icon: Clock3,
  },
  NOT_STARTED: {
    className: 'bg-secondary text-muted-foreground',
    icon: CircleDashed,
  },
};

export function ExerciseStatusBadge({ status }: { status: TodayStatus }) {
  const { t } = useTranslation('common');
  const { className, icon: Icon } = exerciseStyle[status];
  return (
    <Badge className={cn('gap-1', className)}>
      <Icon aria-hidden />
      {t(`exerciseStatus.${status}`)}
    </Badge>
  );
}
