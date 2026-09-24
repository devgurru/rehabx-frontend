import { ArrowRight, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function StepFooter({
  onPrimary,
  primaryLabel,
  pending,
  disabled,
  secondary,
  hint,
}: {
  onPrimary: () => void;
  primaryLabel: string;
  pending?: boolean;
  disabled?: boolean;
  secondary?: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="bg-card/95 sticky bottom-0 -mx-6 mt-2 flex flex-col-reverse gap-3 border-t px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-xs">{hint}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {secondary}
        <Button onClick={onPrimary} disabled={disabled || pending}>
          {pending && <Loader2 className="animate-spin" />}
          {primaryLabel}
          {!pending && <ArrowRight className="rtl:rotate-180" />}
        </Button>
      </div>
    </div>
  );
}
