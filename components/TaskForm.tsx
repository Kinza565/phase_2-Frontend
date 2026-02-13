import { useState } from 'react';
import { TaskCreate } from '../lib/types';
import { useSession } from '../lib/auth';

interface TaskFormProps {
  onTaskAdded: () => void;
}

export default function TaskForm({ onTaskAdded }: TaskFormProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const taskData: TaskCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error('Failed to create task');

      setTitle('');
      setDescription('');
      onTaskAdded();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task title"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task description (optional)"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding Task...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
