import authApi from './auth-api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  created_at: string;
  username?: string;
  bio?: string;
  college_email?: string;
  is_mentor?: boolean;
  rating?: number;
  credits?: number;
  contribution_score?: number;
  subjects?: string[];
  total_sessions_attended?: number;
  total_sessions_taught?: number;
  availability?: any;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

// Sign up with email and password
export async function signUpEmail(email: string, password: string, fullName?: string) {
  const result = await authApi.register({ email, password, fullName: fullName || '', role: 'student' });
  
  if (!result.success) {
    throw new Error(result.error || 'Registration failed');
  }
  
  return {
    user: result.user,
    session: { user: result.user!, token: result.token! }
  };
}

// Sign in with email and password
export async function signInEmail(email: string, password: string) {
  const result = await authApi.login({ email, password });
  
  if (!result.success) {
    throw new Error(result.error || 'Login failed');
  }
  
  return {
    user: result.user,
    session: { user: result.user!, token: result.token! }
  };
}

// Send magic link (not supported in new backend - fallback to email/password)
export async function sendMagicLink(email: string) {
  throw new Error('Magic links are not supported. Please use email/password authentication.');
}

// Sign in with Google (not implemented yet)
export async function signInWithGoogle() {
  throw new Error('Google authentication is not implemented yet. Please use email/password authentication.');
}

// Reset password (not implemented yet)
export async function resetPassword(email: string) {
  throw new Error('Password reset is not implemented yet. Please contact support.');
}

// Update password
export async function updatePassword(password: string) {
  const result = await authApi.changePassword({
    currentPassword: '', // This would need to be provided by the user
    newPassword: password
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Password update failed');
  }
  
  return result;
}

// Sign out
export async function signOut() {
  await authApi.logout();
}

// Get current session
export async function getCurrentSession() {
  const user = authApi.getUser();
  const token = authApi.getToken();
  
  if (!user || !token) {
    return null;
  }
  
  return { user, token: token };
}

// Auth state change listener (simplified version)
export function onAuthStateChange(callback: (session: AuthSession | null) => void) {
  // For the new API, we'll use a simple polling approach
  // In a real implementation, you might want to use event emitters
  let lastToken = authApi.getToken();
  
  const interval = setInterval(() => {
    const currentToken = authApi.getToken();
    if (currentToken !== lastToken) {
      lastToken = currentToken;
      if (currentToken) {
        const user = authApi.getUser();
        callback(user ? { user: user!, token: currentToken } : null);
      } else {
        callback(null);
      }
    }
  }, 1000);
  
  return { unsubscribe: () => clearInterval(interval) };
}