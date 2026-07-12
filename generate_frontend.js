const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, 'frontend', 'src', 'layouts');
const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
const libDir = path.join(__dirname, 'frontend', 'src', 'lib');

if (!fs.existsSync(layoutsDir)) fs.mkdirSync(layoutsDir, { recursive: true });
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });
if (!fs.existsSync(path.join(libDir, 'validations'))) fs.mkdirSync(path.join(libDir, 'validations'), { recursive: true });

// 1. Generate Layouts
const roles = ['Driver', 'FleetManager', 'Analyst', 'SafetyOfficer'];
roles.forEach(role => {
  const template = `import React from 'react';
import { Outlet } from 'react-router-dom';

const ${role}Layout = () => {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="w-64 border-r bg-background hidden sm:block">
        <div className="p-4 border-b font-bold">${role} Console</div>
        <nav className="p-4 space-y-2">
          {/* Role specific navigation will go here */}
          <div>Placeholder Sidebar</div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-background flex items-center px-4">
          <h1 className="font-semibold">${role} Dashboard</h1>
        </header>
        <main className="p-4 sm:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ${role}Layout;
`;
  fs.writeFileSync(path.join(layoutsDir, `${role}Layout.jsx`), template);
});

// 2. Generate Pages
const pages = [
  'VehicleDetails', 'DriverDetails', 'TripDetails', 
  'Analytics', 'Notifications', 'Settings', 'Profile', 
  'NotFound', 'Unauthorized'
];

pages.forEach(page => {
  const template = `import React from 'react';

const ${page} = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">${page}</h1>
      <div className="p-6 border rounded shadow-sm bg-card">
        <p>This is the placeholder for the ${page} page.</p>
      </div>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(pagesDir, `${page}.jsx`), template);
});

// 3. Generate Components
const components = [
  'DataTable', 'SearchBar', 'FilterPanel', 'StatusBadge', 
  'MetricCard', 'DashboardCard', 'SkeletonLoader', 'EmptyState', 
  'ErrorState', 'Pagination', 'FormWrapper', 'DatePicker', 
  'SelectField', 'InputField', 'RoleGuard', 'PermissionGuard', 
  'ConfirmationDialog', 'DeleteDialog', 'ToastNotifications'
];

components.forEach(comp => {
  const template = `import React from 'react';

export const ${comp} = (props) => {
  return (
    <div className="p-2 border border-dashed rounded text-sm text-muted-foreground">
      ${comp} Component Placeholder
    </div>
  );
};
`;
  fs.writeFileSync(path.join(componentsDir, `${comp}.jsx`), template);
});

// 4. Generate Validations
const validations = ['Vehicle', 'Driver', 'Trip', 'Maintenance', 'Fuel', 'Expense', 'User', 'Role'];
validations.forEach(v => {
  const template = `import { z } from 'zod';

export const ${v}Schema = z.object({
  id: z.string().uuid().optional(),
  // Add specific fields based on PRD
});
`;
  fs.writeFileSync(path.join(libDir, 'validations', `${v.toLowerCase()}Schema.js`), template);
});

console.log('Frontend layouts, pages, components, and validations generated successfully.');
