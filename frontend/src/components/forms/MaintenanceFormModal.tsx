import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProgressFormWrapper } from '@/components/ui/ProgressFormWrapper';
import { fetchVehicles } from '@/api/vehicles';
import { createMaintenanceRecord } from '@/api/maintenance';
import { Wrench } from 'lucide-react';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAINTENANCE_TYPES = [
  'Oil Change', 'Engine Service', 'Brake Service', 'Tyre Replacement', 
  'Battery Replacement', 'Inspection', 'Insurance', 'Registration', 
  'Accident Repair', 'Body Work', 'Electrical', 'Transmission', 'Other'
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const toLocalDatetimeString = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const now = toLocalDatetimeString(new Date());

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      vehicle_id: '',
      maintenance_type: 'Inspection',     // Smart default
      priority: 'MEDIUM',                 // Smart default
      description: '',
      workshop_name: '',
      estimated_cost: '',
      start_date: now,                    // Smart default: right now
      expected_completion: '',
      next_service_due: '',
    }
  });

  // Fetch available vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', { page_size: 100 }],
    queryFn: () => fetchVehicles({ page_size: 100 }),
    enabled: isOpen,
  });
  const vehicles = vehiclesData?.data?.items || [];

  const createMutation = useMutation({
    mutationFn: createMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['active-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-maintenance'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err.message || 'An error occurred';
      alert(`Failed: ${msg}`);
    }
  });

  // Progress tracking (3 essentially required fields mapped by UI)
  const watched = watch();
  const requiredFields = ['vehicle_id', 'maintenance_type', 'priority', 'start_date'];
  const filledCount = requiredFields.filter(f => watched[f as keyof typeof watched] && String(watched[f as keyof typeof watched]).trim() !== '').length;

  const onSubmit = (data: any) => {
    const payload = {
      vehicle_id: data.vehicle_id,
      maintenance_type: data.maintenance_type,
      priority: data.priority,
      description: data.description || null,
      workshop_name: data.workshop_name || null,
      estimated_cost: data.estimated_cost ? parseFloat(data.estimated_cost) : null,
      start_date: new Date(data.start_date).toISOString(),
      expected_completion: data.expected_completion ? new Date(data.expected_completion).toISOString() : null,
      next_service_due: data.next_service_due ? new Date(data.next_service_due).toISOString() : null,
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
          title="Log Maintenance"
          description="Schedule or log a new maintenance record"
          totalFields={4}
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

            {/* Type & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Service Type *</label>
                <select {...register('maintenance_type', { required: true })} className={inputClass}>
                  {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority *</label>
                <select {...register('priority', { required: true })} className={inputClass}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Workshop & Est Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Workshop Name</label>
                <input {...register('workshop_name')} className={inputClass} placeholder="e.g., AutoCare Center" />
              </div>
              <div>
                <label className={labelClass}>Estimated Cost (₹)</label>
                <input type="number" step="0.01" {...register('estimated_cost')} className={inputClass} placeholder="Optional" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <input {...register('description')} className={inputClass} placeholder="What needs to be done?" />
            </div>

            {/* Start & Completion Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date *</label>
                <input type="datetime-local" {...register('start_date', { required: true })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Expected Completion</label>
                <input type="datetime-local" {...register('expected_completion')} className={inputClass} />
              </div>
            </div>

            {/* Next Service Due */}
            <div>
              <label className={labelClass}>Next Service Due</label>
              <input type="datetime-local" {...register('next_service_due')} className={inputClass} />
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
                <Wrench className="h-4 w-4" />
                {createMutation.isPending ? 'Saving...' : 'Log Maintenance'}
              </button>
            </div>
          </form>
        </ProgressFormWrapper>
      </div>
    </div>
  );
};
