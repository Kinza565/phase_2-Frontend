export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  completed: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}
