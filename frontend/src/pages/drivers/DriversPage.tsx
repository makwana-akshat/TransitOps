import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users, UserCheck, UserX, ShieldAlert, AlertTriangle,
  MoreHorizontal, Eye, Edit, Phone, Trash2, Plus
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { useDrivers, useComplianceAlerts, useDeleteDriver, useCreateDriver, useUpdateDriver } from '@/hooks/useDrivers';
import { Modal } from '@/components/ui/Modal';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { useForm } from 'react-hook-form';
import type { Driver } from '@/types';

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const { register, handleSubmit, reset } = useForm();

  const { data: response, isLoading } = useDrivers({
    search: search || undefined,
  });

  const { data: complianceRes } = useComplianceAlerts();
  const createDriverMutation = useCreateDriver();
  const updateDriverMutation = useUpdateDriver();
  const deleteDriverMutation = useDeleteDriver();

  const allDrivers = response?.data?.items || [];
  const totalDrivers = response?.data?.total || 0;
  
  // Using the paginated items to estimate stats for now
  const availableDrivers = allDrivers.filter((d: any) => d.status === 'Available').length;
  const suspendedDrivers = allDrivers.filter((d: any) => d.status === 'Suspended').length;

  const alertsData = complianceRes?.data || { expired_licenses: [], expiring_soon: [], low_safety_scores: [] };
  const expiringLicenses = alertsData.expiring_soon?.length || 0;

  const complianceAlerts = [
    ...(alertsData.expired_licenses || []).map((d: any) => ({
      id: d.id,
      name: d.full_name,
      issue: 'License expired',
      date: d.license_expiry,
      severity: 'critical'
    })),
    ...(alertsData.expiring_soon || []).map((d: any) => ({
      id: d.id,
      name: d.full_name,
      issue: 'License expiring soon',
      date: d.license_expiry,
      severity: 'warning'
    }))
  ];

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      deleteDriverMutation.mutate(id);
    }
  };

  const onSubmit = (data: any) => {
    const payload = { ...data };
    
    // Convert string empty values to null for API
    if (!payload.license_expiry) payload.license_expiry = null;
    
    if (modalMode === 'create') {
      createDriverMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset({});
        }
      });
    } else if (modalMode === 'edit' && selectedDriver) {
      updateDriverMutation.mutate({ id: selectedDriver.id, data: payload }, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset({});
        }
      });
    }
  };

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'full_name',
      header: 'Driver',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.full_name} size="sm" />
          <div>
            <p className="font-medium text-text-primary">{row.original.full_name}</p>
            <p className="text-xs text-text-muted">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'license_number',
      header: 'License Number',
      cell: ({ getValue }) => <span className="font-mono text-sm">{getValue()}</span>,
    },
    {
      accessorKey: 'license_category',
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="px-2 py-0.5 bg-muted rounded-md text-xs font-semibold text-text-primary">
          {getValue() || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'safety_score',
      header: 'Safety Score',
      cell: ({ getValue }) => {
        const score = getValue() as number;
        if (score === null || score === undefined) return <span className="text-xs text-text-muted">N/A</span>;
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
      accessorKey: 'license_expiry',
      header: 'License Expiry',
      cell: ({ getValue }) => {
        if (!getValue()) return <span className="text-xs text-text-muted">N/A</span>;
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
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDriver(row.original);
                  setModalMode('view');
                  setIsModalOpen(true);
                  setActionMenuId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-accent transition-colors"
              >
                <Eye className="h-3.5 w-3.5" /> View Profile
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDriver(row.original);
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

  return (
    <div className="animate-fade-in" onClick={() => setActionMenuId(null)}>
      <PageHeader
        title="Driver Management"
        subtitle="Manage your fleet drivers and compliance"
        icon={Users}
        action={
          <PrimaryButton 
            onClick={() => { setModalMode('create'); setSelectedDriver(null); reset({}); setIsModalOpen(true); }} 
            icon={<Plus className="h-4 w-4" />}
          >
            Register Driver
          </PrimaryButton>
        }
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
          {isLoading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <DataTable data={allDrivers} columns={columns} searchQuery="" />
          )}
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
              {complianceAlerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
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

      {/* Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset({}); }}
        title={modalMode === 'create' ? "Register Driver" : modalMode === 'edit' ? "Edit Driver" : "Driver Profile"}
        subtitle={modalMode === 'create' ? "Add a new driver to the system" : modalMode === 'edit' ? "Update driver details" : "View comprehensive driver records"}
        size="lg"
        footer={
          modalMode === 'view' ? (
            <PrimaryButton onClick={() => { setIsModalOpen(false); reset({}); }}>Close</PrimaryButton>
          ) : null
        }
      >
        {modalMode === 'view' && selectedDriver ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
             <div className="bg-bg-card rounded-lg border border-border p-4 shadow-sm flex flex-col items-center">
                <Avatar name={selectedDriver.full_name} size="lg" className="h-20 w-20 text-2xl mb-4" />
                <h3 className="text-lg font-bold text-text-primary">{selectedDriver.full_name}</h3>
                <p className="text-sm text-text-muted mb-4">{selectedDriver.email}</p>
                <StatusBadge status={selectedDriver.status} />
             </div>
             <div className="bg-bg-card rounded-lg border border-border p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Contact & License</h3>
                <div className="space-y-2">
                   <p className="text-sm"><span className="text-text-muted">Phone:</span> {selectedDriver.phone || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">License No:</span> {selectedDriver.license_number || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">Category:</span> {selectedDriver.license_category || 'N/A'}</p>
                   <p className="text-sm"><span className="text-text-muted">Expiry:</span> {selectedDriver.license_expiry ? formatDate(selectedDriver.license_expiry) : 'N/A'}</p>
                </div>
             </div>
             <div className="bg-bg-card rounded-lg border border-border p-4 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Performance & Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div>
                     <p className="text-xs text-text-muted mb-1">Safety Score</p>
                     <p className={`text-sm font-bold ${selectedDriver.safety_score >= 90 ? 'text-emerald-500' : selectedDriver.safety_score >= 80 ? 'text-amber-500' : 'text-red-500'}`}>
                       {selectedDriver.safety_score || 0}/100
                     </p>
                   </div>
                   <div>
                     <p className="text-xs text-text-muted mb-1">Total Distance</p>
                     <p className="text-sm font-semibold text-text-primary">{selectedDriver.total_distance?.toFixed(0) || 0} km</p>
                   </div>
                   <div>
                     <p className="text-xs text-text-muted mb-1">Created At</p>
                     <p className="text-sm font-semibold text-text-primary">{formatDate(selectedDriver.created_at)}</p>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="w-full">
            {(createDriverMutation.isError || updateDriverMutation.isError) && (
              <div className="w-full mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {/* @ts-ignore */}
                {createDriverMutation.error?.response?.data?.detail || updateDriverMutation.error?.response?.data?.detail || "An error occurred while saving the driver."}
              </div>
            )}
            <Stepper 
              onComplete={handleSubmit(onSubmit)}
              steps={[
                {
                  title: "Basic Info",
                  content: (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Employee Code</label>
                        <input {...register('employee_code', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., EMP-001" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                        <input {...register('full_name', { required: true })} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., John Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                        <input type="email" {...register('email')} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., john@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
                        <input {...register('phone')} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., +1 234 567 8900" />
                      </div>
                    </div>
                  )
                },
                {
                  title: "Compliance",
                  content: (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">License Number</label>
                        <input {...register('license_number')} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary placeholder:text-text-faint" placeholder="e.g., DL-123456" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">License Category</label>
                          <select {...register('license_category')} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary">
                            <option value="A">A (Motorcycles)</option>
                            <option value="B">B (Cars)</option>
                            <option value="C">C (Heavy Goods)</option>
                            <option value="D">D (Buses)</option>
                            <option value="CE">CE (Heavy + Trailer)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1.5">License Expiry</label>
                          <input type="date" {...register('license_expiry')} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary [color-scheme:dark]" />
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  title: "Assignment",
                  content: (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Initial Status</label>
                        <select {...register('status')} className="w-full px-3 py-2 text-sm bg-bg border border-border-glass rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green text-text-primary">
                          <option value="AVAILABLE">Available (Ready for dispatch)</option>
                          <option value="OFF_DUTY">Off Duty</option>
                          <option value="SUSPENDED">Suspended (Pending review)</option>
                        </select>
                        <p className="mt-2 text-xs text-text-muted">Setting a driver to Available allows them to immediately be assigned to active trips.</p>
                      </div>
                    </div>
                  )
                }
              ]} 
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
