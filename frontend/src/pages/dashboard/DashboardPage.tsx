import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { StatusBadge, PillBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { CardSkeleton, LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  LayoutDashboard,
  Bus,
  CheckCircle2,
  Wrench,
  Users,
  Route,
  Gauge,
  Plus,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { motion } from "motion/react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency, getRelativeTime } from '@/utils/formatters';
import { useDashboardOverview, useRecentActivity, useVehicleStatusChart, useMonthlyFuelCost, useMonthlyTrips } from '@/hooks/useDashboard';

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
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const { data: overviewRes, isLoading: overviewLoading } = useDashboardOverview();
  const { data: activityRes, isLoading: activityLoading } = useRecentActivity();
  const { data: statusChartRes } = useVehicleStatusChart();
  const { data: fuelChartRes } = useMonthlyFuelCost();
  const { data: tripsChartRes } = useMonthlyTrips();

  const overview = overviewRes?.data || {
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    driversOnDuty: 0,
    completedTripsToday: 0,
    fleetUtilization: 0,
  };

  const activities = activityRes?.data || [];
  
  const vehicleStatusData = (statusChartRes?.data || []).map((item: any) => ({
    name: item.status.replace('_', ' '),
    value: item.count,
    fill: item.status === 'AVAILABLE' ? '#10B981' : 
          item.status === 'ON_TRIP' ? '#3B82F6' : 
          item.status === 'IN_MAINTENANCE' ? '#F59E0B' : '#EF4444'
  }));
  
  const fuelData = (fuelChartRes?.data || []).map((item: any) => {
    const date = new Date(item.month + '-01');
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      cost: item.cost
    };
  }).reverse();

  // Format month from YYYY-MM to just short month name
  const tripsData = (tripsChartRes?.data || []).map((item: any) => {
    const date = new Date(item.month + '-01');
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      trips: item.trip_count
    };
  }).reverse(); // The backend might return desc, so we reverse to make it chronologically ascending for the chart

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Fleet management overview"
        icon={LayoutDashboard}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/trips">
              <PrimaryButton icon={<Route className="h-4 w-4" />} data-tour="quick-actions-create-trip">
                Create Trip
              </PrimaryButton>
            </Link>
            <Link to="/vehicles">
              <SecondaryButton icon={<Plus className="h-4 w-4" />}>
                Vehicle
              </SecondaryButton>
            </Link>
            <Link to="/vehicles">
              <SecondaryButton icon={<Wrench className="h-4 w-4" />}>
                Maintenance
              </SecondaryButton>
            </Link>
            <Link to="/drivers">
              <SecondaryButton icon={<Users className="h-4 w-4" />}>
                Driver
              </SecondaryButton>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton count={6} />}>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            id="tour-kpis" 
            className="flex flex-col gap-4 mb-6"
          >
            {/* Primary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={item} data-tour="kpi-active-vehicles">
                <StatCard label="Active Vehicles" value={overview.activeVehicles} change={overview.activeVehiclesChange} changeLabel="vs last month" icon={Bus} />
              </motion.div>
              <motion.div variants={item} data-tour="kpi-available">
                <StatCard label="Available" value={overview.availableVehicles} change={overview.availableVehiclesChange} changeLabel="vs last month" icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
              </motion.div>
              <motion.div variants={item} data-tour="kpi-maintenance">
                <StatCard label="In Maintenance" value={overview.vehiclesInMaintenance} change={overview.vehiclesInMaintenanceChange} changeLabel="vs last month" icon={Wrench} iconColor="text-amber-600" iconBg="bg-amber-50" />
              </motion.div>
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={item} data-tour="kpi-trips">
                <StatCard label="Trips Today" value={overview.completedTripsToday} change={overview.completedTripsTodayChange} changeLabel="vs yesterday" icon={Activity} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
              </motion.div>
              <motion.div variants={item} data-tour="kpi-drivers">
                <StatCard label="Drivers On Duty" value={overview.driversOnDuty} change={overview.driversOnDutyChange} changeLabel="vs last month" icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
              </motion.div>
              <motion.div variants={item} data-tour="kpi-utilization">
                <StatCard 
                  label={
                    <div className="flex items-center gap-1.5 cursor-help">
                      Fleet Utilization
                      <Tooltip content="Percentage of active vehicles available or on a trip." position="top">
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20 text-[9px] font-bold text-white/80 hover:text-white transition-colors">?</span>
                      </Tooltip>
                    </div>
                  } 
                  value={`${overview.fleetUtilization}%`} 
                  change={overview.fleetUtilizationChange} 
                  changeLabel="vs last month" 
                  icon={Gauge} 
                  iconColor="text-indigo-600" 
                  iconBg="bg-indigo-50" 
                />
              </motion.div>
            </div>
          </motion.div>
        </Suspense>
      </ErrorBoundary>

      {/* Charts Row */}
      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton count={2} />}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <ChartCard title="Monthly Trips" subtitle="Trip volume trend" className="lg:col-span-2" data-tour="chart-monthly-trips">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={tripsData}>
                  <defs>
                    <linearGradient id="gradTrips" x1="0" y1="0" x2="0" y2="1">
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
                  <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#141418',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '16px',
                      fontSize: '13px',
                      color: '#F5F5F7',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                    }}
                    itemStyle={{ color: '#F5F5F7' }}
                    formatter={(value: any) => [value, 'Trips']}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="trips" stroke="#F5F5F7" strokeWidth={2} fill="url(#gradTrips)" style={{ filter: 'url(#glow)' }} activeDot={{ r: 5, fill: '#F5F5F7', stroke: '#141418', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Vehicle Status" subtitle="Current distribution" data-tour="chart-vehicle-status">
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
                    {vehicleStatusData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
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
        </Suspense>
      </ErrorBoundary>

      {/* Fuel Cost Trend */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton rows={4} />}>
          <div className="mb-6">
            <ChartCard title="Fuel Cost Trend" subtitle="Monthly spending" className="w-full">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={fuelData} barSize={36}>
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8A8A93' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
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
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* Recent Activity */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton rows={5} />}>
          <GlassCard className="p-0 overflow-hidden mb-6" data-tour="recent-activity">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-glass bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Recent Activity</h3>
              <button className="group text-[11px] font-medium text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors uppercase tracking-wider">
                View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="divide-y divide-border-glass">
              {activities.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      {activity.description}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {getRelativeTime(activity.created_at)}
                    </p>
                  </div>
                  <PillBadge color={typeColors[activity.activity_type.toLowerCase() as keyof typeof typeColors] || 'neutral'}>
                    {activity.activity_type}
                  </PillBadge>
                </div>
              ))}
            </div>
          </GlassCard>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
