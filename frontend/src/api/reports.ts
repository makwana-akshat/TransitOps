import { apiClient } from '@/lib/apiClient';

export const fetchFleetUtilization = async () => {
  const res = await apiClient.get('/reports/fleet-utilization');
  return res.data;
};

export const fetchVehicleROI = async () => {
  const res = await apiClient.get('/reports/vehicle-roi');
  return res.data;
};

export const fetchFuelEfficiency = async () => {
  const res = await apiClient.get('/reports/fuel-efficiency');
  return res.data;
};

export const fetchRevenueAnalysis = async () => {
  const res = await apiClient.get('/reports/revenue');
  return res.data;
};

export const exportReport = async (format: string, reportType: string) => {
  const res = await apiClient.get(`/reports/export/${format}?report_type=${reportType}`, {
    responseType: 'blob'
  });
  return res.data;
};
