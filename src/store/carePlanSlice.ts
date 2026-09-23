import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ExerciseAssignmentInput, MilestoneStatus } from '@/lib/types';

/**
 * Unsaved care-plan wizard input, kept per patient so clinicians can move between
 * steps (or away and back) without losing edits. Saved data lives in TanStack Query.
 */

export const CARE_PLAN_STEPS = [
  'assessment',
  'review',
  'referral',
  'program',
  'exercises',
  'goals',
] as const;
export type CarePlanStep = (typeof CARE_PLAN_STEPS)[number];

export interface GoalDraft {
  title: string;
  kpiId: string | null;
}

export interface MilestoneDraft {
  id?: string;
  title: string;
  description?: string | null;
  targetWeek: number;
  status?: MilestoneStatus;
}

export interface CarePlanDraft {
  step: CarePlanStep;
  completed: CarePlanStep[];
  referral?: { specialtyIds: string[]; reason: string };
  program?: {
    name: string;
    specialtyId: string;
    startDate: string;
    durationWeeks: number;
    sessionsPerWeek: number;
  };
  exercises?: ExerciseAssignmentInput[];
  goals?: GoalDraft[];
  milestones?: MilestoneDraft[];
}

type CarePlanState = Record<string, CarePlanDraft>;

const emptyDraft = (): CarePlanDraft => ({ step: 'assessment', completed: [] });

const carePlanSlice = createSlice({
  name: 'carePlan',
  initialState: {} as CarePlanState,
  reducers: {
    stepChanged(state, action: PayloadAction<{ patientId: string; step: CarePlanStep }>) {
      const draft = (state[action.payload.patientId] ??= emptyDraft());
      draft.step = action.payload.step;
    },
    stepCompleted(state, action: PayloadAction<{ patientId: string; step: CarePlanStep }>) {
      const draft = (state[action.payload.patientId] ??= emptyDraft());
      if (!draft.completed.includes(action.payload.step)) draft.completed.push(action.payload.step);
      const next = CARE_PLAN_STEPS[CARE_PLAN_STEPS.indexOf(action.payload.step) + 1];
      if (next) draft.step = next;
    },
    draftUpdated(
      state,
      action: PayloadAction<{
        patientId: string;
        patch: Partial<Omit<CarePlanDraft, 'step' | 'completed'>>;
      }>,
    ) {
      const draft = (state[action.payload.patientId] ??= emptyDraft());
      Object.assign(draft, action.payload.patch);
    },
    draftCleared(state, action: PayloadAction<{ patientId: string }>) {
      delete state[action.payload.patientId];
    },
  },
});

export const { stepChanged, stepCompleted, draftUpdated, draftCleared } = carePlanSlice.actions;
export const selectCarePlanDraft = (patientId: string) => (state: { carePlan: CarePlanState }) =>
  state.carePlan[patientId] ?? emptyDraft();
export default carePlanSlice.reducer;
