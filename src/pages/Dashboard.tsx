import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

// Smart redirect — sends user to their role-specific dashboard
export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}
