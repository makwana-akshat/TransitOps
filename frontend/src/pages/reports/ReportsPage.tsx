import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChartCard } from '@/components/ui/ChartCard';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { BarChart3, Download, FileText } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { exportReport } from '@/api/reports';
import { useFleetUtilization, useVehicleROI, useFuelEfficiency, useRevenueAnalysis } from '@/hooks/useReports';

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const { data: fleetDataRes, isLoading: fleetLoading } = useFleetUtilization();
  const { data: roiDataRes, isLoading: roiLoading } = useVehicleROI();
  const { data: fuelDataRes, isLoading: fuelLoading } = useFuelEfficiency();
  const { data: revDataRes, isLoading: revLoading } = useRevenueAnalysis();

  const fleetUtilization = fleetDataRes?.data || [];
  const roiData = roiDataRes?.data || [];
  const fuelEfficiency = fuelDataRes?.data || [];
  const revenueData = revDataRes?.data || [];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      const blob = await exportReport(format.toLowerCase(), 'revenue');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue_report.${format.toLowerCase()}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Fleet performance insights and data exports"
        icon={BarChart3}
        action={
          <div className="flex gap-2">
            <SecondaryButton onClick={() => handleExport('CSV')} disabled={isExporting} icon={<Download className="h-4 w-4" />}>
              Export CSV
            </SecondaryButton>
            <PrimaryButton onClick={() => handleExport('PDF')} disabled={isExporting} icon={<FileText className="h-4 w-4" />}>
              Export PDF
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fleet Utilization (Per Vehicle) */}
        <ChartCard title="Fleet Utilization" subtitle="Utilization percentage by vehicle">
          <ResponsiveContainer width="100%" height={300}>
            {fleetLoading ? <div className="h-full flex items-center justify-center text-text-muted text-sm">Loading...</div> : (
            <BarChart data={fleetUtilization} barSize={36}>
              <defs>
                <linearGradient id="gradUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5F5F7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F5F5F7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="registration_number" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [`${value}%`, 'Utilization']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="utilization_percentage" fill="url(#gradUtil)" radius={[4, 4, 0, 0]} />
            </BarChart>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* ROI Analysis (Per Vehicle) */}
        <ChartCard title="Vehicle ROI" subtitle="Revenue vs Total Cost (by Vehicle)">
          <ResponsiveContainer width="100%" height={300}>
            {roiLoading ? <div className="h-full flex items-center justify-center text-text-muted text-sm">Loading...</div> : (
            <BarChart data={roiData}>
              <defs>
                <linearGradient id="gradBarRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ECF8E" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3ECF8E" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gradBarCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E04F5E" stopOpacity={1} />
                  <stop offset="100%" stopColor="#E04F5E" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="registration_number" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value)]}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#8A8A93' }} />
              <Bar dataKey="revenue" name="Revenue" fill="url(#gradBarRev)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="maintenance_cost" name="Maintenance" stackId="a" fill="url(#gradBarCost)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fuel_cost" name="Fuel" stackId="a" fill="#E04F5E" fillOpacity={0.7} radius={[0, 0, 0, 0]} />
              <Bar dataKey="other_expenses" name="Expenses" stackId="a" fill="#E04F5E" fillOpacity={0.4} radius={[2, 2, 0, 0]} />
            </BarChart>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* Fuel Efficiency (Per Vehicle) */}
        <ChartCard title="Fuel Efficiency" subtitle="Km per liter by vehicle">
          <ResponsiveContainer width="100%" height={300}>
            {fuelLoading ? <div className="h-full flex items-center justify-center text-text-muted text-sm">Loading...</div> : (
            <BarChart data={fuelEfficiency} barSize={36}>
              <defs>
                <linearGradient id="gradFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="registration_number" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [`${value} km/L`, 'Efficiency']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="km_per_liter" fill="url(#gradFuel)" radius={[4, 4, 0, 0]} />
            </BarChart>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue vs Cost Analysis (Over Time) */}
        <ChartCard title="Company Revenue Analysis" subtitle="Monthly Revenue vs Expenses">
          <ResponsiveContainer width="100%" height={300}>
            {revLoading ? <div className="h-full flex items-center justify-center text-text-muted text-sm">Loading...</div> : (
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E04F5E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E04F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value)]}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#8A8A93' }} />
              <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#3ECF8E" strokeWidth={2} fill="url(#gradRev)" />
              <Area type="monotone" name="Expenses" dataKey="expenses" stroke="#E04F5E" strokeWidth={2} fill="url(#gradExp)" />
            </AreaChart>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
