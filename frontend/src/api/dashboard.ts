import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';

export const fetchDashboardOverview = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/overview');
  return data;
};

export const fetchRecentActivity = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/recent-activity');
  return data;
};

export const fetchAlerts = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/alerts');
  return data;
};

export const fetchVehicleStatusChart = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/charts/vehicle-status');
  return data;
};

export const fetchMonthlyFuelCost = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/charts/monthly-fuel-cost');
  return data;
};

export const fetchMonthlyTrips = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/charts/monthly-trips');
  return data;
};

export const fetchFleetUtilization = async (): Promise<ApiResponse<any>> => {
  // In a real app we might have a specific endpoint for utilization,
  // but for now we'll just mock it or use an existing one if available.
  const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/overview');
  return data;
};
