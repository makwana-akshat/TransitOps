import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProgressFormWrapper } from '@/components/ui/ProgressFormWrapper';
import { fetchVehicles } from '@/api/vehicles';
import { createExpense } from '@/api/expenses';
import { Receipt } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPENSE_TYPES = ['Toll', 'Parking', 'Insurance', 'Registration', 'Repair', 'Tyres', 'Battery', 'Cleaning', 'Miscellaneous'];
const PAYMENT_METHODS = ['Company Account', 'Cash', 'Card', 'UPI', 'Other'];

const toLocalDatetimeString = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const now = toLocalDatetimeString(new Date());

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      vehicle_id: '',
      expense_type: 'Toll',               // Smart default
      amount: '',
      expense_date: now,                  // Smart default: right now
      vendor: '',
      invoice_number: '',
      description: '',
      payment_method: 'Company Account',  // Smart default
      remarks: '',
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
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err.message || 'An error occurred';
      alert(`Failed: ${msg}`);
    }
  });

  // Progress tracking (4 required fields)
  const watched = watch();
  const requiredFields = ['vehicle_id', 'expense_type', 'amount', 'payment_method'];
  const filledCount = requiredFields.filter(f => watched[f as keyof typeof watched] && String(watched[f as keyof typeof watched]).trim() !== '').length;

  const onSubmit = (data: any) => {
    const payload = {
      vehicle_id: data.vehicle_id,
      expense_type: data.expense_type,
      amount: parseFloat(data.amount),
      expense_date: new Date(data.expense_date).toISOString(),
      vendor: data.vendor || null,
      invoice_number: data.invoice_number || null,
      description: data.description || null,
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
          title="Log Expense"
          description="Record a general operational expense"
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

            {/* Expense Type & Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Expense Type *</label>
                <select {...register('expense_type', { required: true })} className={inputClass}>
                  {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount (₹) *</label>
                <input type="number" step="0.01" {...register('amount', { required: true })} className={inputClass} placeholder="e.g., 250.00" />
              </div>
            </div>

            {/* Vendor & Invoice */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Vendor / Payee</label>
                <input {...register('vendor')} className={inputClass} placeholder="e.g., NHAI Toll" />
              </div>
              <div>
                <label className={labelClass}>Invoice #</label>
                <input {...register('invoice_number')} className={inputClass} placeholder="Optional" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <input {...register('description')} className={inputClass} placeholder="Short description of the expense" />
            </div>

            {/* Date & Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Expense Date *</label>
                <input type="datetime-local" {...register('expense_date', { required: true })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Method *</label>
                <select {...register('payment_method', { required: true })} className={inputClass}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
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
                <Receipt className="h-4 w-4" />
                {createMutation.isPending ? 'Saving...' : 'Log Expense'}
              </button>
            </div>
          </form>
        </ProgressFormWrapper>
      </div>
    </div>
  );
};
