import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProgressFormWrapper } from '@/components/ui/ProgressFormWrapper';
import { fetchVehicles } from '@/api/vehicles';
import { createFuelLog } from '@/api/expenses';
import { Fuel, X } from 'lucide-react';

interface FuelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FUEL_TYPES = ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid', 'Other'];
const PAYMENT_METHODS = ['Company Account', 'Cash', 'Card', 'UPI', 'Other'];

const toLocalDatetimeString = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const FuelFormModal: React.FC<FuelFormModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const now = toLocalDatetimeString(new Date());

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      vehicle_id: '',
      fuel_type: 'Diesel',        // Smart default
      liters: '',
      price_per_liter: '',
      total_cost: '',
      fuel_station: '',
      odometer: '',
      filled_at: now,             // Smart default: right now
      payment_method: 'Company Account', // Smart default
      remarks: '',
    }
  });

  // Auto-calculate total cost
  const liters = parseFloat(watch('liters') || '0');
  const pricePerLiter = parseFloat(watch('price_per_liter') || '0');
  useEffect(() => {
    if (liters > 0 && pricePerLiter > 0) {
      setValue('total_cost', (liters * pricePerLiter).toFixed(2));
    }
  }, [liters, pricePerLiter, setValue]);

  // Fetch available vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', { page_size: 100 }],
    queryFn: () => fetchVehicles({ page_size: 100 }),
    enabled: isOpen,
  });
  const vehicles = vehiclesData?.data?.items || [];

  // Mutation
  const createMutation = useMutation({
    mutationFn: createFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-summary'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err.message || 'An error occurred';
      alert(`Failed: ${msg}`);
    }
  });

  // Progress tracking (6 required fields)
  const watched = watch();
  const requiredFields = ['vehicle_id', 'fuel_type', 'liters', 'price_per_liter', 'filled_at', 'payment_method'];
  const filledCount = requiredFields.filter(f => watched[f as keyof typeof watched] && String(watched[f as keyof typeof watched]).trim() !== '').length;

  const onSubmit = (data: any) => {
    const payload = {
      vehicle_id: data.vehicle_id,
      fuel_type: data.fuel_type,
      liters: parseFloat(data.liters),
      price_per_liter: parseFloat(data.price_per_liter),
      total_cost: parseFloat(data.total_cost),
      fuel_station: data.fuel_station || null,
      odometer: data.odometer ? parseFloat(data.odometer) : null,
      filled_at: new Date(data.filled_at).toISOString(),
      payment_method: data.payment_method,
      remarks: data.remarks || null,
    };
    createMutation.mutate(payload);
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2 text-sm border border-border-glass rounded-lg bg-bg-elevated text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
  const labelClass = "block text-xs font-medium text-text-muted mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg">
        <ProgressFormWrapper
          title="Log Fuel Fill-up"
          description="Record a fuel transaction for a vehicle"
          totalFields={6}
          filledFields={filledCount}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Vehicle */}
            <div>
              <label className={labelClass}>Vehicle *</label>
              <select {...register('vehicle_id', { required: true })} className={inputClass}>
                <option value="">Select vehicle</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.registration_number} — {v.vehicle_name}</option>
                ))}
              </select>
            </div>

            {/* Fuel Type & Payment Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fuel Type *</label>
                <select {...register('fuel_type', { required: true })} className={inputClass}>
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Method *</label>
                <select {...register('payment_method', { required: true })} className={inputClass}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Liters & Price per Liter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Liters *</label>
                <input type="number" step="0.01" {...register('liters', { required: true })} className={inputClass} placeholder="e.g., 45.5" />
              </div>
              <div>
                <label className={labelClass}>Price / Liter *</label>
                <input type="number" step="0.01" {...register('price_per_liter', { required: true })} className={inputClass} placeholder="e.g., 1.45" />
              </div>
            </div>

            {/* Total Cost (auto-calculated) */}
            <div>
              <label className={labelClass}>Total Cost (Auto-calculated)</label>
              <input type="number" step="0.01" {...register('total_cost')} className={`${inputClass} bg-bg text-text-muted`} readOnly />
            </div>

            {/* Station & Odometer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fuel Station</label>
                <input {...register('fuel_station')} className={inputClass} placeholder="e.g., HP Petrol Pump" />
              </div>
              <div>
                <label className={labelClass}>Odometer Reading</label>
                <input type="number" step="1" {...register('odometer')} className={inputClass} placeholder="km" />
              </div>
            </div>

            {/* Filled At */}
            <div>
              <label className={labelClass}>Filled At *</label>
              <input type="datetime-local" {...register('filled_at', { required: true })} className={inputClass} />
            </div>

            {/* Remarks */}
            <div>
              <label className={labelClass}>Remarks</label>
              <input {...register('remarks')} className={inputClass} placeholder="Optional notes..." />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-glass">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2 text-sm font-semibold bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Fuel className="h-4 w-4" />
                {createMutation.isPending ? 'Saving...' : 'Log Fuel'}
              </button>
            </div>
          </form>
        </ProgressFormWrapper>
      </div>
    </div>
  );
};
