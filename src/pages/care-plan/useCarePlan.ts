import { useCallback } from 'react';
import {
  type CarePlanDraft,
  type CarePlanStep,
  draftUpdated,
  selectCarePlanDraft,
  stepChanged,
  stepCompleted,
} from '@/store/carePlanSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Wizard state for one patient, backed by the Redux care-plan slice. */
export function useCarePlan(patientId: string) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectCarePlanDraft(patientId));

  const goTo = useCallback(
    (step: CarePlanStep) => dispatch(stepChanged({ patientId, step })),
    [dispatch, patientId],
  );
  const complete = useCallback(
    (step: CarePlanStep) => dispatch(stepCompleted({ patientId, step })),
    [dispatch, patientId],
  );
  const update = useCallback(
    (patch: Partial<Omit<CarePlanDraft, 'step' | 'completed'>>) =>
      dispatch(draftUpdated({ patientId, patch })),
    [dispatch, patientId],
  );

  return { draft, goTo, complete, update };
}

export interface StepProps {
  patientId: string;
  onComplete: () => void;
}
