import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-background">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

          <div className="lg:ml-64 min-h-screen flex flex-col">
            <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 lg:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
