# Frontend - Next.js Application

## Overview
Next.js 16+ frontend application with TypeScript and Tailwind CSS for the Todo app.

## Technology Stack
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React hooks + Context API
- **API Client**: Custom hooks with SWR
- **Authentication**: Better Auth client

## Project Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (if needed)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── tasks/            # Task-related components
│   └── auth/             # Authentication components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useTasks.ts       # Task management hook
│   └── useApi.ts         # Generic API hook
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # General utilities
├── styles/                # Global styles
│   ├── globals.css       # Global CSS
│   └── tailwind.config.js # Tailwind configuration
└── types/                 # TypeScript definitions
    ├── api.ts            # API response types
    ├── auth.ts           # Authentication types
    └── index.ts          # Main type exports
```

## Key Patterns

### API Integration
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
  get: (endpoint: string, token?: string) => fetch(`${API_BASE}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  post: (endpoint: string, data: any, token?: string) => fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  }),
  // ... other methods
};
```

### Custom Hooks
```typescript
// hooks/useTasks.ts
import useSWR from 'swr';
import { apiClient } from '@/lib/api';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const { user, token } = useAuth();

  const { data, error, mutate } = useSWR(
    user ? `/api/${user.id}/tasks` : null,
    (url) => apiClient.get(url, token).then(res => res.json())
  );

  return {
    tasks: data,
    isLoading: !error && !data,
    error,
    mutate
  };
};
```

### Authentication Context
```typescript
// hooks/useAuth.ts
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Authentication logic here

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Component Structure
```typescript
// components/tasks/TaskItem.tsx
interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center space-x-3 p-4 border rounded-lg">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onUpdate({ ...task, completed: !task.completed })}
        className="rounded"
      />
      {/* Task content */}
    </div>
  );
};
```

## Styling Guidelines

### Tailwind Classes
- Use utility-first approach
- Consistent spacing scale (space-x-2, space-y-4, etc.)
- Responsive design with sm:, md:, lg: prefixes
- Dark mode support (dark: prefix)

### Component Variants
```typescript
// Button component with variants
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const baseClasses = 'rounded-md font-medium focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};
```

## Performance Optimization

### Code Splitting
```typescript
// app/(dashboard)/tasks/page.tsx
import dynamic from 'next/dynamic';

const TaskForm = dynamic(() => import('@/components/tasks/TaskForm'), {
  loading: () => <div>Loading...</div>
});
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/task-icon.png"
  alt="Task icon"
  width={24}
  height={24}
  priority
/>
```

### Memoization
```typescript
import { memo } from 'react';

const TaskList = memo(({ tasks, onUpdate }: TaskListProps) => {
  // Component logic
});
```

## Error Handling

### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// hooks/useApi.ts
export const useApi = (url: string) => {
  const { data, error } = useSWR(url, fetcher);

  useEffect(() => {
    if (error) {
      if (error.status === 401) {
        // Redirect to login
        router.push('/login');
      } else {
        // Show error toast
        toast.error('An error occurred');
      }
    }
  }, [error]);

  return { data, error, loading: !data && !error };
};
```

## Testing

### Component Testing
```typescript
// __tests__/TaskItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '@/components/tasks/TaskItem';

const mockTask = {
  id: '1',
  title: 'Test task',
  completed: false,
  created_at: new Date(),
  updated_at: new Date(),
  user_id: '1'
};

test('renders task item', () => {
  render(<TaskItem task={mockTask} onUpdate={jest.fn()} onDelete={jest.fn()} />);
  expect(screen.getByText('Test task')).toBeInTheDocument();
});
```

## Deployment

### Build Configuration
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
};
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Common Issues

### Authentication
- Ensure Better Auth is properly configured
- Check JWT token expiration
- Verify API endpoints include Authorization headers

### API Calls
- Handle loading and error states
- Implement retry logic for failed requests
- Use proper TypeScript types for API responses

### Styling
- Check Tailwind configuration
- Ensure responsive breakpoints are working
- Verify dark mode implementation

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
