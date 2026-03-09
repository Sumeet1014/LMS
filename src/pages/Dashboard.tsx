import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Calendar, Users, Award, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import UpcomingSessions from '@/components/UpcomingSessions';
import AIChatBot from '@/components/AIChatBot';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profiles/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      } else if (response.status === 404) {
        console.log('Profile not found, user might need to complete it');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast({ title: 'Signed out successfully' });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="floating-bubbles" />

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-magic">Study Circle</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.name || user?.email}!
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* AI Chat Bot - Featured */}
        <div className="mb-8">
          <Card className="card-clean shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">🤖 StudyBot Assistant</CardTitle>
              <CardDescription>
                Get instant help with study tips, challenges, badges, and more! Toggle AI mode for smarter responses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIChatBot />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Summary */}
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>
                Complete your profile to start learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="text-sm">
                  <strong>Name:</strong> {user?.name || 'Not set'}
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <UpcomingSessions />

          {/* Video Sessions Info */}
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5 text-accent" />
                Video Sessions
              </CardTitle>
              <CardDescription>
                Connect with mentors and students through live video calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-foreground mb-3">
                    <strong>How it works:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Schedule a session with a mentor or student</li>
                    <li>• Click "Join Video Call" when it's time</li>
                    <li>• Connect via peer-to-peer WebRTC video</li>
                    <li>• No external apps needed - works in browser</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/find-mentor')}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Find a Mentor to Start
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Points & Badges */}
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-success" />
                Points & Badges
              </CardTitle>
              <CardDescription>
                Your learning achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{profile?.credits || 0}</div>
                  <p className="text-sm text-muted-foreground">Credits</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">No badges yet</div>
                  <p className="text-sm text-muted-foreground">
                    Complete sessions to earn badges
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-clean md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with Study Circle - connect, learn, and grow together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button className="btn-primary" onClick={() => navigate('/find-mentor')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Find a Mentor
                </Button>
                <Button variant="outline" onClick={() => navigate('/become-mentor')}>
                  <Users className="mr-2 h-4 w-4" />
                  Become a Mentor
                </Button>
                <Button variant="outline" onClick={() => navigate('/schedule')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Button>
                <Button variant="outline" onClick={() => navigate('/achievements')}>
                  <Award className="mr-2 h-4 w-4" />
                  View Achievements
                </Button>
                <Button variant="outline" onClick={() => navigate('/challenges')}>
                  <Award className="mr-2 h-4 w-4" />
                  Challenges
                </Button>
                <Button variant="outline" onClick={() => navigate('/leaderboard')}>
                  <Award className="mr-2 h-4 w-4" />
                  Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
