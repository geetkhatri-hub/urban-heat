import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/widgets/PageLoader';

// Lazy load all pages for optimal performance
const PortalSelection = lazy(() => import('./pages/PortalSelection'));
const CommissionerDashboard = lazy(() => import('./pages/CommissionerDashboard'));
const EmergencyDashboard = lazy(() => import('./pages/EmergencyDashboard'));
const CitizenPortal = lazy(() => import('./pages/CitizenPortal'));

const ROUTES = {
  HOME: '/',
  COMMISSIONER: '/commissioner',
  EMERGENCY: '/emergency',
  CITIZEN: '/citizen',
};

function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<PortalSelection />} />
            <Route
              path={ROUTES.COMMISSIONER}
              element={
                <ProtectedRoute allowedRoles={['commissioner']}>
                  <CommissionerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EMERGENCY}
              element={
                <ProtectedRoute allowedRoles={['emergency']}>
                  <EmergencyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CITIZEN}
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenPortal />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
