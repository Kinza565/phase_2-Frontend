'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface ChartsProps {
  tasks: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function Charts({ tasks }: ChartsProps) {
  // Prepare data for completion status pie chart
  const completionData = [
    { name: 'Completed', value: tasks.filter(t => t.completed).length, color: '#10B981' },
    { name: 'Pending', value: tasks.filter(t => !t.completed).length, color: '#F59E0B' }
  ];

  // Prepare data for tasks created over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const timelineData = last7Days.map(date => {
    const dayTasks = tasks.filter(task =>
      task.created_at.startsWith(date)
    );
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tasks: dayTasks.length,
      completed: dayTasks.filter(t => t.completed).length
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Completion Status Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={completionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {completionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tasks Over Time Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks Created (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Total Tasks"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              strokeWidth={2}
              name="Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Task Status Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
