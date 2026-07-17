import { apiClient } from '@/lib/apiClient';
import type { Vehicle } from '@/types';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

export const fetchVehicles = async (params?: Record<string, any>): Promise<PaginatedResponse<Vehicle>> => {
  const { data } = await apiClient.get<PaginatedResponse<Vehicle>>('/vehicles', { params });
  return data;
};

export const createVehicle = async (vehicleData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
  const { data } = await apiClient.post<ApiResponse<Vehicle>>('/vehicles', vehicleData);
  return data;
};

export const deleteVehicle = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/vehicles/${id}`);
  return data;
};

export const updateVehicle = async ({ id, data: updateData }: { id: string; data: Partial<Vehicle> }): Promise<ApiResponse<Vehicle>> => {
  const { data } = await apiClient.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, updateData);
  return data;
};

