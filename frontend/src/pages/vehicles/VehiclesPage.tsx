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
import vehiclesData from '@/data/vehicles.json';
import type { Vehicle } from '@/types';

const allVehicles = vehiclesData as Vehicle[];

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm();

  const filteredData = useMemo(() => {
    return allVehicles.filter((v) => {
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesRegion = regionFilter === 'All' || v.region === regionFilter;
      return matchesStatus && matchesRegion;
    });
  }, [statusFilter, regionFilter]);

  const columns: ColumnDef<Vehicle, any>[] = [
    {
      accessorKey: 'registrationNo',
      header: 'Registration No',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium text-text-primary">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.name}</p>
          <p className="text-xs text-text-muted">{row.original.year} · {row.original.fuelType}</p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ getValue }) => <span>{getValue()} seats</span>,
    },
    {
      accessorKey: 'odometer',
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
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-accent transition-colors">
                <Eye className="h-3.5 w-3.5" /> View Details
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-accent transition-colors">
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const onSubmit = (data: any) => {
    console.log('Register Vehicle:', data);
    setIsModalOpen(false);
    reset();
  };

  const regions = [...new Set(allVehicles.map(v => v.region))];

  return (
    <div className="animate-fade-in" onClick={() => setActionMenuId(null)}>
      <PageHeader
        title="Vehicle Registry"
        subtitle={`${allVehicles.length} vehicles in your fleet`}
        icon={Bus}
        action={
          <PrimaryButton onClick={() => setIsModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
            Register Vehicle
          </PrimaryButton>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
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

      <DataTable data={filteredData} columns={columns} searchQuery={search} />

      {/* Register Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title="Register Vehicle"
        subtitle="Add a new vehicle to your fleet"
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={() => { setIsModalOpen(false); reset(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSubmit(onSubmit)}>Register Vehicle</PrimaryButton>
          </>
        }
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Vehicle Name</label>
            <input {...register('name')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., Transit Express 200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Registration Number</label>
            <input {...register('registrationNo')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., TX-0000-XX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Vehicle Type</label>
            <select {...register('type')} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
            <label className="block text-sm font-medium text-text-primary mb-1.5">Capacity</label>
            <input {...register('capacity')} type="number" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 48" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Acquisition Cost</label>
            <input {...register('acquisitionCost')} type="number" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 285000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Odometer (km)</label>
            <input {...register('odometer')} type="number" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 0" />
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
              <option value="Available">Available</option>
              <option value="In Shop">In Shop</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
