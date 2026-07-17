import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MaintenanceFormModal } from '@/components/forms/MaintenanceFormModal';
import { Wrench, ClipboardList, AlertTriangle, Calendar, Plus } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { fetchMaintenanceRecords, fetchUpcomingMaintenance } from '@/api/maintenance';

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['maintenance', { search }],
    queryFn: () => fetchMaintenanceRecords({ search: search || undefined, page_size: 50 }),
  });
  
  const { data: upcomingData } = useQuery({
    queryKey: ['upcoming-maintenance'],
    queryFn: fetchUpcomingMaintenance,
  });

  const allRecords = recordsData?.data?.items || [];
  const upcomingRecords = upcomingData?.data || [];

  const activeRecords = allRecords.filter((m: any) => m.status === 'IN_PROGRESS' || m.status === 'OPEN').length;
  const vehiclesInShop = allRecords.filter((m: any) => m.status === 'IN_PROGRESS').length;
  
  // Calculate cost of completed maintenance
  const totalCost = allRecords.filter((m: any) => m.actual_cost).reduce((sum: number, m: any) => sum + (m.actual_cost || 0), 0);
  
  // Count overdue (scheduled in past but not completed)
  const now = new Date();
  const overdueServices = allRecords.filter((m: any) => 
    m.status !== 'COMPLETED' && m.status !== 'CANCELLED' && m.expected_completion && new Date(m.expected_completion) < now
  ).length;

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'vehicleName',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">
            {row.original.vehicle ? row.original.vehicle.vehicle_name : 'Unknown'}
          </p>
          <p className="text-xs text-text-muted font-mono">
            {row.original.vehicle ? row.original.vehicle.registration_number : '—'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'maintenance_type',
      header: 'Service Type',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Wrench className="h-3.5 w-3.5 text-text-muted" />
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        // Map IN_PROGRESS to 'In Progress', OPEN to 'Scheduled', COMPLETED to 'Completed', CANCELLED to 'Cancelled'
        let display = 'Unknown';
        let variant: any = 'neutral';
        if (status === 'IN_PROGRESS') { display = 'In Progress'; variant = 'warning'; }
        if (status === 'OPEN') { display = 'Scheduled'; variant = 'info'; }
        if (status === 'COMPLETED') { display = 'Completed'; variant = 'success'; }
        if (status === 'CANCELLED') { display = 'Cancelled'; variant = 'error'; }
        
        return <StatusBadge status={display} variant={variant} />;
      },
    },
    {
      accessorKey: 'start_date',
      header: 'Date',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{formatDate(row.original.start_date)}</p>
          {row.original.completed_date && (
            <p className="text-xs text-text-muted">Done: {formatDate(row.original.completed_date)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'estimated_cost',
      header: 'Est. Cost',
      cell: ({ row }) => {
        const cost = row.original.actual_cost || row.original.estimated_cost;
        return <span className="font-medium">{cost ? formatCurrency(cost) : '—'}</span>;
      }
    },
    {
      accessorKey: 'workshop_name',
      header: 'Workshop',
      cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span>
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Maintenance"
          subtitle="Track and manage vehicle maintenance schedules"
          icon={Wrench}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-bg rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Log Maintenance
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Records" value={activeRecords} icon={ClipboardList} />
        <StatCard label="Vehicles In Shop" value={vehiclesInShop} icon={Wrench} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard label="Total Spent" value={formatCurrency(totalCost)} icon={Wrench} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="Overdue Services" value={overdueServices} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Table */}
        <div className="xl:col-span-3">
          <div className="mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search maintenance records..." className="w-full sm:w-72" />
          </div>
          <DataTable data={allRecords} columns={columns} searchQuery={search} isLoading={isLoading} />
        </div>

        {/* Upcoming Maintenance Panel */}
        <div className="bg-bg-card border border-border-glass shadow-glass rounded-xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Upcoming</h3>
          </div>
          <div className="space-y-3">
            {upcomingRecords.map((record: any) => (
              <div key={record.id} className="p-3 bg-muted/30 rounded-lg border border-border-glass">
                <p className="text-sm font-medium text-text-primary">
                  {record.vehicle ? record.vehicle.vehicle_name : 'Unknown Vehicle'}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{record.maintenance_type}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-primary font-medium">{formatDate(record.start_date)}</span>
                  <span className="text-xs font-semibold text-text-primary">
                    {record.estimated_cost ? formatCurrency(record.estimated_cost) : ''}
                  </span>
                </div>
              </div>
            ))}
            {upcomingRecords.length === 0 && (
              <p className="text-sm text-text-muted">No upcoming maintenance.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <MaintenanceFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
