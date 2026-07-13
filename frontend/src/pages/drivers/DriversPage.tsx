import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users, UserCheck, UserX, ShieldAlert, AlertTriangle,
  MoreHorizontal, Eye, Edit, Phone,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import driversData from '@/data/drivers.json';
import type { Driver } from '@/types';

const allDrivers = driversData as Driver[];

const totalDrivers = allDrivers.length;
const availableDrivers = allDrivers.filter(d => d.status === 'Available').length;
const suspendedDrivers = allDrivers.filter(d => d.status === 'Suspended').length;
const expiringLicenses = allDrivers.filter(d => {
  const expiry = new Date(d.licenseExpiry);
  const now = new Date();
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 90 && diffDays > 0;
}).length;

const complianceAlerts = allDrivers
  .filter(d => {
    const expiry = new Date(d.licenseExpiry);
    const now = new Date();
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 90;
  })
  .map(d => ({
    id: d.id,
    name: d.name,
    issue: new Date(d.licenseExpiry) < new Date() ? 'License expired' : 'License expiring soon',
    date: d.licenseExpiry,
    severity: new Date(d.licenseExpiry) < new Date() ? 'critical' : 'warning',
  }));

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const columns: ColumnDef<Driver, any>[] = [
    {
      accessorKey: 'name',
      header: 'Driver',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.name} size="sm" />
          <div>
            <p className="font-medium text-text-primary">{row.original.name}</p>
            <p className="text-xs text-text-muted">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'licenseNumber',
      header: 'License Number',
      cell: ({ getValue }) => <span className="font-mono text-sm">{getValue()}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="px-2 py-0.5 bg-muted rounded-md text-xs font-semibold text-text-primary">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'safetyScore',
      header: 'Safety Score',
      cell: ({ getValue }) => {
        const score = getValue() as number;
        const color = score >= 90 ? 'text-emerald-400' : score >= 80 ? 'text-amber-400' : 'text-red-400';
        const bg = score >= 90 ? 'bg-emerald-500/10 border border-emerald-500/20' : score >= 80 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-red-500/10 border border-red-500/20';
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${color} ${bg}`}>
            {score}/100
          </span>
        );
      },
    },
    {
      accessorKey: 'licenseExpiry',
      header: 'License Expiry',
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isExpiring = diffDays <= 90;
        return (
          <span className={isExpiring ? 'text-amber-400 font-medium' : ''}>
            {formatDate(getValue() as string)}
            {isExpiring && diffDays > 0 && <span className="text-xs ml-1">({diffDays}d)</span>}
          </span>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
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
                <Eye className="h-3.5 w-3.5" /> View Profile
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-accent transition-colors">
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-accent transition-colors">
                <Phone className="h-3.5 w-3.5" /> Call
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" onClick={() => setActionMenuId(null)}>
      <PageHeader
        title="Driver Management"
        subtitle="Manage your fleet drivers and compliance"
        icon={Users}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Drivers" value={totalDrivers} change={8.3} changeLabel="vs last month" icon={Users} />
        <StatCard label="Available" value={availableDrivers} icon={UserCheck} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="Suspended" value={suspendedDrivers} icon={UserX} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard label="Licenses Expiring" value={expiringLicenses} icon={ShieldAlert} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Table */}
        <div className="xl:col-span-3">
          <div className="mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search drivers..." className="w-full sm:w-72" />
          </div>
          <DataTable data={allDrivers} columns={columns} searchQuery={search} />
        </div>

        {/* Compliance Alerts Panel */}
        <div className="bg-bg-card border border-border-glass shadow-glass rounded-xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-text-primary">Compliance Alerts</h3>
          </div>
          {complianceAlerts.length === 0 ? (
            <p className="text-sm text-text-muted">No compliance issues.</p>
          ) : (
            <div className="space-y-3">
              {complianceAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                  <p className="text-sm font-medium text-text-primary">{alert.name}</p>
                  <p className={`text-xs mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                  }`}>{alert.issue}</p>
                  <p className="text-xs text-text-muted mt-0.5">{formatDate(alert.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
