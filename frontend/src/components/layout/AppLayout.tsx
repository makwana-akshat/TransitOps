import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Sidebar, navItems } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { AppBackground } from './AppBackground';
import TargetCursor from '@/components/ui/TargetCursor';
import { TourProvider } from '@/contexts/TourContext';
import { FloatingNavigationDock } from '@/components/ui/FloatingDock';
import { AnimatePresence } from 'motion/react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDockMode, setIsDockMode] = useState(() => {
    return localStorage.getItem('transitops-layout-mode') === 'dock';
  });

  const toggleDockMode = (mode: boolean) => {
    setIsDockMode(mode);
    localStorage.setItem('transitops-layout-mode', mode ? 'dock' : 'sidebar');
  };

  return (
    <TourProvider>
      <TargetCursor 
        targetSelector="a, button, [role='button'], input, .cursor-target" 
        cursorColorOnTarget="#10b981" 
      />
      <SignedIn>
        <AppBackground>
          <div className="flex w-full">
            <Sidebar 
              isOpen={sidebarOpen} 
              onToggle={() => setSidebarOpen(false)} 
              isDockMode={isDockMode}
              onDockToggle={() => toggleDockMode(true)}
            />
            <div 
              className={cn(
                "flex-1 flex flex-col min-h-screen w-full relative z-10 transition-all duration-300",
                isDockMode ? "lg:ml-20" : "lg:ml-72"
              )}
            >
              <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
              <main className="flex-1 p-6 lg:p-8">
                <Outlet />
              </main>
            </div>
            
            <AnimatePresence>
              {isDockMode && (
                <FloatingNavigationDock 
                  navItems={navItems} 
                  onExpand={() => toggleDockMode(false)} 
                />
              )}
            </AnimatePresence>
          </div>
        </AppBackground>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </TourProvider>
  );
}
