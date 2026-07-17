import { useQuery } from '@tanstack/react-query';
import { fetchDashboardOverview, fetchRecentActivity, fetchAlerts, fetchVehicleStatusChart, fetchMonthlyFuelCost, fetchMonthlyTrips } from '@/api/dashboard';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: fetchDashboardOverview,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: fetchRecentActivity,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: fetchAlerts,
  });
}

export function useVehicleStatusChart() {
  return useQuery({
    queryKey: ['dashboard', 'vehicleStatus'],
    queryFn: fetchVehicleStatusChart,
  });
}

export function useMonthlyFuelCost() {
  return useQuery({
    queryKey: ['dashboard', 'monthlyFuelCost'],
    queryFn: fetchMonthlyFuelCost,
  });
}

export function useMonthlyTrips() {
  return useQuery({
    queryKey: ['dashboard', 'monthlyTrips'],
    queryFn: fetchMonthlyTrips,
  });
}
