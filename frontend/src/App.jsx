import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import DriverLayout from './layouts/DriverLayout';
import FleetManagerLayout from './layouts/FleetManagerLayout';
import AnalystLayout from './layouts/AnalystLayout';
import SafetyOfficerLayout from './layouts/SafetyOfficerLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import Drivers from './pages/Drivers';
import DriverDetails from './pages/DriverDetails';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Maintenance from './pages/Maintenance';
import Fuel from './pages/Fuel';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="vehicles/:id" element={<VehicleDetails />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="drivers/:id" element={<DriverDetails />} />
              <Route path="trips" element={<Trips />} />
              <Route path="trips/:id" element={<TripDetails />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="fuel" element={<Fuel />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="users" element={<Users />} />
            </Route>

            {/* Fleet Manager Routes */}
            <Route path="/fleet-manager" element={<FleetManagerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="trips" element={<Trips />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="fuel" element={<Fuel />} />
            </Route>

            {/* Driver Routes */}
            <Route path="/driver" element={<DriverLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="trips" element={<Trips />} />
              <Route path="vehicles" element={<Vehicles />} />
            </Route>

            {/* Analyst Routes */}
            <Route path="/analyst" element={<AnalystLayout />}>
              <Route index element={<Analytics />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Safety Officer Routes */}
            <Route path="/safety" element={<SafetyOfficerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="drivers" element={<Drivers />} />
            </Route>

            {/* Default Route & Fallbacks */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
