import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lazy load all pages for code splitting
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'));
const VehiclesPage = React.lazy(() => import('@/pages/vehicles/VehiclesPage'));
const DriversPage = React.lazy(() => import('@/pages/drivers/DriversPage'));
const TripsPage = React.lazy(() => import('@/pages/trips/TripsPage'));
const MaintenancePage = React.lazy(() => import('@/pages/maintenance/MaintenancePage'));
const FuelExpensesPage = React.lazy(() => import('@/pages/fuel/FuelExpensesPage'));
const ReportsPage = React.lazy(() => import('@/pages/reports/ReportsPage'));
const SettingsPage = React.lazy(() => import('@/pages/settings/SettingsPage'));
const SignInPage = React.lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = React.lazy(() => import('@/pages/auth/SignUpPage'));

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// A global fallback to show when lazy-loading full pages
function PageFallback() {
  return (
    <div className="w-full h-full min-h-screen p-6 lg:p-8">
      <LoadingSkeleton rows={8} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
                
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/vehicles" element={<VehiclesPage />} />
                  <Route path="/drivers" element={<DriversPage />} />
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/fuel-expenses" element={<FuelExpensesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </ClerkProvider>
    </QueryClientProvider>
  );
}

export default App;
