import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Fuel, DollarSign, TrendingUp, PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency, formatDate } from '@/utils/formatters';
import fuelData from '@/data/fuel.json';

const { monthlyFuelCost, expenses, costBreakdown, summary } = fuelData;

type ExpenseCategory = 'All' | 'Fuel' | 'Maintenance' | 'Tolls' | 'Insurance' | 'Other';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vehicleName?: string;
}

export default function FuelExpensesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory>('All');

  const filteredExpenses = useMemo(() => {
    return (expenses as Expense[]).filter(e => categoryFilter === 'All' || e.category === categoryFilter);
  }, [categoryFilter]);

  const columns: ColumnDef<Expense, any>[] = [
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => {
        const cat = getValue() as string;
        const variant = cat === 'Fuel' ? 'info' : cat === 'Maintenance' ? 'warning' : cat === 'Tolls' ? 'success' : 'neutral';
        return <StatusBadge status={cat} variant={variant} />;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: 'vehicleName',
      header: 'Vehicle',
      cell: ({ getValue }) => getValue() || <span className="text-text-muted">—</span>,
    },
  ];

  const tabs: ExpenseCategory[] = ['All', 'Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Other'];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Fuel & Expenses"
        subtitle="Track fuel consumption and operational costs"
        icon={Fuel}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Fuel Cost" value={formatCurrency(summary.totalFuelCost)} change={6.8} changeLabel="vs last year" icon={Fuel} />
        <StatCard label="Avg Cost/KM" value={`$${summary.avgCostPerKm}`} change={-1.2} changeLabel="vs last month" icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="Operational Cost" value={formatCurrency(summary.operationalCost)} change={3.5} changeLabel="vs last quarter" icon={TrendingUp} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard label="ROI" value={`${summary.roi}%`} change={2.1} changeLabel="vs last quarter" icon={PieIcon} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Monthly Fuel Cost" subtitle="Year-to-date spending">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyFuelCost} barSize={36}>
              <defs>
                <linearGradient id="gradBarFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8A8A93" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8A8A93" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value), 'Cost']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="cost" fill="url(#gradBarFuel)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost Breakdown" subtitle="By category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {costBreakdown.map((entry, i) => {
                  const fills = ['#F5F5F7', '#8A8A93', '#5A5A63', '#282830', '#1C1C22'];
                  return <Cell key={i} fill={fills[i % fills.length]} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value)]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border-glass">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setCategoryFilter(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              categoryFilter === tab
                ? 'border-white text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search expenses..." className="w-full sm:w-72" />
      </div>

      <DataTable data={filteredExpenses} columns={columns} searchQuery={search} />
    </div>
  );
}
