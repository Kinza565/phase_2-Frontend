'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '../../lib/types';
import { taskApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatsCards from '../../components/StatsCards';
import Charts from '../../components/Charts';
import TaskTable from '../../components/TaskTable';
import Alert from '../../components/Alert';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
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
      const response = await taskApi.getTasks(user.id);
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
  }, [user]);

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

  const handleFilterChange = (newFilter: 'all' | 'completed' | 'pending') => {
    setFilter(newFilter);
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Filter tasks based on current filter and search query
  const filteredTasks = tasks.filter(task => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed);

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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

            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.email}!
              </h1>
              <p className="text-gray-600">
                Here's an overview of your tasks and productivity.
              </p>
            </div>

            {/* Stats Cards */}
            <StatsCards
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              pendingTasks={pendingTasks}
              onFilterChange={handleFilterChange}
            />

            {/* Charts */}
            <Charts tasks={tasks} />

            {/* Recent Tasks Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Tasks</h2>
                <button
                  onClick={() => router.push('/tasks/list')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Tasks →
                </button>
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

                {!error && (
                  <TaskTable
                    tasks={filteredTasks.slice(0, 5)} // Show only first 5 tasks
                    onEdit={handleTaskEdit}
                    onDelete={handleTaskDelete}
                    onToggleComplete={handleToggleComplete}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
