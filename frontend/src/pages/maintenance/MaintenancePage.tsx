import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Wrench, ClipboardList, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatters';
import maintenanceData from '@/data/maintenance.json';
import type { MaintenanceRecord } from '@/types';

const allRecords = maintenanceData as MaintenanceRecord[];

const activeRecords = allRecords.filter(m => m.status === 'In Progress' || m.status === 'Scheduled').length;
const vehiclesInShop = allRecords.filter(m => m.status === 'In Progress').length;
const monthlyCost = allRecords.filter(m => {
  const d = new Date(m.scheduledDate);
  return d.getMonth() === 6 && d.getFullYear() === 2026;
}).reduce((sum, m) => sum + m.cost, 0);
const overdueServices = allRecords.filter(m => m.status === 'Overdue').length;

const upcomingMaintenance = allRecords
  .filter(m => m.status === 'Scheduled')
  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

export default function MaintenancePage() {
  const [search, setSearch] = useState('');

  const columns: ColumnDef<MaintenanceRecord, any>[] = [
    {
      accessorKey: 'vehicleName',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.vehicleName}</p>
          <p className="text-xs text-text-muted font-mono">{row.original.vehicleRegistration}</p>
        </div>
      ),
    },
    {
      accessorKey: 'serviceType',
      header: 'Service Type',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Wrench className="h-3.5 w-3.5 text-text-muted" />
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Date',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{formatDate(row.original.scheduledDate)}</p>
          {row.original.completedDate && (
            <p className="text-xs text-text-muted">Done: {formatDate(row.original.completedDate)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'technician',
      header: 'Technician',
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Maintenance"
        subtitle="Track and manage vehicle maintenance schedules"
        icon={Wrench}
      />

      {/* KPI Cards */}
      <div id="tour-maintenance-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Records" value={activeRecords} icon={ClipboardList} />
        <StatCard label="Vehicles In Shop" value={vehiclesInShop} icon={Wrench} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard label="Monthly Cost" value={formatCurrency(monthlyCost)} change={-5.2} changeLabel="vs last month" icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="Overdue Services" value={overdueServices} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Table */}
        <div className="xl:col-span-3">
          <div className="mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search maintenance records..." className="w-full sm:w-72" />
          </div>
          <DataTable data={allRecords} columns={columns} searchQuery={search} />
        </div>

        {/* Upcoming Maintenance Panel */}
        <div className="bg-bg-card border border-border-glass shadow-glass rounded-xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Upcoming</h3>
          </div>
          <div className="space-y-3">
            {upcomingMaintenance.map((record) => (
              <div key={record.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm font-medium text-text-primary">{record.vehicleName}</p>
                <p className="text-xs text-text-muted mt-0.5">{record.serviceType}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-primary font-medium">{formatDate(record.scheduledDate)}</span>
                  <span className="text-xs font-semibold text-text-primary">{formatCurrency(record.cost)}</span>
                </div>
              </div>
            ))}
            {upcomingMaintenance.length === 0 && (
              <p className="text-sm text-text-muted">No upcoming maintenance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
