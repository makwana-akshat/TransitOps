import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  Filter,
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { CircleIconButton } from '@/components/ui/Button';
import { useTour, TOURS } from '@/contexts/TourContext';
import SearchComponent from '@/components/ui/animated-glowing-search-bar';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user } = useUser();
  const { startTour } = useTour();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Chris Tompson requested review on PR #42: Feature implementation.', time: '15 minutes ago', unread: true },
    { id: 2, text: 'Emma Davis shared New component library.', time: '45 minutes ago', unread: true },
    { id: 3, text: 'James Wilson assigned you to API integration task.', time: '4 hours ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-20 flex items-center bg-transparent px-6 lg:px-8">
      <div className="flex items-center justify-between w-full">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl bg-bg-card border border-border-glass text-text-primary lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div id="tour-search" className="hidden sm:flex max-w-md w-full items-center">
            <SearchComponent />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <div className="relative">
                <CircleIconButton 
                  icon={<Bell className="h-[18px] w-[18px]" />} 
                  onClick={() => setShowNotifications(!showNotifications)}
                />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black border-2 border-bg pointer-events-none">
                  2
                </span>
              </div>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-[340px] bg-[#0a0a0d] border border-border-glass shadow-2xl rounded-xl z-50 overflow-hidden animate-scale-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-glass/50">
                    <h3 className="font-semibold text-sm text-text-primary">Notifications</h3>
                    <button className="text-xs text-text-primary hover:text-white transition-colors font-medium">Mark all as read</button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className="relative flex flex-col p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group bg-bg-elevated/30">
                        <p className="text-sm text-text-primary pr-4 leading-tight mb-1.5">
                          {n.text.split(/(Chris Tompson|Emma Davis|James Wilson)/).map((part, i) => 
                            (part === 'Chris Tompson' || part === 'Emma Davis' || part === 'James Wilson') ? 
                            <span key={i} className="font-semibold text-white">{part}</span> : part
                          )}
                        </p>
                        <span className="text-xs text-text-muted">{n.time}</span>
                        {n.unread && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Help Dropdown */}
            <div className="relative" ref={helpRef}>
              <CircleIconButton 
                id="tour-help" 
                icon={<HelpCircle className="h-[18px] w-[18px]" />} 
                onClick={() => setShowHelp(!showHelp)}
              />

              {showHelp && (
                <div className="absolute right-0 top-12 w-64 bg-[#0a0a0d] border border-border-glass shadow-2xl rounded-xl z-50 overflow-hidden animate-scale-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-glass/50">
                    <h3 className="font-semibold text-sm text-text-primary">Guided Tours</h3>
                  </div>
                  <div className="p-2 space-y-1">
                    {Object.values(TOURS).map(tour => (
                      <div key={tour.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                        <span className="text-sm text-text-primary font-medium">{tour.name}</span>
                        <button 
                          onClick={() => {
                            setShowHelp(false);
                            startTour(tour.id);
                          }}
                          className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 ml-1 pl-4 border-l border-border-glass">
            <div className="flex items-center gap-2 bg-bg-elevated border border-border-glass rounded-full py-1.5 pl-1.5 pr-4">
              <UserButton afterSignOutUrl="/" />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-text-primary leading-tight">
                  {user?.fullName || 'Admin User'}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
