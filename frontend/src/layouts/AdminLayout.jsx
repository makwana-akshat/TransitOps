import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { Truck } from 'lucide-react';
import { NavigationGenerator } from '../components/NavigationGenerator';
import { useAppAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, authLoading } = useAppAuth();

  if (!isLoaded || authLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading workspace...</div>;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (role !== 'Admin') return <Navigate to="/unauthorized" replace />;

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-xl">
            <Truck className="h-6 w-6 text-primary" />
            <span>TransitOps</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <NavigationGenerator />
        </div>
        <div className="p-4 border-t text-xs text-muted-foreground text-center">
          Admin Console
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 shadow-sm sm:shadow-none">
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl hidden sm:block">Dashboard</h1>
          </div>
          <UserButton afterSignOutUrl="/login" />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
