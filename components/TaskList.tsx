import { useState } from 'react';
import { Task, TaskUpdate } from '../lib/types';
import { useSession } from '../lib/auth';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export default function TaskList({ tasks, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const { data: session } = useSession();
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveEdit = async (taskId: string) => {
    setLoading(taskId);
    try {
      const updateData: TaskUpdate = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.session?.token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update task');

      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    setLoading(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to toggle task completion');

      onTaskUpdated();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setLoading(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      onTaskDeleted();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks yet. Add your first task above!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} className="p-4 border rounded-lg bg-white shadow">
          {editingTask === task.id ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSaveEdit(task.id)}
                  disabled={loading === task.id || !editTitle.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading === task.id ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`mt-1 text-gray-600 ${task.completed ? 'line-through' : ''}`}>
                      {task.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    disabled={loading === task.id}
                    className={`px-3 py-1 rounded-md text-sm ${
                      task.completed
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  >
                    {loading === task.id ? '...' : task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => handleEdit(task)}
                    disabled={loading === task.id}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={loading === task.id}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
