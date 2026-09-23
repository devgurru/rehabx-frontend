import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AssessmentInput,
  AssessmentOverview,
  Assessment,
  ClinicianDashboard,
  Exercise,
  ExerciseAssignmentInput,
  Goal,
  KpiDefinition,
  LoginResponse,
  MilestonePlan,
  MilestoneStatus,
  MilestoneTemplate,
  PatientDetail,
  PatientKpi,
  PatientSummary,
  PlatformStats,
  Program,
  ProgramInput,
  ProgramListItem,
  ProgressDetail,
  Referral,
  Specialty,
  TimelineEvent,
  TodayExercises,
} from '@/lib/types';

/** Centralised query keys — every patient-scoped key starts with ['patients', id]. */
export const qk = {
  dashboard: ['dashboard'] as const,
  platform: ['platform'] as const,
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  assessment: (id: string) => ['patients', id, 'assessment'] as const,
  referrals: (id: string) => ['patients', id, 'referrals'] as const,
  program: (id: string) => ['patients', id, 'program'] as const,
  exercises: (id: string) => ['patients', id, 'exercises'] as const,
  kpis: (id: string) => ['patients', id, 'kpis'] as const,
  progress: (id: string) => ['patients', id, 'progress'] as const,
  goals: (id: string) => ['patients', id, 'goals'] as const,
  milestones: (id: string) => ['patients', id, 'milestones'] as const,
  timeline: (id: string) => ['patients', id, 'timeline'] as const,
  specialties: ['specialties'] as const,
  milestoneTemplates: (specialtyId: string) => ['specialties', specialtyId, 'milestones'] as const,
  exerciseLibrary: (specialtyId?: string) => ['exercises', specialtyId ?? 'all'] as const,
  kpiDefinitions: ['kpis'] as const,
  allPrograms: ['programs'] as const,
  allReferrals: ['referrals'] as const,
};

/** Live-demo freshness: caregiver completions on mobile show up here without a reload. */
const LIVE = { refetchInterval: 15_000 } as const;

// ---- Auth -----------------------------------------------------------------
export const useLogin = () =>
  useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post<LoginResponse>('/auth/login', body),
  });

// ---- Clinician-wide -------------------------------------------------------
export const useDashboard = () =>
  useQuery({
    queryKey: qk.dashboard,
    queryFn: () => api.get<ClinicianDashboard>('/dashboard/clinician'),
    ...LIVE,
  });

export const usePlatformStats = () =>
  useQuery({ queryKey: qk.platform, queryFn: () => api.get<PlatformStats>('/admin/stats') });

export const usePatients = () =>
  useQuery({
    queryKey: qk.patients,
    queryFn: () => api.get<PatientSummary[]>('/patients'),
    ...LIVE,
  });

export const useAllPrograms = () =>
  useQuery({ queryKey: qk.allPrograms, queryFn: () => api.get<ProgramListItem[]>('/programs') });

export const useAllReferrals = () =>
  useQuery({ queryKey: qk.allReferrals, queryFn: () => api.get<Referral[]>('/referrals') });

// ---- Reference data -------------------------------------------------------
export const useSpecialties = () =>
  useQuery({
    queryKey: qk.specialties,
    queryFn: () => api.get<Specialty[]>('/specialties'),
    staleTime: Infinity,
  });

export const useMilestoneTemplates = (specialtyId: string | undefined) =>
  useQuery({
    queryKey: qk.milestoneTemplates(specialtyId ?? ''),
    queryFn: () => api.get<MilestoneTemplate[]>(`/specialties/${specialtyId}/milestone-templates`),
    enabled: Boolean(specialtyId),
    staleTime: Infinity,
  });

export const useExerciseLibrary = (specialtyId?: string) =>
  useQuery({
    queryKey: qk.exerciseLibrary(specialtyId),
    queryFn: () =>
      api.get<Exercise[]>(`/exercises${specialtyId ? `?specialtyId=${specialtyId}` : ''}`),
    staleTime: Infinity,
  });

export const useKpiDefinitions = () =>
  useQuery({
    queryKey: qk.kpiDefinitions,
    queryFn: () => api.get<KpiDefinition[]>('/kpis'),
    staleTime: Infinity,
  });

// ---- Patient-scoped reads -------------------------------------------------
export const usePatient = (id: string) =>
  useQuery({
    queryKey: qk.patient(id),
    queryFn: () => api.get<PatientDetail>(`/patients/${id}`),
    ...LIVE,
  });

export const useAssessment = (id: string) =>
  useQuery({
    queryKey: qk.assessment(id),
    queryFn: () => api.get<AssessmentOverview>(`/patients/${id}/assessment`),
  });

export const useReferrals = (id: string) =>
  useQuery({
    queryKey: qk.referrals(id),
    queryFn: () => api.get<Referral[]>(`/patients/${id}/referrals`),
  });

export const useProgram = (id: string) =>
  useQuery({
    queryKey: qk.program(id),
    queryFn: () => api.get<Program | null>(`/patients/${id}/program`),
  });

export const useTodayExercises = (id: string) =>
  useQuery({
    queryKey: qk.exercises(id),
    queryFn: () => api.get<TodayExercises>(`/patients/${id}/exercises`),
    ...LIVE,
  });

export const usePatientKpis = (id: string) =>
  useQuery({
    queryKey: qk.kpis(id),
    queryFn: () => api.get<PatientKpi[]>(`/patients/${id}/kpis`),
    ...LIVE,
  });

export const useProgress = (id: string) =>
  useQuery({
    queryKey: qk.progress(id),
    queryFn: () => api.get<ProgressDetail>(`/patients/${id}/progress`),
    ...LIVE,
  });

export const useGoals = (id: string) =>
  useQuery({ queryKey: qk.goals(id), queryFn: () => api.get<Goal[]>(`/patients/${id}/goals`) });

export const useMilestones = (id: string) =>
  useQuery({
    queryKey: qk.milestones(id),
    queryFn: () => api.get<MilestonePlan>(`/patients/${id}/milestones`),
  });

export const useTimeline = (id: string) =>
  useQuery({
    queryKey: qk.timeline(id),
    queryFn: () => api.get<TimelineEvent[]>(`/patients/${id}/timeline`),
    ...LIVE,
  });

// ---- Patient-scoped writes ------------------------------------------------
/** Any clinical write can change progress, lists and the timeline — refresh the patient broadly. */
function usePatientMutation<TBody, TResult>(
  patientId: string,
  mutationFn: (body: TBody) => Promise<TResult>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: qk.patient(patientId) }),
        client.invalidateQueries({ queryKey: qk.patients, exact: true }),
        client.invalidateQueries({ queryKey: qk.dashboard }),
        client.invalidateQueries({ queryKey: qk.allPrograms }),
        client.invalidateQueries({ queryKey: qk.allReferrals }),
      ]);
    },
  });
}

export const useCreateAssessment = (id: string) =>
  usePatientMutation(id, (body: AssessmentInput) =>
    api.post<Assessment>(`/patients/${id}/assessment`, body),
  );

export const useCreateReferral = (id: string) =>
  usePatientMutation(id, (body: { specialtyIds: string[]; reason: string }) =>
    api.post<Referral[]>(`/patients/${id}/referrals`, body),
  );

export const useSaveProgram = (id: string) =>
  usePatientMutation(id, (body: ProgramInput) =>
    api.post<Program>(`/patients/${id}/program`, body),
  );

export const useAssignExercises = (id: string) =>
  usePatientMutation(id, (exercises: ExerciseAssignmentInput[]) =>
    api.put<Program>(`/patients/${id}/program/exercises`, { exercises }),
  );

export const useSaveGoals = (id: string) =>
  usePatientMutation(id, (goals: { title: string; kpiId: string | null }[]) =>
    api.put<Goal[]>(`/patients/${id}/goals`, { goals }),
  );

export const useSaveMilestones = (id: string) =>
  usePatientMutation(
    id,
    (
      milestones: {
        id?: string;
        title: string;
        description?: string | null;
        targetWeek: number;
        status?: MilestoneStatus;
      }[],
    ) => api.put<MilestonePlan>(`/patients/${id}/milestones`, { milestones }),
  );

export const useUpdateMilestoneStatus = (id: string) =>
  usePatientMutation(
    id,
    ({ milestoneId, status }: { milestoneId: string; status: MilestoneStatus }) =>
      api.patch<MilestonePlan>(`/patients/${id}/milestones/${milestoneId}`, { status }),
  );
