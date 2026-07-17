import { useQuery } from '@tanstack/react-query';
import { fetchFleetUtilization, fetchVehicleROI, fetchFuelEfficiency, fetchRevenueAnalysis } from '@/api/reports';

export function useFleetUtilization() {
  return useQuery({
    queryKey: ['reports', 'fleet-utilization'],
    queryFn: fetchFleetUtilization,
  });
}

export function useVehicleROI() {
  return useQuery({
    queryKey: ['reports', 'vehicle-roi'],
    queryFn: fetchVehicleROI,
  });
}

export function useFuelEfficiency() {
  return useQuery({
    queryKey: ['reports', 'fuel-efficiency'],
    queryFn: fetchFuelEfficiency,
  });
}

export function useRevenueAnalysis() {
  return useQuery({
    queryKey: ['reports', 'revenue'],
    queryFn: fetchRevenueAnalysis,
  });
}
