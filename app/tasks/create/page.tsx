'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import Sidebar from '../../../components/Sidebar';
import TopBar from '../../../components/TopBar';
import Alert from '../../../components/Alert';

export default function CreateTask() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setAlert(null);

    try {
      await taskApi.createTask(user.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        completed,
      });
      setAlert({ type: 'success', message: 'Task created successfully!' });
      setTimeout(() => {
        router.push('/tasks/list');
      }, 1500);
    } catch (error) {
      setAlert({ type: 'error', message: error instanceof Error ? error.message : 'Failed to create task' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onSearchChange={() => {}} // Not used in create page
        />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
                <p className="mt-2 text-gray-600">Add a new task to your list</p>
              </div>

              {alert && (
                <div className="mb-6">
                  <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter task title"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter task description (optional)"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
                    Mark as completed
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
