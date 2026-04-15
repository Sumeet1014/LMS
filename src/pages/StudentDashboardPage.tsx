import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import AIChatBot from '@/components/AIChatBot';
import StudentDashboard from '@/components/StudentDashboard';

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetch(`${import.meta.env.VITE_API_URL}/profiles/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      }).then(r => r.ok ? r.json() : null).then(d => { if (d?.profile) setProfile(d.profile); });
    }
  }, [user]);

  const handleSignOut = async () => {
    await logout();
    toast({ title: 'Signed out' });
    navigate('/login/student');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="floating-bubbles" />

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {(user?.name || user?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-magic">Learning Management System</h1>
              <p className="text-xs text-muted-foreground">🎓 Student — {user?.name || user?.email}</p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <StudentDashboard profile={profile} />

        <Card className="card-clean shadow-lg">
          <CardHeader><CardTitle className="text-xl">🤖 StudyBot Assistant</CardTitle></CardHeader>
          <CardContent><AIChatBot /></CardContent>
        </Card>
      </main>
    </div>
  );
}
