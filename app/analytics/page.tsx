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

export default function Analytics() {
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
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
  
  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
                Analytics
              </h1>
              <p className="text-gray-600">
                Track your productivity and task completion metrics.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchTasks}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <StatsCards
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              pendingTasks={pendingTasks}
              onFilterChange={handleFilterChange}
            />

            {/* Completion Rate */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Completion Rate</h2>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-green-500"
                      strokeDasharray={`${completionRate}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-bold text-gray-900">{completionRate}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-4">
                {completedTasks} out of {totalTasks} tasks completed
              </p>
            </div>

            {/* Charts */}
            <Charts tasks={tasks} />

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Task Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Tasks</span>
                    <span className="font-semibold text-gray-900">{totalTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">{pendingTasks}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Productivity Tips</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">Break large tasks into smaller ones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">Set realistic deadlines</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">Review your tasks daily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">Celebrate completed tasks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
