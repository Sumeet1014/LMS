import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function LoginSelect() {
  const navigate = useNavigate();

  const cardStyle = (color: string): React.CSSProperties => ({
    flex: 1,
    padding: '36px 24px',
    borderRadius: '16px',
    border: `2px solid ${color}`,
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)',
      padding: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#1e1b4b' }}>
            Learning Management System
          </h1>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '15px' }}>
            Who are you? Select your role to continue.
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

          {/* Student */}
          <div
            style={cardStyle('#6366f1')}
            onClick={() => navigate('/login/student')}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <GraduationCap size={32} color="#fff" />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#1e1b4b' }}>
              Student
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              Learn from mentors, attend sessions, attempt quizzes and earn certificates
            </p>
            <div style={{
              marginTop: '20px', padding: '10px',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>
              Login as Student →
            </div>
          </div>

          {/* Mentor */}
          <div
            style={cardStyle('#10b981')}
            onClick={() => navigate('/login/mentor')}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#10b981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <BookOpen size={32} color="#fff" />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#1e1b4b' }}>
              Mentor
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              Teach students, manage sessions, share knowledge and track your impact
            </p>
            <div style={{
              marginTop: '20px', padding: '10px',
              background: 'linear-gradient(135deg,#10b981,#059669)',
              borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>
              Login as Mentor →
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
