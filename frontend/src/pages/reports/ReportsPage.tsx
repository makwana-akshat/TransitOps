import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChartCard } from '@/components/ui/ChartCard';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { BarChart3, Download, FileText } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import reportsData from '@/data/reports.json';

const { fleetUtilization, roiData, fuelEfficiency, maintenanceCost } = reportsData;

export default function ReportsPage() {
  const handleExport = (format: string) => {
    alert(`Export as ${format} — this would generate a real file when connected to a backend.`);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Fleet performance insights and data exports"
        icon={BarChart3}
        action={
          <div className="flex gap-2">
            <SecondaryButton onClick={() => handleExport('CSV')} icon={<Download className="h-4 w-4" />}>
              Export CSV
            </SecondaryButton>
            <PrimaryButton onClick={() => handleExport('PDF')} icon={<FileText className="h-4 w-4" />}>
              Export PDF
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fleet Utilization */}
        <ChartCard title="Fleet Utilization" subtitle="Monthly utilization percentage">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fleetUtilization}>
              <defs>
                <linearGradient id="gradUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(214.3 31.8% 91.4%)', borderRadius: '8px', fontSize: '13px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${value}%`, 'Utilization']}
              />
              <Area type="monotone" dataKey="utilization" stroke="#2563EB" strokeWidth={2} fill="url(#gradUtil)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ROI Analysis */}
        <ChartCard title="ROI Analysis" subtitle="Revenue vs Cost comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(214.3 31.8% 91.4%)', borderRadius: '8px', fontSize: '13px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [formatCurrency(value)]}
              />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fuel Efficiency */}
        <ChartCard title="Fuel Efficiency" subtitle="Average km per liter">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fuelEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[4, 6]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(214.3 31.8% 91.4%)', borderRadius: '8px', fontSize: '13px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${value} km/L`, 'Efficiency']}
              />
              <Line type="monotone" dataKey="kmPerLiter" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Maintenance Cost */}
        <ChartCard title="Maintenance Cost" subtitle="Monthly maintenance spending">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maintenanceCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(214.3 31.8% 91.4%)', borderRadius: '8px', fontSize: '13px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [formatCurrency(value), 'Cost']}
              />
              <Bar dataKey="cost" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
