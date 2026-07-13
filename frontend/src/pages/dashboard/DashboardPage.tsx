import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
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
  { name: 'Available', value: availableVehicles, fill: '#10B981' },
  { name: 'On Trip', value: onTrip, fill: '#2563EB' },
  { name: 'In Shop', value: inMaintenance, fill: '#F59E0B' },
  { name: 'Retired', value: vehiclesData.filter(v => v.status === 'Retired').length, fill: '#9CA3AF' },
];

const activities = [
  { id: '1', action: 'Trip completed', subject: 'TRP-2026-0450 — Miami to Orlando', timestamp: '2026-07-12T08:45:00', user: 'James Patterson', type: 'trip' as const },
  { id: '2', action: 'Vehicle serviced', subject: 'Transit Express 100 — Oil Change', timestamp: '2026-07-12T07:30:00', user: 'Mike Torres', type: 'maintenance' as const },
  { id: '3', action: 'Driver assigned', subject: 'Maria Rodriguez → Cargo Hauler Pro', timestamp: '2026-07-12T06:15:00', user: 'System', type: 'driver' as const },
  { id: '4', action: 'Trip dispatched', subject: 'TRP-2026-0451 — New York to Boston', timestamp: '2026-07-12T06:00:00', user: 'Sarah Thompson', type: 'trip' as const },
  { id: '5', action: 'Maintenance scheduled', subject: 'Urban Connect V3 — AC Service', timestamp: '2026-07-11T16:30:00', user: 'Sarah Kim', type: 'maintenance' as const },
];

const typeColors = {
  trip: 'bg-blue-100 text-blue-700',
  vehicle: 'bg-emerald-100 text-emerald-700',
  driver: 'bg-purple-100 text-purple-700',
  maintenance: 'bg-amber-100 text-amber-700',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="Active Vehicles" value={activeVehicles} change={4.2} changeLabel="vs last month" icon={Bus} />
        <StatCard label="Available" value={availableVehicles} change={-2.1} changeLabel="vs last month" icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="In Maintenance" value={inMaintenance} change={8.3} changeLabel="vs last month" icon={Wrench} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard label="Drivers On Duty" value={tripsData.filter(t => t.status === 'Dispatched').length} change={5.0} changeLabel="vs last month" icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard label="Trips Today" value={tripsToday} change={12.5} changeLabel="vs yesterday" icon={Route} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard label="Fleet Utilization" value={`${utilization}%`} change={3.2} changeLabel="vs last month" icon={Gauge} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Fleet Utilization" subtitle="Monthly trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={utilizationData}>
              <defs>
                <linearGradient id="gradUtilization" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(214.3 31.8% 91.4%)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [`${value}%`, 'Utilization']}
              />
              <Area type="monotone" dataKey="utilization" stroke="#2563EB" strokeWidth={2} fill="url(#gradUtilization)" />
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
                  backgroundColor: 'white',
                  border: '1px solid hsl(214.3 31.8% 91.4%)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Fuel Cost Trend + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Fuel Cost Trend" subtitle="Monthly spending" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fuelData.monthlyFuelCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(214.3 31.8% 91.4%)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [formatCurrency(value), 'Cost']}
              />
              <Bar dataKey="cost" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
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
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <button className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-border">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
              <Avatar name={activity.user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.action}</span>{' '}
                  <span className="text-muted-foreground">— {activity.subject}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  by {activity.user} · {getRelativeTime(activity.timestamp)}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide ${typeColors[activity.type]}`}>
                {activity.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
