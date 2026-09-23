import { createBrowserRouter } from 'react-router';
import { RequireClinician } from '@/components/layout/RequireClinician';
import { AppShell } from '@/components/layout/AppShell';
import CarePlanPage from '@/pages/care-plan/CarePlanPage';
import DashboardPage from '@/pages/DashboardPage';
import KpisPage from '@/pages/KpisPage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PatientDetailPage from '@/pages/patient/PatientDetailPage';
import PatientsPage from '@/pages/PatientsPage';
import ProgramsPage from '@/pages/ProgramsPage';
import ReferralsPage from '@/pages/ReferralsPage';
import ReportsPage from '@/pages/ReportsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireClinician />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'patients', element: <PatientsPage /> },
          { path: 'patients/:id', element: <PatientDetailPage /> },
          { path: 'patients/:id/care-plan', element: <CarePlanPage /> },
          { path: 'programs', element: <ProgramsPage /> },
          { path: 'referrals', element: <ReferralsPage /> },
          { path: 'kpis', element: <KpisPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
