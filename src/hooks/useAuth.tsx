import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import authApi from '@/lib/auth-api';
import { AuthUser, AuthSession } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: any }>;
  register: (email: string, password: string, fullName: string, role?: 'student' | 'mentor') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  becomeMentor: (data: { username: string; bio: string; college_email: string; subjects: string[] }) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isMentor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  // Start as false if there is no token – avoids unnecessary async render cycle
  // when unauthenticated users land on /login.
  const [loading, setLoading] = useState(() => authApi.isAuthenticated());

  // Check authentication status on mount
  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      // No token stored – nothing to check, loading already false
      return;
    }
    const checkAuth = async () => {
      try {
        // Use cached user data first to avoid rate limiting
        const cachedUser = authApi.getUser();
        const token = authApi.getToken();
        if (cachedUser && token) {
          setUser(cachedUser);
          setSession({ user: cachedUser, token });
          setLoading(false);
          // Refresh in background without blocking
          authApi.getCurrentUser().then(response => {
            if (response.user) {
              setUser(response.user);
              authApi.setAuthData(token, response.user);
            }
          }).catch(() => {});
          return;
        }
        const response = await authApi.getCurrentUser();
        if (response.user) {
          setUser(response.user);
          const token = authApi.getToken()!;
          setSession({ user: response.user, token });
          authApi.setAuthData(token, response.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authApi.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const result = await authApi.login({ email, password });

      if (result.user && result.token) {
        setUser(result.user);
        setSession({ user: result.user, token: result.token });
        authApi.setAuthData(result.token, result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: 'student' | 'mentor' = 'student'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authApi.register({ email, password, full_name: fullName, role });

      if (result.user && result.token) {
        setUser(result.user);
        setSession({ user: result.user, token: result.token });
        authApi.setAuthData(result.token, result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Registration failed'
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
      authApi.clearAuthData();
    }
  };

  const updateProfile = async (data: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.updateProfile(data);

      if (response.user) {
        setUser(response.user);
        const token = authApi.getToken()!;
        setSession({ user: response.user, token });
        authApi.setAuthData(token, response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Profile update failed' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Profile update failed'
      };
    }
  };

  const becomeMentor = async (data: {
    username: string;
    bio: string;
    college_email: string;
    subjects: string[]
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.becomeMentor(data);

      if (response.user) {
        setUser(response.user);
        const token = authApi.getToken()!;
        setSession({ user: response.user, token });
        authApi.setAuthData(token, response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to become mentor' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to become mentor'
      };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    updateProfile,
    becomeMentor,
    isAuthenticated: !!user,
    isMentor: user?.role === 'mentor' || user?.is_mentor === true,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};