import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryButton } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Settings, User, Bell, Shield, Save, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { useUser } from '@clerk/clerk-react';
import { updateMe } from '@/api/users';

type Tab = 'profile' | 'notifications' | 'security';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
}

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        icon={Settings}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      phone: user?.primaryPhoneNumber?.phoneNumber || '',
      department: (user?.unsafeMetadata?.department as string) || 'Fleet Operations',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    try {
      const parts = data.name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      
      // Update in Clerk
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          department: data.department
        }
      });

      // Update in backend to keep sync
      await updateMe({ full_name: data.name });
      alert('Profile saved successfully!');
    } catch (e: any) {
      alert(`Error saving profile: ${e.errors?.[0]?.longMessage || e.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      try {
        await user.setProfileImage({ file });
      } catch (err: any) {
        alert(`Failed to upload image: ${err.errors?.[0]?.longMessage || err.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {isUploading ? (
            <div className="h-16 w-16 rounded-full bg-border flex items-center justify-center animate-pulse">
              <span className="text-xs text-text-muted">...</span>
            </div>
          ) : (
            <Avatar name={user?.fullName || 'User'} size="lg" src={user?.imageUrl} />
          )}
          <label className="absolute -bottom-1 -right-1 p-2 bg-bg-elevated border border-border-glass text-text-muted hover:text-text-primary hover:bg-white/5 rounded-full shadow-glass transition-colors cursor-pointer">
            <Camera className="h-3.5 w-3.5" />
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Profile Photo</p>
          <p className="text-xs text-text-muted">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
          <input
            {...register('name')}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            readOnly
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-black/20 text-text-muted cursor-not-allowed"
          />
          <p className="text-[10px] text-text-muted mt-1">Manage email via Clerk portal</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
          <input
            {...register('phone')}
            readOnly
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-black/20 text-text-muted cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Department</label>
          <input
            {...register('department')}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <PrimaryButton type="submit" disabled={isSubmitting} icon={<Save className="h-4 w-4" />}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </PrimaryButton>
    </form>
  );
}

function NotificationsTab() {
  const { user } = useUser();
  
  const defaultSettings = [
    { id: 'trip_updates', label: 'Trip Updates', description: 'Get notified when trips are dispatched, completed, or cancelled', enabled: true },
    { id: 'maintenance_alerts', label: 'Maintenance Alerts', description: 'Receive alerts for overdue maintenance and upcoming services', enabled: true },
    { id: 'driver_compliance', label: 'Driver Compliance', description: 'Alerts for expiring licenses and compliance issues', enabled: true },
    { id: 'fuel_reports', label: 'Fuel Reports', description: 'Weekly fuel consumption and cost reports', enabled: false },
    { id: 'system_updates', label: 'System Updates', description: 'Platform updates, new features, and maintenance windows', enabled: false },
    { id: 'email_digest', label: 'Email Digest', description: 'Daily summary of fleet activity delivered to your inbox', enabled: true },
  ];

  const [settings, setSettings] = useState<NotificationSetting[]>(() => {
    const saved = user?.unsafeMetadata?.notifications as Record<string, boolean>;
    if (saved) {
      return defaultSettings.map(s => ({ ...s, enabled: saved[s.id] ?? s.enabled }));
    }
    return defaultSettings;
  });

  const toggleSetting = async (id: string) => {
    const updated = settings.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSettings(updated);
    
    if (user) {
      try {
        const prefs = updated.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.enabled }), {});
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            notifications: prefs
          }
        });
      } catch (err) {
        // Revert on error
        setSettings(settings);
        alert('Failed to update preference');
      }
    }
  };

  return (
    <div className="space-y-4">
      {settings.map((setting) => (
        <div key={setting.id} className="flex items-center justify-between p-4 bg-bg-card border border-border-glass shadow-glass rounded-xl">
          <div>
            <p className="text-sm font-medium text-text-primary">{setting.label}</p>
            <p className="text-xs text-text-muted mt-0.5">{setting.description}</p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting(setting.id)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors border',
              setting.enabled ? 'bg-accent-green border-accent-green/20' : 'bg-black/40 border-border-glass'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-200 ease-in-out',
                setting.enabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-text-muted'
              )}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  const { user } = useUser();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    if (!user) return;
    if (data.newPassword !== data.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await user.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      alert('Password updated successfully!');
      reset();
    } catch (e: any) {
      alert(`Failed to update password: ${e.errors?.[0]?.longMessage || e.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-bg-card border border-border-glass shadow-glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Change Password</h3>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Current Password</label>
          <input
            {...register('currentPassword', { required: true })}
            type="password"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">New Password</label>
          <input
            {...register('newPassword', { required: true })}
            type="password"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm New Password</label>
          <input
            {...register('confirmPassword', { required: true })}
            type="password"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="••••••••"
          />
        </div>
      </div>

      <PrimaryButton type="submit" disabled={isSubmitting} icon={<Save className="h-4 w-4" />}>
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </PrimaryButton>
    </form>
  );
}
