import React from 'react';
import { useAppAuth } from '../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';

const Profile = () => {
  const { dbUser, role } = useAppAuth();

  if (!dbUser) return <div>Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start border-b">
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-muted flex-shrink-0">
            {dbUser.avatar_url ? (
              <img src={dbUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-4xl text-primary font-bold">
                {dbUser.first_name?.[0] || 'U'}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-semibold">{dbUser.full_name || `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim()}</h2>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
              {role || 'No Role Assigned'}
            </div>
            <p className="text-muted-foreground">{dbUser.email}</p>
            <div className="pt-2">
              <UserButton />
              <span className="text-sm text-muted-foreground ml-3">Manage Account in Clerk</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Department</p>
            <p className="text-base">{dbUser.department || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Employee Code</p>
            <p className="text-base font-mono">{dbUser.employee_code || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
            <p className="text-base">{dbUser.phone || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-base capitalize">{dbUser.status || 'Active'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Account Created</p>
            <p className="text-base">{new Date(dbUser.created_at).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Last Login</p>
            <p className="text-base">{dbUser.last_login ? new Date(dbUser.last_login).toLocaleString() : 'Never'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
