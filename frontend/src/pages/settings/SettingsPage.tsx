import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryButton } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Settings, User, Bell, Shield, Save, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/utils/cn';

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
  const { register, handleSubmit } = useForm<ProfileFormData>({
    defaultValues: {
      name: 'Akshat Makwana',
      email: 'akshat@transitops.com',
      phone: '+1 (555) 123-4567',
      department: 'Fleet Operations',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    alert('Profile saved successfully!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name="Akshat Makwana" size="lg" />
          <button
            type="button"
            className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-3 w-3" />
          </button>
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
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
          <input
            {...register('phone')}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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

      <PrimaryButton type="submit" icon={<Save className="h-4 w-4" />}>
        Save Changes
      </PrimaryButton>
    </form>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'trip_updates', label: 'Trip Updates', description: 'Get notified when trips are dispatched, completed, or cancelled', enabled: true },
    { id: 'maintenance_alerts', label: 'Maintenance Alerts', description: 'Receive alerts for overdue maintenance and upcoming services', enabled: true },
    { id: 'driver_compliance', label: 'Driver Compliance', description: 'Alerts for expiring licenses and compliance issues', enabled: true },
    { id: 'fuel_reports', label: 'Fuel Reports', description: 'Weekly fuel consumption and cost reports', enabled: false },
    { id: 'system_updates', label: 'System Updates', description: 'Platform updates, new features, and maintenance windows', enabled: false },
    { id: 'email_digest', label: 'Email Digest', description: 'Daily summary of fleet activity delivered to your inbox', enabled: true },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
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
            onClick={() => toggleSetting(setting.id)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              setting.enabled ? 'bg-primary' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                setting.enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  const { register, handleSubmit } = useForm();

  const onSubmit = () => {
    alert('Password updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-bg-card border border-border-glass shadow-glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Change Password</h3>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Current Password</label>
          <input
            {...register('currentPassword')}
            type="password"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">New Password</label>
          <input
            {...register('newPassword')}
            type="password"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm New Password</label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="bg-bg-card border border-border-glass shadow-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Two-Factor Authentication</h3>
        <p className="text-xs text-text-muted mb-3">Add an extra layer of security to your account.</p>
        <PrimaryButton type="button" size="sm">Enable 2FA</PrimaryButton>
      </div>

      <PrimaryButton type="submit" icon={<Save className="h-4 w-4" />}>
        Update Password
      </PrimaryButton>
    </form>
  );
}
