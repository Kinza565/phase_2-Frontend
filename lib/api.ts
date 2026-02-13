import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Task API functions - match spec: /api/{user_id}/tasks
export const taskApi = {
  getTasks: (
    userId: string,
    params?: { status?: string; sort?: string; order?: string; skip?: number; limit?: number },
  ) => api.get(`/api/${userId}/tasks`, { params }),

  createTask: (userId: string, data: { title: string; description?: string; completed?: boolean }) =>
    api.post(`/api/${userId}/tasks`, data),

  getTask: (userId: string, taskId: string) =>
    api.get(`/api/${userId}/tasks/${taskId}`),

  updateTask: (
    userId: string,
    taskId: string,
    data: { title?: string; description?: string; completed?: boolean },
  ) => api.put(`/api/${userId}/tasks/${taskId}`, data),

  deleteTask: (userId: string, taskId: string) =>
    api.delete(`/api/${userId}/tasks/${taskId}`),

  toggleComplete: (userId: string, taskId: string, completed: boolean = true) =>
    api.patch(`/api/${userId}/tasks/${taskId}/complete`, { completed }),

  markTaskComplete: (userId: string, taskId: string) =>
    api.patch(`/api/${userId}/tasks/${taskId}/complete`, { completed: true }),
};

// Auth API functions
export const authApi = {
  signin: (data: { email: string; password: string }) =>
    api.post('/api/auth/signin', data),

  signup: (data: { email: string; password: string }) =>
    api.post('/api/auth/signup', data),

  signout: () =>
    api.post('/api/auth/signout'),

  session: () =>
    api.get('/api/auth/session'),

  signInEmail: (data: { email: string; password: string }) =>
    api.post('/api/auth/sign-in/email', data),

  signUpEmail: (data: { email: string; password: string }) =>
    api.post('/api/auth/sign-up/email', data),
};
