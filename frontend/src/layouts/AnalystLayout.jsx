import React from 'react';
import { Outlet } from 'react-router-dom';

const AnalystLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="w-64 border-r bg-background hidden sm:block">
        <div className="p-4 border-b font-bold">Analyst Console</div>
        <nav className="p-4 space-y-2">
          {/* Role specific navigation will go here */}
          <div>Placeholder Sidebar</div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-background flex items-center px-4">
          <h1 className="font-semibold">Analyst Dashboard</h1>
        </header>
        <main className="p-4 sm:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AnalystLayout;
