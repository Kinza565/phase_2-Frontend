'use client';

import { useState } from 'react';
import { Task } from '../lib/types';
import { taskApi } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import Modal from './Modal';
import Alert from './Alert';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
  onEdit: (taskId: string) => void;
}

export default function TaskCard({ task, onUpdate, onDelete, onEdit }: TaskCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggleComplete = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await taskApi.toggleComplete(user.id, task.id, !task.completed);
      onUpdate();
      setAlert({ type: 'success', message: 'Task status updated!' });
    } catch {
      setAlert({ type: 'error', message: 'Failed to update task status.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await taskApi.deleteTask(user.id, task.id);
      onDelete();
      setAlert({ type: 'success', message: 'Task deleted successfully!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to delete task.' });
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-2 text-gray-600 ${task.completed ? 'line-through' : ''}`}>
                {task.description}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Created: {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleToggleComplete}
              disabled={isLoading}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                task.completed
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isLoading ? '...' : task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button
              onClick={() => onEdit(task.id)}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
        actions={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
