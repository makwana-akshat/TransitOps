import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDrivers, fetchComplianceAlerts, createDriver, updateDriver, deleteDriver } from '@/api/drivers';
import type { Driver } from '@/types';

export function useDrivers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => fetchDrivers(params),
  });
}

export function useComplianceAlerts() {
  return useQuery({
    queryKey: ['drivers', 'compliance-alerts'],
    queryFn: fetchComplianceAlerts,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newDriver: Partial<Driver>) => createDriver(newDriver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Driver> }) => updateDriver(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
