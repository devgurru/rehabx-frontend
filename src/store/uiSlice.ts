import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PatientStatus } from '@/lib/types';

export interface PatientFilters {
  search: string;
  specialtyId: string | 'all';
  status: PatientStatus | 'all';
}

interface UiState {
  patientFilters: PatientFilters;
}

const initialState: UiState = {
  patientFilters: { search: '', specialtyId: 'all', status: 'all' },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    patientFiltersChanged(state, action: PayloadAction<Partial<PatientFilters>>) {
      state.patientFilters = { ...state.patientFilters, ...action.payload };
    },
    patientFiltersReset(state) {
      state.patientFilters = initialState.patientFilters;
    },
  },
});

export const { patientFiltersChanged, patientFiltersReset } = uiSlice.actions;
export default uiSlice.reducer;
