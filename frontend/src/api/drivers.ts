import { apiClient } from '@/lib/apiClient';
import type { Driver } from '@/types';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

export const fetchDrivers = async (params?: Record<string, any>): Promise<PaginatedResponse<Driver>> => {
  const { data } = await apiClient.get<PaginatedResponse<Driver>>('/drivers', { params });
  return data;
};

export const fetchComplianceAlerts = async (): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.get<ApiResponse<any>>('/drivers/compliance-alerts');
  return data;
};

export const createDriver = async (driverData: Partial<Driver>): Promise<ApiResponse<Driver>> => {
  const { data } = await apiClient.post<ApiResponse<Driver>>('/drivers', driverData);
  return data;
};

export const updateDriver = async (id: string, driverData: Partial<Driver>): Promise<ApiResponse<Driver>> => {
  const { data } = await apiClient.put<ApiResponse<Driver>>(`/drivers/${id}`, driverData);
  return data;
};

export const deleteDriver = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/drivers/${id}`);
  return data;
};
