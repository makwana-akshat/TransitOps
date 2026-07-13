import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import {
  Route, X, MapPin, Package, Truck, User, Weight,
  Play, CheckCircle2, XCircle,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/utils/formatters';
import tripsData from '@/data/trips.json';
import type { Trip } from '@/types';

const allTrips = tripsData as Trip[];

export default function TripsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const filteredData = useMemo(() => {
    return allTrips.filter(t => statusFilter === 'All' || t.status === statusFilter);
  }, [statusFilter]);

  const columns: ColumnDef<Trip, any>[] = [
    {
      accessorKey: 'tripNumber',
      header: 'Trip #',
      cell: ({ getValue }) => <span className="font-mono text-sm font-medium text-primary">{getValue()}</span>,
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Trip Management"
        subtitle={`${allTrips.length} total trips`}
        icon={Route}
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

          <DataTable
            data={filteredData}
            columns={columns}
            searchQuery={search}
            onRowClick={(trip) => setSelectedTrip(trip)}
          />
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
                  <PrimaryButton size="sm" className="flex-1" icon={<Play className="h-3.5 w-3.5" />}>
                    Dispatch
                  </PrimaryButton>
                )}
                {selectedTrip.status === 'Dispatched' && (
                  <PrimaryButton size="sm" className="flex-1" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                    Complete Trip
                  </PrimaryButton>
                )}
                {(selectedTrip.status === 'Draft' || selectedTrip.status === 'Dispatched') && (
                  <SecondaryButton size="sm" className="text-red-600 hover:bg-red-50 border-red-200" icon={<XCircle className="h-3.5 w-3.5" />}>
                    Cancel
                  </SecondaryButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
