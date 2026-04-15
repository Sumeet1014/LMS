import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BadgeDisplay from '@/components/BadgeDisplay';

interface UserProfile {
  credits: number;
  total_sessions_attended: number;
  total_sessions_taught: number;
  rating: number;
  contribution_score: number;
}

export default function ViewAchievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profiles/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      // API returns { profile: {...} } or the profile directly
      setProfile(data.profile || data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading achievements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="floating-bubbles" />

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-magic">My Achievements</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Points Summary */}
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                Points & Stats
              </CardTitle>
              <CardDescription>Your learning journey progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {profile?.credits || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-secondary/5">
                  <div className="text-3xl font-bold text-secondary mb-1">
                    {profile?.total_sessions_attended || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Sessions Attended</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-accent/5">
                  <div className="text-3xl font-bold text-accent mb-1">
                    {profile?.total_sessions_taught || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Sessions Taught</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-success/5">
                  <div className="text-3xl font-bold text-success mb-1">
                    {Number(profile?.rating || 0).toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-purple-500/5">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {profile?.contribution_score || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Contribution Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificates Section */}
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                Certificates Earned
              </CardTitle>
              <CardDescription>
                Complete quizzes to earn certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && <BadgeDisplay userId={user.id} />}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}