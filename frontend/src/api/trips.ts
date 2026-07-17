import { apiClient } from '@/lib/apiClient';
import type { Trip } from '@/types';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

export const fetchTrips = async (params?: Record<string, any>): Promise<PaginatedResponse<Trip>> => {
  const { data } = await apiClient.get<PaginatedResponse<any>>('/trips', { params });
  
  if (data.data?.items) {
    data.data.items = data.data.items.map((trip: any) => ({
      id: trip.id,
      tripNumber: trip.trip_number,
      origin: trip.source,
      destination: trip.destination,
      vehicleId: trip.vehicle_id,
      vehicleName: trip.vehicle ? `${trip.vehicle.registration_number} - ${trip.vehicle.vehicle_name}` : 'Unknown Vehicle',
      driverId: trip.driver_id,
      driverName: trip.driver ? trip.driver.full_name : 'Unknown Driver',
      status: trip.status === 'DRAFT' ? 'Draft' : trip.status === 'DISPATCHED' ? 'Dispatched' : trip.status === 'COMPLETED' ? 'Completed' : 'Cancelled',
      departureDate: trip.actual_start || trip.planned_start,
      arrivalDate: trip.actual_end || trip.planned_end,
      distance: trip.actual_distance || trip.planned_distance,
      cargoType: trip.cargo_description,
      cargoWeight: trip.cargo_weight,
      notes: trip.notes || ''
    }));
  }
  
  return data;
};

export const createTrip = async (tripData: Partial<Trip>): Promise<ApiResponse<Trip>> => {
  const { data } = await apiClient.post<ApiResponse<Trip>>('/trips', tripData);
  return data;
};

export const dispatchTrip = async (id: string): Promise<ApiResponse<Trip>> => {
  const { data } = await apiClient.patch<ApiResponse<Trip>>(`/trips/${id}/dispatch`);
  return data;
};

export const cancelTrip = async (id: string): Promise<ApiResponse<Trip>> => {
  const { data } = await apiClient.patch<ApiResponse<Trip>>(`/trips/${id}/cancel`);
  return data;
};

export const completeTrip = async (id: string, payload: any): Promise<ApiResponse<Trip>> => {
  const { data } = await apiClient.patch<ApiResponse<Trip>>(`/trips/${id}/complete`, payload);
  return data;
};
