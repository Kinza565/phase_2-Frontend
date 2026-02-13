'use client';

import { CheckCircle, Clock, List, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick?: () => void;
}

function StatsCard({ title, value, icon: Icon, color, onClick }: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md cursor-pointer
        ${onClick ? 'hover:border-blue-300' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  onFilterChange: (filter: 'all' | 'completed' | 'pending') => void;
}

export default function StatsCards({
  totalTasks,
  completedTasks,
  pendingTasks,
  onFilterChange
}: StatsCardsProps) {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Tasks"
        value={totalTasks}
        icon={List}
        color="bg-blue-500"
        onClick={() => onFilterChange('all')}
      />
      <StatsCard
        title="Completed"
        value={completedTasks}
        icon={CheckCircle}
        color="bg-green-500"
        onClick={() => onFilterChange('completed')}
      />
      <StatsCard
        title="Pending"
        value={pendingTasks}
        icon={Clock}
        color="bg-yellow-500"
        onClick={() => onFilterChange('pending')}
      />
      <StatsCard
        title="Completion Rate"
        value={completionRate}
        icon={TrendingUp}
        color="bg-purple-500"
      />
    </div>
  );
}
