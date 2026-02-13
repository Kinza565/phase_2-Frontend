import { authApi } from './api';
import Cookies from 'js-cookie';

// Custom auth implementation to replace better-auth
// This provides a similar interface but uses our API endpoints

export const useSession = () => {
  // Note: This is a simplified version. For proper session management,
  // use the useAuth() hook from auth-context.tsx which provides
  // client-side state management.
  const token = Cookies.get('token');
  return {
    data: token ? { user: null, session: { id: token, token: token } } : null,
    isLoading: false,
    isPending: false,
    isAuthenticated: !!token,
  };
};

// Email sign in method (better-auth compatible)
export const signIn = {
  email: async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await authApi.signin({ email, password });
      
      if (response.data.user && response.data.access_token) {
        Cookies.set('token', response.data.access_token, { expires: 7 }); // Expires in 7 days
        return {
          data: response.data,
          error: null,
        };
      } else {
        return {
          data: null,
          error: { message: 'No user data received' },
        };
      }
    } catch (error) {
      return {
        data: null,
        error: { message: 'Invalid email or password' },
      };
    }
  },
};

// Email sign up method (better-auth compatible)
export const signUp = {
  email: async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await authApi.signup({ email, password });
      
      if (response.data.user && response.data.access_token) {
        Cookies.set('token', response.data.access_token, { expires: 7 });
        return {
          data: response.data,
          error: null,
        };
      } else {
        return {
          data: null,
          error: { message: 'No user data received' },
        };
      }
    } catch (error) {
      return {
        data: null,
        error: { message: 'Signup failed' },
      };
    }
  },
};

// Sign out method
export const signOut = async () => {
  try {
    await authApi.signout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    Cookies.remove('token');
  }
};

// Export authClient with similar interface for compatibility
export const authClient = {
  signIn,
  signUp,
  signOut,
  useSession,
};
