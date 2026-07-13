import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { StatusBadge, PillBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  LayoutDashboard,
  Bus,
  CheckCircle2,
  Wrench,
  Users,
  Route,
  Gauge,
  Plus,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { motion } from "motion/react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency, getRelativeTime } from '@/utils/formatters';
import vehiclesData from '@/data/vehicles.json';
import tripsData from '@/data/trips.json';
import fuelData from '@/data/fuel.json';

// Computed stats
const activeVehicles = vehiclesData.filter(v => v.status !== 'Retired').length;
const availableVehicles = vehiclesData.filter(v => v.status === 'Available').length;
const inMaintenance = vehiclesData.filter(v => v.status === 'In Shop').length;
const onTrip = vehiclesData.filter(v => v.status === 'On Trip').length;
const tripsToday = tripsData.filter(t => t.status === 'Dispatched').length;
const utilization = Math.round((onTrip / activeVehicles) * 100);

const utilizationData = [
  { month: 'Jan', utilization: 72 },
  { month: 'Feb', utilization: 68 },
  { month: 'Mar', utilization: 78 },
  { month: 'Apr', utilization: 74 },
  { month: 'May', utilization: 82 },
  { month: 'Jun', utilization: 85 },
  { month: 'Jul', utilization: utilization },
];

const vehicleStatusData = [
  { name: 'Available', value: availableVehicles, fill: '#F5F5F7' },
  { name: 'On Trip', value: onTrip, fill: '#8A8A93' },
  { name: 'In Shop', value: inMaintenance, fill: '#5A5A63' },
  { name: 'Retired', value: vehiclesData.filter(v => v.status === 'Retired').length, fill: '#282830' },
];

const activities = [
  { id: '1', action: 'Trip completed', subject: 'TRP-2026-0450 — Miami to Orlando', timestamp: '2026-07-12T08:45:00', user: 'James Patterson', type: 'trip' as const },
  { id: '2', action: 'Vehicle serviced', subject: 'Transit Express 100 — Oil Change', timestamp: '2026-07-12T07:30:00', user: 'Mike Torres', type: 'maintenance' as const },
  { id: '3', action: 'Driver assigned', subject: 'Maria Rodriguez → Cargo Hauler Pro', timestamp: '2026-07-12T06:15:00', user: 'System', type: 'driver' as const },
  { id: '4', action: 'Trip dispatched', subject: 'TRP-2026-0451 — New York to Boston', timestamp: '2026-07-12T06:00:00', user: 'Sarah Thompson', type: 'trip' as const },
  { id: '5', action: 'Maintenance scheduled', subject: 'Urban Connect V3 — AC Service', timestamp: '2026-07-11T16:30:00', user: 'Sarah Kim', type: 'maintenance' as const },
];

const typeColors = {
  trip: 'green',
  vehicle: 'neutral',
  driver: 'neutral',
  maintenance: 'red',
} as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Fleet management overview"
        icon={LayoutDashboard}
      />

      {/* KPI Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        id="tour-kpis" 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
      >
        <motion.div variants={item}><StatCard label="Active Vehicles" value={activeVehicles} change={4.2} changeLabel="vs last month" icon={Bus} /></motion.div>
        <motion.div variants={item}><StatCard label="Available" value={availableVehicles} change={-2.1} changeLabel="vs last month" icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" /></motion.div>
        <motion.div variants={item}><StatCard label="In Maintenance" value={inMaintenance} change={8.3} changeLabel="vs last month" icon={Wrench} iconColor="text-amber-600" iconBg="bg-amber-50" /></motion.div>
        <motion.div variants={item}><StatCard label="Drivers On Duty" value={tripsData.filter(t => t.status === 'Dispatched').length} change={5.0} changeLabel="vs last month" icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" /></motion.div>
        <motion.div variants={item}><StatCard label="Trips Today" value={tripsToday} change={12.5} changeLabel="vs yesterday" icon={Route} iconColor="text-cyan-600" iconBg="bg-cyan-50" /></motion.div>
        <motion.div variants={item}><StatCard label="Fleet Utilization" value={`${utilization}%`} change={3.2} changeLabel="vs last month" icon={Gauge} iconColor="text-indigo-600" iconBg="bg-indigo-50" /></motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Fleet Utilization" subtitle="Monthly trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={utilizationData}>
              <defs>
                <linearGradient id="gradUtilization" x1="0" y1="0" x2="0" y2="1">
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
                contentStyle={{
                  backgroundColor: '#141418',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  fontSize: '13px',
                  color: '#F5F5F7',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [`${value}%`, 'Utilization']}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="stepAfter" dataKey="utilization" stroke="#F5F5F7" strokeWidth={2} fill="url(#gradUtilization)" style={{ filter: 'url(#glow)' }} activeDot={{ r: 5, fill: '#F5F5F7', stroke: '#141418', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vehicle Status" subtitle="Current distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={vehicleStatusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {vehicleStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141418',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  fontSize: '13px',
                  color: '#F5F5F7',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                }}
                itemStyle={{ color: '#F5F5F7' }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span className="text-xs text-text-muted">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Fuel Cost Trend + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Fuel Cost Trend" subtitle="Monthly spending" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fuelData.monthlyFuelCost} barSize={36}>
              <defs>
                <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8A8A93" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8A8A93" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141418',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  fontSize: '13px',
                  color: '#F5F5F7',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                }}
                itemStyle={{ color: '#F5F5F7' }}
                formatter={(value: any) => [formatCurrency(value), 'Cost']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="cost" fill="url(#gradBar)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <GlassCard id="tour-quick-actions" className="lg:col-span-1 p-5">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <PrimaryButton className="w-full justify-start" icon={<Plus className="h-4 w-4" />}>
              Register Vehicle
            </PrimaryButton>
            <SecondaryButton className="w-full justify-start" icon={<Route className="h-4 w-4" />}>
              Create Trip
            </SecondaryButton>
            <SecondaryButton className="w-full justify-start" icon={<Wrench className="h-4 w-4" />}>
              Schedule Maintenance
            </SecondaryButton>
            <SecondaryButton className="w-full justify-start" icon={<Users className="h-4 w-4" />}>
              Add Driver
            </SecondaryButton>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-0 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-glass bg-white/[0.02]">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Recent Activity</h3>
          <button className="text-[11px] font-medium text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors uppercase tracking-wider">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-border-glass">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors">
              <Avatar name={activity.user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  <span className="font-medium">{activity.action}</span>{' '}
                  <span className="text-text-muted">— {activity.subject}</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  by {activity.user} · {getRelativeTime(activity.timestamp)}
                </p>
              </div>
              <PillBadge color={typeColors[activity.type]}>
                {activity.type}
              </PillBadge>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
