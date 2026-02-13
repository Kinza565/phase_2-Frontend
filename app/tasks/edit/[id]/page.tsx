'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Task } from '../../../../lib/types';
import { taskApi } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import Alert from '../../../../components/Alert';
import Sidebar from '../../../../components/Sidebar';
import TopBar from '../../../../components/TopBar';

export default function EditTask() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // All hooks must be called before any early returns
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handle case when params or id is null/undefined
  if (!params || !params.id) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(true)} onSearchChange={() => {}} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="text-center">
                <p className="text-red-600">Invalid task ID</p>
                <button
                  onClick={() => router.push('/tasks/list')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Tasks
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const taskId = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    const fetchTask = async () => {
      try {
        const response = await taskApi.getTask(user.id, taskId);
        const taskData = response.data;
        setTask(taskData);
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setCompleted(taskData.completed);
      } catch {
        setAlert({ type: 'error', message: 'Failed to load task' });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [user, taskId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !task) return;

    setSaving(true);
    setAlert(null);

    try {
      await taskApi.updateTask(user.id, taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        completed,
      });
      setAlert({ type: 'success', message: 'Task updated successfully!' });
      setTimeout(() => {
        router.push('/tasks/list');
      }, 1500);
    } catch (err) {
      setAlert({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update task' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(true)} onSearchChange={() => {}} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="text-center">
                <p className="text-red-600">Task not found</p>
                <button
                  onClick={() => router.push('/tasks/list')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Tasks
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onSearchChange={() => {}} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
                <p className="mt-2 text-gray-600">Update your task details</p>
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
                    disabled={saving}
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
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={saving}
                  />
                  <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
                    Mark as completed
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={saving || !title.trim()}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Updating...' : 'Update Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={saving}
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
