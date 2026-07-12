// ── Vehicle ──
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type VehicleType = 'Bus' | 'Truck' | 'Van' | 'Sedan' | 'SUV' | 'Mini Bus';

export interface Vehicle {
  id: string;
  name: string;
  registrationNo: string;
  type: VehicleType;
  status: VehicleStatus;
  capacity: number;
  odometer: number;
  region: string;
  acquisitionCost: number;
  fuelType: string;
  year: number;
  lastService: string;
  image?: string;
}

// ── Driver ──
export type DriverStatus = 'Available' | 'On Trip' | 'Suspended' | 'Off Duty';
export type LicenseCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'CE';

export interface Driver {
  id: string;
  name: string;
  photo: string;
  licenseNumber: string;
  category: LicenseCategory;
  safetyScore: number;
  licenseExpiry: string;
  phone: string;
  status: DriverStatus;
  email: string;
  joinDate: string;
  totalTrips: number;
}

// ── Trip ──
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  tripNumber: string;
  origin: string;
  destination: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  status: TripStatus;
  departureDate: string;
  arrivalDate: string;
  distance: number;
  cargoType: string;
  cargoWeight: number;
  notes: string;
}

// ── Maintenance ──
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
export type ServiceType = 'Oil Change' | 'Brake Service' | 'Tire Rotation' | 'Engine Repair' | 'Transmission' | 'General Inspection' | 'Battery Replacement' | 'AC Service';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  serviceType: ServiceType;
  cost: number;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  technician: string;
  notes: string;
}

// ── Fuel & Expenses ──
export type ExpenseCategory = 'Fuel' | 'Maintenance' | 'Tolls' | 'Insurance' | 'Other';

export interface FuelRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  station: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  vehicleId?: string;
  vehicleName?: string;
  receipt?: string;
}

export interface MonthlyFuelData {
  month: string;
  cost: number;
  liters: number;
}

// ── Reports ──
export interface FleetUtilizationData {
  month: string;
  utilization: number;
}

export interface CostBreakdown {
  category: string;
  value: number;
  fill: string;
}

export interface ReportData {
  fleetUtilization: FleetUtilizationData[];
  costBreakdown: CostBreakdown[];
  roiData: { month: string; revenue: number; cost: number }[];
  fuelEfficiency: { month: string; kmPerLiter: number }[];
  maintenanceCost: { month: string; cost: number }[];
}

// ── Dashboard ──
export interface DashboardKPI {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  subject: string;
  timestamp: string;
  user: string;
  type: 'vehicle' | 'driver' | 'trip' | 'maintenance';
}
