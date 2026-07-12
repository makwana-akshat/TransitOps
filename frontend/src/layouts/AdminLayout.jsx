import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  DollarSign, 
  BarChart, 
  Shield 
} from 'lucide-react';

const AdminLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isSignedIn) return <Navigate to="/login" replace />;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'Vehicles', path: '/vehicles', icon: <Truck className="h-4 w-4" /> },
    { name: 'Drivers', path: '/drivers', icon: <Users className="h-4 w-4" /> },
    { name: 'Trips', path: '/trips', icon: <Map className="h-4 w-4" /> },
    { name: 'Maintenance', path: '/maintenance', icon: <Wrench className="h-4 w-4" /> },
    { name: 'Fuel', path: '/fuel', icon: <Fuel className="h-4 w-4" /> },
    { name: 'Expenses', path: '/expenses', icon: <DollarSign className="h-4 w-4" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart className="h-4 w-4" /> },
    { name: 'Users', path: '/users', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Truck className="h-6 w-6 text-primary" />
            <span className="">TransitOps</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl hidden sm:block">Admin Console</h1>
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
