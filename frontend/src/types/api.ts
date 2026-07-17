export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: PaginatedData<T>;
}

export interface DashboardOverview {
  activeVehicles: number;
  activeVehiclesChange: number;
  availableVehicles: number;
  availableVehiclesChange: number;
  vehiclesInMaintenance: number;
  vehiclesInMaintenanceChange: number;
  retiredVehicles: number;
  
  activeTrips: number;
  completedTripsToday: number;
  completedTripsTodayChange: number;
  pendingTrips: number;
  
  driversOnDuty: number;
  driversOnDutyChange: number;
  availableDrivers: number;
  suspendedDrivers: number;
  
  fleetUtilization: number;
  fleetUtilizationChange: number;
  
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalOperationalCost: number;
}
