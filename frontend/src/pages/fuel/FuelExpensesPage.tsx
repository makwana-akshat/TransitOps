import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FuelFormModal } from '@/components/forms/FuelFormModal';
import { ExpenseFormModal } from '@/components/forms/ExpenseFormModal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Fuel, DollarSign, TrendingUp, PieChart as PieIcon, Plus,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { fetchFuelLogs, fetchExpenses, fetchFuelSummary, fetchExpenseSummary } from '@/api/expenses';

type ActiveTab = 'Fuel' | 'Expenses';

export default function FuelExpensesPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('Fuel');
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const { data: fuelLogsData, isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel-logs', { search }],
    queryFn: () => fetchFuelLogs({ search: search || undefined, page_size: 50 }),
  });

  const { data: expensesData, isLoading: expLoading } = useQuery({
    queryKey: ['expenses', { search }],
    queryFn: () => fetchExpenses({ search: search || undefined, page_size: 50 }),
  });

  const { data: fuelSummaryData } = useQuery({
    queryKey: ['fuel-summary'],
    queryFn: fetchFuelSummary,
  });

  const { data: expenseSummaryData } = useQuery({
    queryKey: ['expense-summary'],
    queryFn: fetchExpenseSummary,
  });

  const fuelLogs = fuelLogsData?.data?.items || [];
  const expenses = expensesData?.data?.items || [];
  const fuelSummary = fuelSummaryData?.data;
  const expenseSummary = expenseSummaryData?.data;

  // ── Build expense breakdown for pie chart ─────────────────────────────────
  const costBreakdown = expenseSummary?.expense_breakdown
    ? Object.entries(expenseSummary.expense_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  // ── Columns ───────────────────────────────────────────────────────────────
  const fuelColumns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'vehicle_id',
      header: 'Vehicle',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-text-muted">{row.original.vehicle_id?.slice(0, 8)}…</span>
      ),
    },
    {
      accessorKey: 'fuel_type',
      header: 'Fuel Type',
      cell: ({ getValue }) => <StatusBadge status={getValue()} variant="info" />,
    },
    {
      accessorKey: 'liters',
      header: 'Liters',
      cell: ({ getValue }) => <span className="font-medium">{getValue()} L</span>,
    },
    {
      accessorKey: 'total_cost',
      header: 'Total Cost',
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span>,
    },
    {
      accessorKey: 'payment_method',
      header: 'Payment',
      cell: ({ getValue }) => <span className="text-sm text-text-muted">{getValue()}</span>,
    },
    {
      accessorKey: 'filled_at',
      header: 'Date',
      cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span>,
    },
  ];

  const expenseColumns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'expense_type',
      header: 'Category',
      cell: ({ getValue }) => {
        const cat = getValue() as string;
        const variant = cat === 'Toll' ? 'success' : cat === 'Insurance' ? 'warning' : 'neutral';
        return <StatusBadge status={cat} variant={variant} />;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span>,
    },
    {
      accessorKey: 'payment_method',
      header: 'Payment',
      cell: ({ getValue }) => <span className="text-sm text-text-muted">{getValue()}</span>,
    },
    {
      accessorKey: 'expense_date',
      header: 'Date',
      cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue())}</span>,
    },
  ];

  const tabs: ActiveTab[] = ['Fuel', 'Expenses'];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Fuel & Expenses"
          subtitle="Track fuel consumption and operational costs"
          icon={Fuel}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-bg-card border border-border-glass rounded-xl hover:bg-bg-elevated transition-colors"
          >
            <Fuel className="h-4 w-4" /> Log Fuel
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-bg rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Log Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Fuel Cost" value={fuelSummary ? formatCurrency(fuelSummary.total_fuel_cost) : '—'} icon={Fuel} />
        <StatCard label="Avg Price / Liter" value={fuelSummary ? `₹${fuelSummary.average_fuel_price?.toFixed(2)}` : '—'} icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="Total Operational Cost" value={expenseSummary ? formatCurrency(expenseSummary.total_operational_cost) : '—'} icon={TrendingUp} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard label="Total Expenses" value={expenseSummary ? formatCurrency(expenseSummary.total_expenses) : '—'} icon={PieIcon} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Fuel Log History" subtitle="Recent fill-ups">
          {fuelLogs.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center">
              <EmptyState title="No Fuel Logs" message="Log fuel to see history." className="py-0" />
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fuelLogs.slice(0, 10)} barSize={28}>
              <defs>
                <linearGradient id="gradBarFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5F5F7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F5F5F7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="fuel_type" tick={{ fontSize: 11, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '12px', color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value), 'Cost']}
              />
              <Bar dataKey="total_cost" fill="url(#gradBarFuel)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Expense Breakdown" subtitle="By category">
          {costBreakdown.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center">
              <EmptyState title="No Expenses" message="Log expenses to see breakdown." className="py-0" />
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {costBreakdown.map((_entry, i) => {
                  const fills = ['#F5F5F7', '#8A8A93', '#5A5A63', '#3ECF8E', '#F0555A'];
                  return <Cell key={i} fill={fills[i % fills.length]} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '12px', color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value)]}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mb-4 border-b border-border-glass">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-white text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${activeTab.toLowerCase()}...`} className="w-full sm:w-72" />
      </div>

      {activeTab === 'Fuel' ? (
        <DataTable data={fuelLogs} columns={fuelColumns} searchQuery={search} isLoading={fuelLoading} />
      ) : (
        <DataTable data={expenses} columns={expenseColumns} searchQuery={search} isLoading={expLoading} />
      )}

      {/* Modals */}
      <FuelFormModal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)} />
      <ExpenseFormModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
    </div>
  );
}
