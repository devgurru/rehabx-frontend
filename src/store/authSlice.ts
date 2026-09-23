import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SessionUser } from '@/lib/types';

const STORAGE_KEY = 'rehabx.session';

export interface AuthState {
  token: string | null;
  user: SessionUser | null;
}

function loadSession(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    // Storage unavailable (private mode) — start signed out.
  }
  return { token: null, user: null };
}

function persist(state: AuthState) {
  try {
    if (state.token) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-fatal: the session simply won't survive a reload.
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadSession,
  reducers: {
    signedIn(state, action: PayloadAction<{ token: string; user: SessionUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      persist(state);
    },
    signedOut(state) {
      state.token = null;
      state.user = null;
      persist(state);
    },
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export default authSlice.reducer;
