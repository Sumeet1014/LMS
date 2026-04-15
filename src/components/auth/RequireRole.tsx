import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function RequireRole({ role, children }: { role: 'student' | 'mentor'; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role === 'mentor' ? 'mentor' : 'student';

  if (userRole !== role) {
    // Wrong role — redirect to their correct dashboard
    return <Navigate to={userRole === 'mentor' ? '/mentor/dashboard' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
}
