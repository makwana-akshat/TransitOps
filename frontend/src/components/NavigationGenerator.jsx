import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Truck, Map, Wrench, FileText, Settings, Shield, Fuel, DollarSign, BarChart } from 'lucide-react';
import { cn } from '../lib/utils';

const ROLE_NAVIGATION = {
  'Admin': [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Shield },
    { name: 'Vehicles', path: '/admin/vehicles', icon: Truck },
    { name: 'Drivers', path: '/admin/drivers', icon: Users },
    { name: 'Trips', path: '/admin/trips', icon: Map },
    { name: 'Maintenance', path: '/admin/maintenance', icon: Wrench },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  'Fleet Manager': [
    { name: 'Dashboard', path: '/fleet-manager', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/fleet-manager/vehicles', icon: Truck },
    { name: 'Drivers', path: '/fleet-manager/drivers', icon: Users },
    { name: 'Trips', path: '/fleet-manager/trips', icon: Map },
    { name: 'Maintenance', path: '/fleet-manager/maintenance', icon: Wrench },
  ],
  'Driver': [
    { name: 'Dashboard', path: '/driver', icon: LayoutDashboard },
    { name: 'My Trips', path: '/driver/trips', icon: Map },
    { name: 'Fuel Logs', path: '/driver/fuel', icon: Fuel },
    { name: 'Profile', path: '/driver/profile', icon: Users },
  ],
  'Safety Officer': [
    { name: 'Dashboard', path: '/safety', icon: LayoutDashboard },
    { name: 'Drivers', path: '/safety/drivers', icon: Users },
    { name: 'Compliance', path: '/safety/compliance', icon: Shield },
    { name: 'License Expiry', path: '/safety/licenses', icon: FileText },
  ],
  'Financial Analyst': [
    { name: 'Dashboard', path: '/analyst', icon: LayoutDashboard },
    { name: 'Expenses', path: '/analyst/expenses', icon: DollarSign },
    { name: 'Reports', path: '/analyst/reports', icon: FileText },
    { name: 'Analytics', path: '/analyst/analytics', icon: BarChart },
  ]
};

export const NavigationGenerator = () => {
  const { role } = useAppAuth();
  const location = useLocation();
  const navItems = ROLE_NAVIGATION[role] || [];

  if (!role) return null;

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              isActive 
                ? "bg-muted text-primary" 
                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};
