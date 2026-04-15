import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, Eye, EyeOff, BookOpen, ArrowLeft, User } from 'lucide-react';

function Field({ id, label, type, value, onChange, placeholder, icon: Icon, loading, autoComplete }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ElementType; loading: boolean; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#888', pointerEvents: 'none' }} />
        <input id={id} type={isPassword ? (show ? 'text' : 'password') : type}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} disabled={loading} autoComplete={autoComplete || 'off'}
          style={{ width: '100%', padding: '10px 40px 10px 38px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: loading ? '#f3f4f6' : '#fff', color: '#111' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.2)'; }}
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

export default function MentorLogin() {
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
      // Block student accounts from mentor portal
      if (result.user?.role === 'student') {
        await logout();
        setError('This is a Student account. Please use Student Login instead.');
        return;
      }
      toast({ title: 'Welcome back, Mentor!' });
      navigate('/mentor/dashboard');
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
      const regResult = await register(suEmail, suPassword, suName, 'mentor');
      if (!regResult.success) throw new Error(regResult.error);
      const loginResult = await login(suEmail, suPassword);
      if (!loginResult.success) throw new Error(loginResult.error);
      toast({ title: 'Mentor account created!', description: 'Complete your profile from the dashboard.' });
      navigate('/mentor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create mentor account.');
    } finally {
      setLoading(false);
    }
  }, [suName, suEmail, suPassword, register, login, navigate, toast]);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px', border: 'none',
    borderBottom: active ? '2px solid #10b981' : '2px solid transparent',
    background: 'none', fontWeight: active ? 600 : 400,
    color: active ? '#10b981' : '#555', cursor: 'pointer', fontSize: '15px',
  });

  const submitBtn: React.CSSProperties = {
    width: '100%', padding: '11px',
    background: loading ? '#6ee7b7' : 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px',
    fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', padding: '16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '28px 32px 20px', textAlign: 'center', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', position: 'relative' }}>
          <button onClick={() => navigate('/login')}
            style={{ position: 'absolute', left: '16px', top: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <BookOpen size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Mentor Portal</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '13px' }}>Teach, inspire and track your impact</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button style={tabBtn(tab === 'signin')} onClick={() => { setTab('signin'); setError(''); }}>Sign In</button>
          <button style={tabBtn(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); }}>Register</button>
        </div>

        <div style={{ padding: '24px 32px 32px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} noValidate autoComplete="off">
              <Field id="mentor-signin-email" label="Email" type="email" value={siEmail} onChange={setSiEmail} placeholder="mentor@example.com" icon={Mail} loading={loading} autoComplete="off" />
              <Field id="mentor-signin-password" label="Password" type="password" value={siPassword} onChange={setSiPassword} placeholder="Your password" icon={Lock} loading={loading} autoComplete="off" />
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Sign In as Mentor
              </button>
            </form>
          )}

          {/* REGISTER */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} noValidate autoComplete="off">
              <Field id="mentor-reg-name" label="Full Name *" type="text" value={suName} onChange={setSuName} placeholder="Your full name" icon={User} loading={loading} autoComplete="off" />
              <Field id="mentor-reg-email" label="Email *" type="email" value={suEmail} onChange={setSuEmail} placeholder="you@example.com" icon={Mail} loading={loading} autoComplete="off" />
              <Field id="mentor-reg-password" label="Password *" type="password" value={suPassword} onChange={setSuPassword} placeholder="Min. 8 characters" icon={Lock} loading={loading} autoComplete="off" />

              <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '13px', color: '#166534', marginBottom: '12px' }}>
                After registration, go to <strong>My Mentor Profile</strong> from the dashboard to add your subjects and availability.
              </div>

              <button type="submit" disabled={loading} style={submitBtn}>
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Create Mentor Account
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
            {tab === 'signin'
              ? <>New mentor?{' '}<button onClick={() => { setTab('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>Register here</button></>
              : <>Already registered?{' '}<button onClick={() => { setTab('signin'); setError(''); }} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>Sign In</button></>
            }
          </p>
          <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: '#888' }}>
            Are you a student?{' '}
            <button onClick={() => navigate('/login/student')} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Student Login</button>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
