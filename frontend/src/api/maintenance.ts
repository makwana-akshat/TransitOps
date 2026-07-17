import { apiClient } from '@/lib/apiClient';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

export const fetchMaintenanceRecords = async (params?: Record<string, any>): Promise<PaginatedResponse<any>> => {
  const { data } = await apiClient.get<PaginatedResponse<any>>('/maintenance', { params });
  return data;
};

export const fetchActiveMaintenance = async (): Promise<ApiResponse<any[]>> => {
  const { data } = await apiClient.get<ApiResponse<any[]>>('/maintenance/active');
  return data;
};

export const fetchUpcomingMaintenance = async (): Promise<ApiResponse<any[]>> => {
  const { data } = await apiClient.get<ApiResponse<any[]>>('/maintenance/upcoming');
  return data;
};

export const createMaintenanceRecord = async (payload: any): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.post<ApiResponse<any>>('/maintenance', payload);
  return data;
};

export const completeMaintenance = async (id: string, payload: any): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.patch<ApiResponse<any>>(`/maintenance/${id}/complete`, payload);
  return data;
};

export const cancelMaintenance = async (id: string): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.patch<ApiResponse<any>>(`/maintenance/${id}/cancel`);
  return data;
};
