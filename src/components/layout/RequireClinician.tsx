import { Navigate, Outlet, useLocation } from 'react-router';
import { useAppSelector } from '@/store/hooks';

/** Route guard — the web portal is for clinicians; caregivers use the mobile app. */
export function RequireClinician() {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();
  if (!user || user.role !== 'CLINICIAN') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
