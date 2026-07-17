import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { Bus, Plus, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatNumber, formatOdometer, formatCurrency } from '@/utils/formatters';
import { useVehicles, useCreateVehicle, useDeleteVehicle, useUpdateVehicle } from '@/hooks/useVehicles';
import type { Vehicle } from '@/types';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm();

  // Fetch live data from FastAPI
  const { data: response, isLoading } = useVehicles({
    search: search || undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    region: regionFilter !== 'All' ? regionFilter : undefined,
  });

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const filteredData = response?.data?.items || [];
  const totalVehicles = response?.data?.total || 0;

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicleMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Vehicle, any>[] = [
    {
      accessorKey: 'registration_number',
      header: 'Registration No',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium text-text-primary">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'vehicle_name',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.vehicle_name}</p>
          <p className="text-xs text-text-muted">{row.original.year || 'N/A'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'vehicle_type',
      header: 'Type',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <div data-tour="vehicles-status-badge" className="inline-block"><StatusBadge status={getValue()} /></div>,
    },
    {
      accessorKey: 'capacity_kg',
      header: 'Capacity (kg)',
      cell: ({ getValue }) => <span>{getValue()} kg</span>,
    },
    {
      accessorKey: 'current_odometer',
      header: 'Odometer',
      cell: ({ getValue }) => <span className="font-mono text-sm">{formatOdometer(getValue())}</span>,
    },
    {
      accessorKey: 'region',
      header: 'Region',
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActionMenuId(actionMenuId === row.original.id ? null : row.original.id);
            }}
            className="p-1.5 rounded-lg hover:bg-accent text-text-muted transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {actionMenuId === row.original.id && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-bg-card border border-border-glass shadow-glass rounded-lg shadow-lg py-1 animate-scale-in">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVehicle(row.original);
                  setModalMode('view');
                  setIsModalOpen(true);
                  setActionMenuId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-accent transition-colors"
              >
                <Eye className="h-3.5 w-3.5" /> View Details
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVehicle(row.original);
                  setModalMode('edit');
                  reset(row.original);
                  setIsModalOpen(true);
                  setActionMenuId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-accent transition-colors"
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(row.original.id); setActionMenuId(null); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (isNaN(payload.capacity_kg)) payload.capacity_kg = null;
    if (isNaN(payload.acquisition_cost)) payload.acquisition_cost = null;
    if (isNaN(payload.current_odometer)) payload.current_odometer = 0;
    if (isNaN(payload.year)) payload.year = null;

    if (modalMode === 'create') {
      createVehicleMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset({});
        }
      });
    } else if (modalMode === 'edit' && selectedVehicle) {
      updateVehicleMutation.mutate({ id: selectedVehicle.id, data: payload }, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset({});
        }
      });
    }
  };

  const regions = ['North', 'South', 'East', 'West'];

  return (
    <div className="animate-fade-in" onClick={() => setActionMenuId(null)}>
      <PageHeader
        title="Vehicle Registry"
        subtitle={`${totalVehicles} vehicles in your fleet`}
        icon={Bus}
        action={
          <PrimaryButton onClick={() => { setModalMode('create'); setSelectedVehicle(null); reset({}); setIsModalOpen(true); }} icon={<Plus className="h-4 w-4" />} data-tour="vehicles-register-button">
            Register Vehicle
          </PrimaryButton>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6" data-tour="vehicles-search-filter">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search vehicles..."
          className="w-full sm:w-72"
        />
        <FilterBar
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All Status', value: 'All' },
                { label: 'Available', value: 'Available' },
                { label: 'On Trip', value: 'On Trip' },
                { label: 'In Shop', value: 'In Shop' },
                { label: 'Retired', value: 'Retired' },
              ],
            },
            {
              label: 'Region',
              value: regionFilter,
              onChange: setRegionFilter,
              options: [
                { label: 'All Regions', value: 'All' },
                ...regions.map(r => ({ label: r, value: r })),
              ],
            },
          ]}
        />
      </div>

      <div data-tour="vehicles-table">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <DataTable data={filteredData} columns={columns} searchQuery="" />
        )}
      </div>

      {/* Register Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset({}); }}
        title={modalMode === 'create' ? "Register Vehicle" : modalMode === 'edit' ? "Edit Vehicle" : "Vehicle Details"}
        subtitle={modalMode === 'create' ? "Add a new vehicle to your fleet" : modalMode === 'edit' ? "Update vehicle information" : "View comprehensive vehicle records"}
        size="lg"
        footer={
          modalMode === 'view' ? (
            <PrimaryButton onClick={() => { setIsModalOpen(false); reset({}); }}>Close</PrimaryButton>
          ) : (
            <>
              <SecondaryButton onClick={() => { setIsModalOpen(false); reset({}); }} disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSubmit(onSubmit)} disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}>
                {modalMode === 'create' 
                  ? (createVehicleMutation.isPending ? 'Registering...' : 'Register Vehicle') 
                  : (updateVehicleMutation.isPending ? 'Saving...' : 'Save Changes')}
              </PrimaryButton>
            </>
          )
        }
      >
        {modalMode === 'view' && selectedVehicle ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
             <div className="bg-bg-card rounded-lg border border-border p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-text-primary mb-3">General Information</h3>
                <div className="space-y-2">
                   <p className="text-sm"><span className="text-text-muted">Registration:</span> {selectedVehicle.registration_number}</p>
                   <p className="text-sm"><span className="text-text-muted">Name:</span> {selectedVehicle.vehicle_name}</p>
                   <p className="text-sm"><span className="text-text-muted">Type:</span> {selectedVehicle.vehicle_type || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">Region:</span> {selectedVehicle.region || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">Status:</span> <div className="inline-block ml-2"><StatusBadge status={selectedVehicle.status} /></div></p>
                </div>
             </div>
             <div className="bg-bg-card rounded-lg border border-border p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Specifications</h3>
                <div className="space-y-2">
                   <p className="text-sm"><span className="text-text-muted">Manufacturer:</span> {selectedVehicle.manufacturer || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">Model:</span> {selectedVehicle.model || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">Year:</span> {selectedVehicle.year || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">Capacity:</span> {formatNumber(selectedVehicle.capacity_kg)} kg</p>
                   <p className="text-sm"><span className="text-text-muted">Current Odometer:</span> {formatOdometer(selectedVehicle.current_odometer)}</p>
                </div>
             </div>
             <div className="bg-bg-card rounded-lg border border-border p-4 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Financials & Costs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div>
                     <p className="text-xs text-text-muted mb-1">Acquisition Cost</p>
                     <p className="text-sm font-semibold text-text-primary">{formatCurrency(selectedVehicle.acquisition_cost)}</p>
                   </div>
                   <div>
                     <p className="text-xs text-text-muted mb-1">Lifetime Fuel</p>
                     <p className="text-sm font-semibold text-red-600">{formatCurrency(selectedVehicle.total_fuel_cost)}</p>
                   </div>
                   <div>
                     <p className="text-xs text-text-muted mb-1">Lifetime Maintenance</p>
                     <p className="text-sm font-semibold text-orange-600">{formatCurrency(selectedVehicle.total_maintenance_cost)}</p>
                   </div>
                   <div>
                     <p className="text-xs text-text-muted mb-1">Total Operational</p>
                     <p className="text-sm font-semibold text-primary">{formatCurrency(selectedVehicle.total_operational_cost)}</p>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Vehicle Name</label>
            <input {...register('vehicle_name')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., Transit Express 200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Registration Number</label>
            <input {...register('registration_number')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., TX-0000-XX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Vehicle Type</label>
            <select {...register('vehicle_type')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Select type</option>
              <option value="Bus">Bus</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Mini Bus">Mini Bus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Year</label>
            <input {...register('year', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 2024" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Manufacturer</label>
            <input {...register('manufacturer')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., Ford" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Model</label>
            <input {...register('model')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., Transit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Capacity (kg)</label>
            <input {...register('capacity_kg', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 4800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Acquisition Cost</label>
            <input {...register('acquisition_cost', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 285000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Odometer (km)</label>
            <input {...register('current_odometer', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Region</label>
            <select {...register('region')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Select region</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
            <select {...register('status')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="AVAILABLE">Available</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
