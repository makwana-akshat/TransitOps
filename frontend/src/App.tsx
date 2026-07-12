import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import VehiclesPage from '@/pages/vehicles/VehiclesPage';
import DriversPage from '@/pages/drivers/DriversPage';
import TripsPage from '@/pages/trips/TripsPage';
import MaintenancePage from '@/pages/maintenance/MaintenancePage';
import FuelExpensesPage from '@/pages/fuel/FuelExpensesPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import SettingsPage from '@/pages/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
    </BrowserRouter>
  );
}

export default App;
