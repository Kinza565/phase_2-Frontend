'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import Alert from '../../components/Alert';

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsSaving(true);
    try {
      // Simulate API call - in real app would call update profile API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (!confirmDelete) return;

    try {
      // Simulate API call - in real app would call delete account API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, would logout and delete account
      setAlert({ type: 'success', message: 'Account deletion initiated. You will be logged out.' });
      
      // Redirect to signin after a delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete account. Please try again.' });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onSearchChange={handleSearchChange}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences.
              </p>
            </div>

            {/* Alert */}
            {alert && (
              <div className="mb-6">
                <Alert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                />
              </div>
            )}

            {/* Profile Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleSaveProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={user.id}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email notifications for task updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Task Reminders</h3>
                    <p className="text-sm text-gray-500">Get reminders for pending tasks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Weekly Summary</h3>
                    <p className="text-sm text-gray-500">Receive weekly task summary emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h2 className="text-xl font-bold text-red-600 mb-6">Danger Zone</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* App Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Todo Dashboard v1.0.0</p>
              <p className="mt-1">Made with ❤️ for productivity</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
