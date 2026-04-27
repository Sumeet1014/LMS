import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Users, Award, Star, PlusCircle, FileText, Check, X, Video, BookOpen, Clock, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function MentorDashboard({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [pendingSessions, setPendingSessions] = useState<any[]>([]);
  const [approvedSessions, setApprovedSessions] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({});
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [sessionForm, setSessionForm] = useState({ student_id: '', title: '', requested_time: '', duration: 60 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadMentorProfile();
    loadSessions();
  }, []);

  const loadMentorProfile = async () => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/mentor-profiles/my/profiles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const d = await res.json();
      if (d?.profiles?.length > 0) setMentorProfile(d.profiles[0]);
    }
  };

  const loadSessions = async () => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const d = await res.json();
      const all = d.sessions || [];
      setPendingSessions(all.filter((s: any) => s.status === 'pending' && String(s.mentor_id) === String(user?.id)));
      setApprovedSessions(all.filter((s: any) => s.status === 'approved' && String(s.mentor_id) === String(user?.id)));
    }
  };

  const loadStudents = async () => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/list/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const d = await res.json();
      setStudents(d.users || []);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.student_id || !sessionForm.title || !sessionForm.requested_time) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem('auth_token');
      // Mentor creates session by posting as if they are the student
      // We use a special mentor-create endpoint
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions/mentor-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          student_id: sessionForm.student_id,
          title: sessionForm.title,
          requested_time: new Date(sessionForm.requested_time).toISOString(),
          duration: sessionForm.duration,
          status: 'approved' // auto-approved since mentor creates it
        })
      });
      if (res.ok) {
        toast({ title: 'Session Created!', description: 'Session is ready for the student.' });
        setShowCreateSession(false);
        setSessionForm({ student_id: '', title: '', requested_time: '', duration: 60 });
        loadSessions();
      } else {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const approveSession = async (sessionId: number) => {
    setApprovingId(sessionId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        toast({ title: 'Session Approved!', description: 'Student will be notified.' });
        loadSessions();
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to approve session', variant: 'destructive' });
    } finally {
      setApprovingId(null);
    }
  };

  const rejectSession = async (sessionId: number) => {
    setRejectingId(sessionId);
    try {
      const token = localStorage.getItem('auth_token');
      const reason = rejectReason[sessionId] || 'Enrollment is full or slot unavailable.';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'rejected', rejection_reason: reason })
      });
      if (res.ok) {
        toast({ title: 'Session Rejected', description: 'Student has been notified.' });
        setRejectReason(prev => { const n = { ...prev }; delete n[sessionId]; return n; });
        loadSessions();
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to reject session', variant: 'destructive' });
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4" style={{ borderTop: '3px solid #10b981' }}>
          <div className="text-2xl font-bold text-green-600">{parseFloat(profile?.rating || 0).toFixed(1)}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Star className="h-3 w-3" /> Rating</div>
        </Card>
        <Card className="text-center p-4" style={{ borderTop: '3px solid #3b82f6' }}>
          <div className="text-2xl font-bold text-blue-600">{profile?.total_sessions_taught || 0}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Users className="h-3 w-3" /> Sessions Taught</div>
        </Card>
        <Card className="text-center p-4" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="text-2xl font-bold text-amber-600">{pendingSessions.length}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Clock className="h-3 w-3" /> Pending Requests</div>
        </Card>
        <Card className="text-center p-4" style={{ borderTop: '3px solid #8b5cf6' }}>
          <div className="text-2xl font-bold text-purple-600">{profile?.credits || 0}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Award className="h-3 w-3" /> Credits</div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Mentor Profile Card */}
        <Card className="card-clean" style={{ borderLeft: '4px solid #10b981' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-600" /> My Mentor Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mentorProfile ? (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-sm">{mentorProfile.profile_name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mentorProfile.bio}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {(mentorProfile.subjects || []).slice(0, 4).map((s: string, i: number) => (
                      <Badge key={i} className="bg-green-100 text-green-800 text-xs">{s}</Badge>
                    ))}
                    {(mentorProfile.subjects || []).length > 4 && (
                      <Badge variant="outline" className="text-xs">+{mentorProfile.subjects.length - 4} more</Badge>
                    )}
                  </div>
                </div>
                {mentorProfile.availability?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Availability</p>
                    <div className="space-y-0.5">
                      {mentorProfile.availability.slice(0, 3).map((slot: any, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground">{slot.day}: {slot.start_time} – {slot.end_time}</p>
                      ))}
                    </div>
                  </div>
                )}
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/mentor-profiles')}>
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No mentor profile yet</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/mentor-profiles')}>
                  <PlusCircle className="mr-1 h-3 w-3" /> Create Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Session Requests */}
        <Card className="card-clean" style={{ borderLeft: '4px solid #f59e0b' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-600" /> Session Requests</span>
              {pendingSessions.length > 0 && <Badge className="bg-amber-100 text-amber-800">{pendingSessions.length} pending</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {pendingSessions.slice(0, 3).map((s: any) => (
                  <div key={s.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">Student: {s.student_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.requested_time).toLocaleString()}</p>
                    <div className="mt-2 space-y-2">
                      <Input
                        placeholder="Rejection reason (optional)"
                        className="h-7 text-xs"
                        value={rejectReason[s.id] || ''}
                        onChange={e => setRejectReason(prev => ({ ...prev, [s.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                          disabled={approvingId === s.id}
                          onClick={() => approveSession(s.id)}>
                          <Check className="mr-1 h-3 w-3" />
                          {approvingId === s.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button size="sm" className="flex-1 bg-red-500 hover:bg-red-600 text-white h-7 text-xs"
                          disabled={rejectingId === s.id}
                          onClick={() => rejectSession(s.id)}>
                          <X className="mr-1 h-3 w-3" />
                          {rejectingId === s.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingSessions.length > 3 && (
                  <Button variant="link" size="sm" className="w-full text-amber-600" onClick={() => navigate('/schedule')}>
                    View all {pendingSessions.length} requests →
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-clean">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}
              onClick={() => navigate('/mentor-profiles')}>
              <PlusCircle className="mr-2 h-4 w-4" /> My Mentor Profile
            </Button>
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => { setShowCreateSession(true); loadStudents(); }}>
              <Send className="mr-2 h-4 w-4" /> Create Session for Student
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/mentor-assignments')}>
              <FileText className="mr-2 h-4 w-4" /> Assignments & Quizzes
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/mentor-courses')}>
              <BookOpen className="mr-2 h-4 w-4" /> My Courses
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/schedule')}>
              <Calendar className="mr-2 h-4 w-4" /> All Sessions
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/achievements')}>
              <Award className="mr-2 h-4 w-4" /> Achievements
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/leaderboard')}>
              <Users className="mr-2 h-4 w-4" /> Leaderboard
            </Button>
          </CardContent>
        </Card>

        {/* Create Session Modal */}
        {showCreateSession && (
          <Card className="card-clean md:col-span-2 lg:col-span-3 border-blue-200" style={{ borderLeft: '4px solid #3b82f6' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-600" /> Create Session for Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createSession} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Student *</label>
                  <select value={sessionForm.student_id}
                    onChange={e => setSessionForm({ ...sessionForm, student_id: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm" required>
                    <option value="">-- Select a student --</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.full_name || s.email} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Session Title *</label>
                  <Input value={sessionForm.title}
                    onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })}
                    placeholder="e.g., DSA Live Class" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time *</label>
                  <Input type="datetime-local" value={sessionForm.requested_time}
                    onChange={e => setSessionForm({ ...sessionForm, requested_time: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <select value={sessionForm.duration}
                    onChange={e => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md text-sm">
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {creating ? 'Creating...' : 'Create & Approve Session'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateSession(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Approved / Upcoming Sessions */}
        {approvedSessions.length > 0 && (
          <Card className="card-clean md:col-span-2 lg:col-span-3" style={{ borderLeft: '4px solid #3b82f6' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-600" /> Upcoming Live Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {approvedSessions.map((s: any) => (
                  <div key={s.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">Student: {s.student_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.requested_time).toLocaleString()}</p>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white ml-3"
                      onClick={() => navigate(`/room/${s.video_room_id || s.id}?role=mentor&mentorId=${s.mentor_id}&sessionId=${s.id}`)}>
                      <Video className="h-3 w-3 mr-1" /> Join
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
