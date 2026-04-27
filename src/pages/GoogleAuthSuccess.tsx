import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import authApi from '@/lib/auth-api';

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error || !token || !userStr) {
      navigate('/login?error=google_failed');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      // Store auth data
      authApi.setAuthData(token, user);
      // Redirect based on role
      if (user.role === 'mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch {
      navigate('/login?error=parse_failed');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Signing you in with Google...</p>
      </div>
    </div>
  );
}
