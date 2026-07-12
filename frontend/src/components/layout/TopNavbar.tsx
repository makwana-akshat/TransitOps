import React from 'react';
import { cn } from '@/utils/cn';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden sm:block max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vehicles, drivers, trips..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border-0 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card
                placeholder:text-muted-foreground transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <button className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2.5 ml-3 pl-3 border-l border-border">
            <Avatar name="Akshat Makwana" size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground leading-tight">Akshat Makwana</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
