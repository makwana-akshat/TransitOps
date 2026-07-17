import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Stepper } from '@/components/ui/Stepper';
import { useForm } from 'react-hook-form';
import {
  Route, X, MapPin, Package, Truck, User, Weight,
  Play, CheckCircle2, XCircle, Plus
} from 'lucide-react';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useTrips, useCreateTrip, useDispatchTrip, useCompleteTrip, useCancelTrip } from '@/hooks/useTrips';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import type { Trip } from '@/types';

export default function TripsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  
  const { register, handleSubmit, reset } = useForm();
  const { register: registerComplete, handleSubmit: handleSubmitComplete, reset: resetComplete } = useForm();

  const { data: response, isLoading } = useTrips({
    search: search || undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
  });

  const { data: vehiclesRes } = useVehicles({ status: 'AVAILABLE' });
  const { data: driversRes } = useDrivers({ status: 'AVAILABLE' });
  const availableVehicles = vehiclesRes?.data?.items || [];
  const availableDrivers = driversRes?.data?.items || [];

  const createTripMutation = useCreateTrip();
  const dispatchTripMutation = useDispatchTrip();
  const completeTripMutation = useCompleteTrip();
  const cancelTripMutation = useCancelTrip();

  const filteredData = response?.data?.items || [];
  const totalTrips = response?.data?.total || 0;

  const columns: ColumnDef<Trip, any>[] = [
    {
      accessorKey: 'tripNumber',
      header: 'Trip #',
      cell: ({ row }) => (
        <span 
          data-tour={row.original.status === 'Draft' ? 'trips-table-row-draft' : undefined} 
          className="font-mono text-sm font-medium text-primary block"
        >
          {row.original.tripNumber}
        </span>
      ),
    },
    {
      id: 'route',
      header: 'Route',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="w-px h-3 bg-border" />
            <div className="h-2 w-2 rounded-full bg-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{row.original.origin}</p>
            <p className="text-xs text-text-muted">{row.original.destination}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'vehicleName',
      header: 'Vehicle',
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ getValue }) => <span>{formatNumber(getValue())} km</span>,
    },
    {
      accessorKey: 'departureDate',
      header: 'Departure',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
  ];

  // Route progress percentage
  const getProgress = (trip: Trip) => {
    if (trip.status === 'Completed') return 100;
    if (trip.status === 'Cancelled' || trip.status === 'Draft') return 0;
    // Dispatched — simulate partial progress
    return 65;
  };

  const onSubmit = (data: any) => {
    try {
      const payload = {
        ...data,
        source: data.source,
        cargo_description: data.cargo_description,
        cargo_weight: parseFloat(data.cargo_weight),
        planned_distance: parseFloat(data.planned_distance),
        planned_start: new Date(data.planned_start).toISOString(),
        planned_end: new Date(data.planned_end).toISOString(),
      };
      
      createTripMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset({});
        },
        onError: (err: any) => {
          const message = err.response?.data?.detail || err.message || "An error occurred";
          alert(`Failed to create trip: ${message}`);
        }
      });
    } catch (error) {
      console.error("Form parsing error:", error);
      alert("Please ensure all fields (including time for dates) are filled out correctly.");
    }
  };

  const onSubmitComplete = (data: any) => {
    if (!selectedTrip) return;
    completeTripMutation.mutate({
      id: selectedTrip.id,
      payload: {
        actual_distance: parseFloat(data.actual_distance),
        final_odometer: parseFloat(data.final_odometer),
        fuel_consumed: parseFloat(data.fuel_consumed),
        trip_revenue: parseFloat(data.trip_revenue)
      }
    }, {
      onSuccess: () => {
        setIsCompleteModalOpen(false);
        resetComplete({});
        setSelectedTrip(null);
      }
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Trip Management"
        subtitle={`${totalTrips} total trips`}
        icon={Route}
        action={
          <PrimaryButton onClick={() => setIsModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
            Create Trip
          </PrimaryButton>
        }
      />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <SearchInput value={search} onChange={setSearch} placeholder="Search trips..." className="w-full sm:w-72" />
            <FilterBar
              filters={[{
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Status', value: 'All' },
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Dispatched', value: 'Dispatched' },
                  { label: 'Completed', value: 'Completed' },
                  { label: 'Cancelled', value: 'Cancelled' },
                ],
              }]}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <DataTable
              data={filteredData}
              columns={columns}
              searchQuery=""
              onRowClick={(trip) => setSelectedTrip(trip)}
            />
          )}
        </div>

        {/* Trip Detail Panel */}
        {selectedTrip && (
          <div className="w-full xl:w-96 bg-bg-card border border-border-glass shadow-glass rounded-xl p-5 h-fit animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Trip Details</h3>
              <button onClick={() => setSelectedTrip(null)} className="p-1 rounded-lg hover:bg-accent text-text-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Trip number and status */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-primary">{selectedTrip.tripNumber}</span>
                <StatusBadge status={selectedTrip.status} />
              </div>

              {/* Route Progress */}
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Route Progress</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-text-primary">{selectedTrip.origin}</span>
                  </div>
                  <div className="ml-[7px] w-px h-4 bg-border" />
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-500"
                      style={{ width: `${getProgress(selectedTrip)}%` }}
                    />
                  </div>
                  <div className="ml-[7px] w-px h-4 bg-border" />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-sm text-text-primary">{selectedTrip.destination}</span>
                  </div>
                </div>
              </div>

              {/* Cargo Information */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Cargo Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Type</p>
                      <p className="text-sm font-medium">{selectedTrip.cargoType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight className="h-3.5 w-3.5 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Weight</p>
                      <p className="text-sm font-medium">{selectedTrip.cargoWeight > 0 ? `${formatNumber(selectedTrip.cargoWeight)} kg` : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Vehicle</p>
                      <p className="text-sm font-medium">{selectedTrip.vehicleName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Driver</p>
                      <p className="text-sm font-medium">{selectedTrip.driverName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTrip.notes && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">Notes</p>
                  <p className="text-sm text-text-primary bg-muted/30 p-2.5 rounded-lg">{selectedTrip.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {selectedTrip.status === 'Draft' && (
                  <div data-tour="trip-detail-dispatch-btn" className="flex-1 flex">
                    <PrimaryButton 
                      size="sm" 
                      className="w-full" 
                      icon={<Play className="h-3.5 w-3.5" />}
                      onClick={() => dispatchTripMutation.mutate(selectedTrip.id)}
                      disabled={dispatchTripMutation.isPending}
                    >
                      {dispatchTripMutation.isPending ? 'Dispatching...' : 'Dispatch'}
                    </PrimaryButton>
                  </div>
                )}
                {selectedTrip.status === 'Dispatched' && (
                  <div data-tour="trip-detail-complete-btn" className="flex-1 flex">
                    <PrimaryButton 
                      size="sm" 
                      className="w-full" 
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      onClick={() => setIsCompleteModalOpen(true)}
                    >
                      Complete Trip
                    </PrimaryButton>
                  </div>
                )}
                {(selectedTrip.status === 'Draft' || selectedTrip.status === 'Dispatched') && (
                  <div className="flex-1 flex">
                    <SecondaryButton 
                      size="sm" 
                      className="w-full text-red-600 hover:bg-red-50 border-red-200" 
                      icon={<XCircle className="h-3.5 w-3.5" />}
                      onClick={() => {
                        if (window.confirm("Are you sure you want to cancel this trip?")) {
                          cancelTripMutation.mutate(selectedTrip.id);
                        }
                      }}
                      disabled={cancelTripMutation.isPending}
                    >
                      Cancel
                    </SecondaryButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Trip Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title="Create New Trip"
        subtitle="Draft a new route and assign resources"
        size="lg"
        footer={null}
      >
        <div className="w-full">
          {createTripMutation.isError && (
            <div className="w-full mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {/* @ts-ignore */}
              {createTripMutation.error?.response?.data?.detail || createTripMutation.error?.message || "An error occurred while saving the trip."}
            </div>
          )}
          <Stepper
            onComplete={handleSubmit(onSubmit)}
            steps={[
              {
                title: "Routing",
                content: (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Source / Origin</label>
                      <input {...register('source', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., Warehouse A, New York" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Destination</label>
                      <input {...register('destination', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., Distribution Center, Boston" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Planned Start</label>
                        <input type="datetime-local" {...register('planned_start', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary [color-scheme:dark]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Planned End</label>
                        <input type="datetime-local" {...register('planned_end', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                title: "Resources",
                content: (
                  <div className="grid grid-cols-1 gap-4">
                    <div data-tour="trip-form-vehicle-select">
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Assign Vehicle</label>
                      <select {...register('vehicle_id', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary">
                        <option value="">Select available vehicle</option>
                        {availableVehicles.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.registration_number} - {v.vehicle_name} ({v.capacity_kg}kg)</option>
                        ))}
                      </select>
                    </div>
                    <div data-tour="trip-form-driver-select" className="mt-2">
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Assign Driver</label>
                      <select {...register('driver_id', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary">
                        <option value="">Select compliant driver</option>
                        {availableDrivers.map((d: any) => (
                          <option key={d.id} value={d.id}>{d.full_name} ({d.license_category})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )
              },
              {
                title: "Cargo",
                content: (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Cargo Description</label>
                      <input {...register('cargo_description', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="Cargo Type (e.g., Electronics)" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Weight (kg)</label>
                        <input type="number" step="0.1" {...register('cargo_weight', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., 500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Est. Distance (km)</label>
                        <input type="number" step="0.1" {...register('planned_distance', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., 150" />
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </div>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => { setIsCompleteModalOpen(false); resetComplete({}); }}
        title="Complete Trip"
        subtitle="Log the final metrics for this trip"
        size="md"
        footer={
          <>
            <SecondaryButton onClick={() => { setIsCompleteModalOpen(false); resetComplete({}); }} disabled={completeTripMutation.isPending}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSubmitComplete(onSubmitComplete)} disabled={completeTripMutation.isPending}>
              {completeTripMutation.isPending ? 'Saving...' : 'Complete Trip'}
            </PrimaryButton>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Actual Distance (km)</label>
            <input type="number" step="0.1" {...registerComplete('actual_distance', { required: true })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 150.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Final Odometer (km)</label>
            <input type="number" step="0.1" {...registerComplete('final_odometer', { required: true })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 45000" />
            <p className="text-xs text-text-muted mt-1">Must be strictly greater than the vehicle's current odometer.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Fuel Consumed (Liters)</label>
            <input type="number" step="0.1" {...registerComplete('fuel_consumed', { required: true })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 45" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Trip Revenue ($)</label>
            <input type="number" step="0.01" {...registerComplete('trip_revenue')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 1500.00" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
