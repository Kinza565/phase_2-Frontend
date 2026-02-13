'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '../../../lib/types';
import { taskApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import Sidebar from '../../../components/Sidebar';
import TopBar from '../../../components/TopBar';
import TaskTable from '../../../components/TaskTable';
import Alert from '../../../components/Alert';

export default function CompletedTasks() {
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'title' | 'created_at'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }
  }, [user, authLoading, router]);

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await taskApi.getTasks(user.id, { status: 'completed', sort, order });
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, sort, order]);

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!user) return;
    try {
      await taskApi.deleteTask(user.id, taskId);
      fetchTasks();
      setAlert({ type: 'success', message: 'Task deleted successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete task' });
    }
  };

  const handleTaskEdit = (taskId: string) => {
    router.push(`/tasks/edit/${taskId}`);
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    if (!user) return;
    try {
      await taskApi.toggleComplete(user.id, taskId, completed);
      fetchTasks();
      setAlert({ type: 'success', message: 'Task status updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update task status' });
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading completed tasks...</p>
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

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Completed Tasks</h1>
              <button
                onClick={() => router.push('/tasks/create')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Create New Task
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                You have {tasks.length} completed task{tasks.length !== 1 ? 's' : ''}.
              </p>
            </div>

            {/* Sorting */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as 'title' | 'created_at')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="created_at">Created Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Task Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchTasks}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!error && filteredTasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No completed tasks found.</p>
                  <button
                    onClick={() => router.push('/tasks/list')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View All Tasks
                  </button>
                </div>
              )}

              {!error && filteredTasks.length > 0 && (
                <TaskTable
                  tasks={filteredTasks}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                  onToggleComplete={handleToggleComplete}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
