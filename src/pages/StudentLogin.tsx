import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Eye, EyeOff, GraduationCap, ArrowLeft } from 'lucide-react';

function Field({ id, label, type, value, onChange, placeholder, icon: Icon, loading, autoComplete }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ElementType; loading: boolean; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#888', pointerEvents: 'none' }} />
        <input
          id={id} type={isPassword ? (show ? 'text' : 'password') : type}
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={loading} autoComplete={autoComplete || 'off'}
          style={{ width: '100%', padding: '10px 40px 10px 38px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: loading ? '#f3f4f6' : '#fff', color: '#111' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.2)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#888' }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function StudentLogin() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register, logout } = useAuth();

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!siEmail || !siPassword) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const result = await login(siEmail, siPassword);
      if (!result.success) throw new Error(result.error);
      // Block mentor accounts from student portal
      if (result.user?.role === 'mentor') {
        await logout();
        setError('This is a Mentor account. Please use Mentor Login instead.');
        return;
      }
      toast({ title: 'Welcome back, Student!' });
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  }, [siEmail, siPassword, login, navigate, toast]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!suName || !suEmail || !suPassword) { setError('Please fill in all fields.'); return; }
    if (suPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const result = await register(suEmail, suPassword, suName, 'student');
      if (!result.success) throw new Error(result.error);
      // Auto login after register
      const loginResult = await login(suEmail, suPassword);
      if (!loginResult.success) throw new Error(loginResult.error);
      toast({ title: 'Account created!', description: 'Welcome to the platform.' });
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  }, [suName, suEmail, suPassword, register, login, navigate, toast]);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px', border: 'none',
    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    background: 'none', fontWeight: active ? 600 : 400,
    color: active ? '#6366f1' : '#555', cursor: 'pointer', fontSize: '15px',
  });

  const submitBtn: React.CSSProperties = {
    width: '100%', padding: '11px',
    background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px',
    fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)', padding: '16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '32px 32px 24px', textAlign: 'center', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
          <button onClick={() => navigate('/login')} style={{ position: 'absolute', left: '16px', top: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <GraduationCap size={32} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Student Portal</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '13px' }}>Learn, grow and earn certificates</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
          <button style={tabBtn(tab === 'signin')} onClick={() => { setTab('signin'); setError(''); }}>Sign In</button>
          <button style={tabBtn(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {tab === 'signin' && (
            <form onSubmit={handleSignIn} noValidate autoComplete="off">
              <Field id="student-signin-email" label="Email" type="email" value={siEmail} onChange={setSiEmail} placeholder="you@example.com" icon={Mail} loading={loading} autoComplete="off" />
              <Field id="student-signin-password" label="Password" type="password" value={siPassword} onChange={setSiPassword} placeholder="Your password" icon={Lock} loading={loading} autoComplete="off" />
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Sign In as Student
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignUp} noValidate>
              <Field id="su-name" label="Full Name" type="text" value={suName} onChange={setSuName} placeholder="Your full name" icon={User} loading={loading} autoComplete="off" />
              <Field id="su-email" label="Email" type="email" value={suEmail} onChange={setSuEmail} placeholder="you@example.com" icon={Mail} loading={loading} autoComplete="email" />
              <Field id="su-password" label="Password" type="password" value={suPassword} onChange={setSuPassword} placeholder="Min. 8 characters" icon={Lock} loading={loading} autoComplete="new-password" />
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Create Student Account
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
            {tab === 'signin'
              ? <>New student?{' '}<button onClick={() => { setTab('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Create Account</button></>
              : <>Already registered?{' '}<button onClick={() => { setTab('signin'); setError(''); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Sign In</button></>
            }
          </p>

          {/* Google Login */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>
            <button
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}/api/auth/google`}
              style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px', fontWeight: 500, color: '#374151' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
