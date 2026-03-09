import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Video, User, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import sessionApi from '@/lib/session-api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SessionConfirmation from '@/components/SessionConfirmation';

interface Session {
  id: string;
  title: string;
  requested_time: string;
  duration: number;
  status: string;
  video_room_id?: string;
  mentor_id: string;
  student_id: string;
  subject_id?: string;
  mentor_name?: string;
  student_name?: string;
}

interface Profile {
  user_id: string;
  username: string;
  college_email: string;
}

export default function ViewSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingSession, setConfirmingSession] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const response = await sessionApi.getUserSessions();
      
      if (response.sessions) {
        const sessionsData = response.sessions;
        setSessions(sessionsData);

        // Extract user profiles from session data (already included in API response)
        const profileMap = sessionsData.reduce((acc, session: Session) => {
          if (session.mentor_name) {
            acc[session.mentor_id] = {
              user_id: session.mentor_id,
              username: session.mentor_name,
              college_email: ''
            };
          }
          if (session.student_name) {
            acc[session.student_id] = {
              user_id: session.student_id,
              username: session.student_name,
              college_email: ''
            };
          }
          return acc;
        }, {} as Record<string, Profile>);
        setProfiles(profileMap);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.mentor_id !== user?.id) return;

    setConfirmingSession(sessionId);
    
    try {
      const response = await sessionApi.updateSessionStatus(sessionId, { status: 'approved' });
      
      if (!response.sessions) {
        throw new Error('Failed to approve session');
      }

      // Note: Email functionality would need to be implemented in the backend
      // For now, we'll just show a success message
      toast({
        title: 'Success',
        description: 'Session approved successfully',
      });

      // Refresh sessions
      fetchSessions();
    } catch (error: any) {
      console.error('Error approving session:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve session',
        variant: 'destructive',
      });
    } finally {
      setConfirmingSession(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Time TBD';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPartnerName = (session: Session) => {
    const partnerId = session.mentor_id === user?.id ? session.student_id : session.mentor_id;
    const partner = profiles[partnerId];
    return partner?.username || 'Unknown User';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading schedule...</div>
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
          <h1 className="text-2xl font-bold text-magic">My Schedule</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <Card className="card-clean text-center">
            <CardContent className="py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions scheduled yet</h3>
              <p className="text-muted-foreground mb-4">
                Find a mentor or become one to start scheduling study sessions.
              </p>
              <Button onClick={() => navigate('/find-mentor')} className="btn-primary">
                Find a Mentor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="card-clean">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {session.title}
                      </CardTitle>
                       <CardDescription>
                        Study session with {getPartnerName(session)}
                       </CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Duration:</strong> {session.duration || 60} minutes
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>When:</strong> {formatDateTime(session.requested_time)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Role:</strong> {session.mentor_id === user?.id ? 'Teaching' : 'Learning'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {session.status === 'approved' && (
                        <Button
                          onClick={() => {
                            const role = session.mentor_id === user?.id ? 'mentor' : 'student';
                            const roomId = session.video_room_id || session.id;
                            navigate(`/room/${roomId}?role=${role}&mentorId=${session.mentor_id}`);
                          }}
                          className="btn-primary"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join Video Call
                        </Button>
                      )}
                      
                      {session.status === 'pending' && session.mentor_id === user?.id && (
                        <Button
                          onClick={() => handleApproveSession(session.id)}
                          disabled={confirmingSession === session.id}
                          className="btn-primary"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {confirmingSession === session.id ? 'Approving...' : 'Approve Session'}
                        </Button>
                      )}
                      
                      {session.status === 'pending' && session.student_id === user?.id && (
                        <Badge variant="outline" className="self-start">
                          Waiting for mentor approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
