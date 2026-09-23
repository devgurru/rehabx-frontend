import { configureStore } from '@reduxjs/toolkit';
import { configureApi } from '@/lib/api';
import authReducer, { signedOut } from './authSlice';
import carePlanReducer from './carePlanSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    carePlan: carePlanReducer,
    ui: uiReducer,
  },
});

configureApi({
  getToken: () => store.getState().auth.token,
  onUnauthorized: () => store.dispatch(signedOut()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
