import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers so every input renders with stable identity across re-renders
// ─────────────────────────────────────────────────────────────────────────────
function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled,
  loading,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  disabled: boolean;
  loading?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        htmlFor={id}
        style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: '#888',
            pointerEvents: 'none',
          }}
        />
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => {
            console.log(`Input ${id} changed:`, e.target.value); // Debug log
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          disabled={loading}
          autoComplete={autoComplete || 'off'}
          style={{
            width: '100%',
            padding: '10px 40px 10px 38px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            background: disabled || loading ? '#f3f4f6' : '#fff',
            color: '#111',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#888',
            }}
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Login Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Login() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign-in state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign-up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      console.log('Sign in attempt:', { siEmail, siPassword: '***' }); // Debug log
      
      if (!siEmail || !siPassword) {
        setError('Please fill in all fields.');
        return;
      }
      setLoading(true);
      try {
        const result = await login(siEmail, siPassword);
        console.log('Login result:', result); // Debug log
        if (!result.success) throw new Error(result.error);
        toast({ title: 'Signed in!', description: 'Welcome back.' });
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Login error:', err); // Debug log
        setError(err.message || 'Failed to sign in. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [siEmail, siPassword, login, navigate, toast]
  );

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      console.log('Sign up attempt:', { suName, suEmail, suPassword: '***' }); // Debug log
      
      if (!suName || !suEmail || !suPassword) {
        setError('Please fill in all fields.');
        return;
      }
      if (suPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setLoading(true);
      try {
        const result = await register(suEmail, suPassword, suName, 'student');
        console.log('Register result:', result); // Debug log
        if (!result.success) throw new Error(result.error);
        toast({ title: 'Account created!', description: 'You can now sign in.' });
        // Switch to sign-in tab and prefill email
        setSiEmail(suEmail);
        setSiPassword('');
        setTab('signin');
      } catch (err: any) {
        console.error('Register error:', err); // Debug log
        setError(err.message || 'Failed to create account. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [suName, suEmail, suPassword, register, toast]
  );

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    border: 'none',
    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    background: 'none',
    fontWeight: active ? 600 : 400,
    color: active ? '#6366f1' : '#555',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'color 0.2s',
  });

  const submitBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px',
    background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '4px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)',
        padding: '16px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 32px 24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>📚</div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>Learning Management System</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '14px' }}>
            Peer-to-peer learning community
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button style={tabBtnStyle(tab === 'signin')} onClick={() => { setTab('signin'); setError(''); }}>
            Sign In
          </button>
          <button style={tabBtnStyle(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); }}>
            Sign Up
          </button>
        </div>

        {/* Form area */}
        <div style={{ padding: '28px 32px 32px' }}>

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {/* ── SIGN IN ── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} noValidate>
              <Field
                id="si-email"
                label="Email"
                type="email"
                value={siEmail}
                onChange={setSiEmail}
                placeholder="you@example.com"
                icon={Mail}
                disabled={loading}
                loading={loading}
                autoComplete="email"
              />
              <Field
                id="si-password"
                label="Password"
                type="password"
                value={siPassword}
                onChange={setSiPassword}
                placeholder="Your password"
                icon={Lock}
                disabled={loading}
                loading={loading}
                autoComplete="current-password"
              />
              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Sign In
              </button>
            </form>
          )}

          {/* ── SIGN UP ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} noValidate>
              <Field
                id="su-name"
                label="Full Name"
                type="text"
                value={suName}
                onChange={setSuName}
                placeholder="Your full name"
                icon={User}
                disabled={loading}
                loading={loading}
                autoComplete="name"
              />
              <Field
                id="su-email"
                label="Email"
                type="email"
                value={suEmail}
                onChange={setSuEmail}
                placeholder="you@example.com"
                icon={Mail}
                disabled={loading}
                loading={loading}
                autoComplete="email"
              />
              <Field
                id="su-password"
                label="Password"
                type="password"
                value={suPassword}
                onChange={setSuPassword}
                placeholder="Min. 6 characters"
                icon={Lock}
                disabled={loading}
                loading={loading}
                autoComplete="new-password"
              />
              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Create Account
              </button>
            </form>
          )}

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
            {tab === 'signin'
              ? <>Don't have an account?{' '}
                <button onClick={() => { setTab('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Sign Up</button>
              </>
              : <>Already have an account?{' '}
                <button onClick={() => { setTab('signin'); setError(''); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Sign In</button>
              </>
            }
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}