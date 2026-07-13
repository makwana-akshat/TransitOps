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
                  <stop offset="5%" stopColor="#F5F5F7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F5F5F7" stopOpacity={0} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [`${value}%`, 'Utilization']}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="stepAfter" dataKey="utilization" stroke="#F5F5F7" strokeWidth={2} fill="url(#gradUtil)" style={{ filter: 'url(#glow)' }} activeDot={{ r: 5, fill: '#F5F5F7', stroke: '#141418', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ROI Analysis */}
        <ChartCard title="ROI Analysis" subtitle="Revenue vs Cost comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData}>
              <defs>
                <linearGradient id="gradBarRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5F5F7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F5F5F7" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gradBarCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5A5A63" stopOpacity={1} />
                  <stop offset="100%" stopColor="#5A5A63" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value)]}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#8A8A93' }} />
              <Bar dataKey="revenue" name="Revenue" fill="url(#gradBarRev)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill="url(#gradBarCost)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fuel Efficiency */}
        <ChartCard title="Fuel Efficiency" subtitle="Average km per liter">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fuelEfficiency}>
              <defs>
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} domain={[4, 6]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', fontSize: '13px', color: '#F5F5F7', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [`${value} km/L`, 'Efficiency']}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line type="stepAfter" dataKey="kmPerLiter" stroke="#3ECF8E" strokeWidth={2} style={{ filter: 'url(#glowGreen)' }} dot={false} activeDot={{ r: 5, fill: '#3ECF8E', stroke: '#141418', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Maintenance Cost */}
        <ChartCard title="Maintenance Cost" subtitle="Monthly maintenance spending">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maintenanceCost}>
              <defs>
                <linearGradient id="gradBarMaint" x1="0" y1="0" x2="0" y2="1">
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
              <Bar dataKey="cost" fill="url(#gradBarMaint)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
