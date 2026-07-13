import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Bus,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  ChevronLeft,
  Zap,
  PanelLeftClose
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isDockMode: boolean;
  onDockToggle: () => void;
}

export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: Bus },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isOpen, onToggle, isDockMode, onDockToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        id="tour-sidebar"
        className={cn(
          'fixed z-50 flex flex-col transition-all duration-300',
          'w-64 top-4 bottom-4 left-4 rounded-2xl bg-bg-card border border-border-glass shadow-glass overflow-hidden',
          isDockMode 
            ? '-translate-x-[120%]' 
            : isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-glass-inset mix-blend-overlay opacity-50" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-border-glass/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white text-black rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-text-primary tracking-tight">TransitOps</h1>
                <p className="text-[10px] font-medium text-text-faint uppercase tracking-widest">Enterprise Suite</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted lg:hidden transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                id={item.to === '/vehicles' ? 'tour-nav-vehicles' : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-border-glass/50 flex flex-col gap-3">
             <button
               onClick={onDockToggle}
               className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors rounded-xl"
             >
               <PanelLeftClose className="h-4 w-4" />
               <span>Collapse to Dock</span>
             </button>
             <div className="flex items-center gap-3 p-2 bg-bg-elevated border border-border-glass rounded-xl shadow-glass">
                <Avatar name="Akshat Makwana" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">Akshat Makwana</p>
                  <p className="text-xs text-text-faint truncate">Fleet Administrator</p>
                </div>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
}
