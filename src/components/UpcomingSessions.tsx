import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Session {
  id: string;
  title: string;
  requested_time: string;
  duration: number;
  status: string;
  video_room_id?: string;
  mentor_id: string;
  student_id: string;
  subject_name?: string;
  student_name?: string;
  mentor_name?: string;
}

export default function UpcomingSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUpcomingSessions();
    }
  }, [user]);

  // Also fetch recently completed sessions to show history
  const fetchUpcomingSessions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const [upcomingRes, historyRes, rejectedRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/sessions/upcoming`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/sessions?status=completed`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/sessions?status=rejected`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const upcoming = upcomingRes.ok ? (await upcomingRes.json()).sessions || [] : [];
      const completed = historyRes.ok ? (await historyRes.json()).sessions?.slice(0, 3) || [] : [];
      const rejected = rejectedRes.ok ? (await rejectedRes.json()).sessions?.slice(0, 3) || [] : [];
      // Deduplicate by id
      const seen = new Set(upcoming.map((s: any) => s.id));
      const uniqueCompleted = completed.filter((s: any) => !seen.has(s.id));
      rejected.forEach((s: any) => seen.add(s.id));
      const uniqueRejected = rejected.filter((s: any) => !seen.has(s.id));
      setSessions([...upcoming, ...uniqueCompleted, ...uniqueRejected]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleJoinVideoCall = async (session: Session) => {
    const role = String(session.mentor_id) === String(user?.id) ? 'mentor' : 'student';
    
    // Use existing room_id or generate one from session id — must be same for both
    let roomId = session.video_room_id || `room_${session.id}`;
    
    // If no video_room_id set yet, set it via API so both get the same room
    if (!session.video_room_id) {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions/${session.id}/video-room`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          roomId = data.video_room_id || roomId;
        }
      } catch (e) {
        console.warn('Could not set video room, using fallback');
      }
    }
    
    navigate(`/room/${roomId}?role=${role}&mentorId=${session.mentor_id}&sessionId=${session.id}`);
  };

  if (loading) {
    return (
      <Card className="card-clean">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="card-clean">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No upcoming sessions scheduled</p>
            {user?.role !== 'mentor' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/find-mentor')}>
                Find a Mentor
              </Button>
            )}
            {user?.role === 'mentor' && (
              <p className="text-xs text-muted-foreground">Students will request sessions once they find your profile</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-clean">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Sessions
          </div>
          <Badge variant="outline" className="text-xs">
            {sessions.filter(s => s.status !== 'completed').length} upcoming
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upcoming sessions */}
          {sessions.filter(s => s.status !== 'completed').map((session, idx) => (
            <div key={`upcoming-${session.id}-${idx}`} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{session.title}</h4>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">#{session.id}</span>
                  </div>

                  {/* Subject */}
                  {session.subject_name && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                        📚 {session.subject_name}
                      </span>
                    </div>
                  )}

                  {/* Other person */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <User className="h-3 w-3" />
                    <span>
                      {user?.id === String(session.mentor_id)
                        ? `Student: ${session.student_name || 'Unknown'}`
                        : `Mentor: ${session.mentor_name || 'Unknown'}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(session.requested_time)}</span>
                    <span className="text-xs">· {session.duration} min</span>
                  </div>

                  {/* Room ID — both must join same room */}
                  {session.status === 'approved' && session.video_room_id && (
                    <div className="mt-1 text-xs text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded inline-block">
                      Room: {session.video_room_id}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(session.status)}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                {session.status === 'approved' && (
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleJoinVideoCall(session)}>
                    <Video className="mr-2 h-3 w-3" /> Join Live Class (Room: {session.video_room_id || session.id})
                  </Button>
                )}
                {session.status === 'completed' && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                    <span className="text-green-600">✓</span> Session Completed
                  </div>
                )}
                {session.status === 'pending' && user?.id === String(session.mentor_id) && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate('/schedule')}>
                    Review Request
                  </Button>
                )}
                {session.status === 'pending' && user?.id !== String(session.mentor_id) && (
                  <span className="text-xs text-muted-foreground">Waiting for mentor to approve...</span>
                )}
                {session.status === 'rejected' && (
                  <div className="flex-1 flex flex-col gap-1 py-1">
                    <span className="text-xs text-red-500 font-medium">❌ Session Rejected by Mentor</span>
                    {session.rejection_reason && (
                      <span className="text-xs text-muted-foreground">Reason: {session.rejection_reason}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Completed sessions history */}
          {sessions.filter(s => s.status === 'completed').length > 0 && (
            <>
              <div className="pt-2 pb-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Past Sessions</p>
              </div>
              {sessions.filter(s => s.status === 'completed').map((session, idx) => (
                <div key={`completed-${session.id}-${idx}`} className="p-3 border border-border rounded-lg bg-gray-50 opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">{session.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.subject_name && `📚 ${session.subject_name} · `}
                        {formatDateTime(session.requested_time)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">✓ Completed</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
