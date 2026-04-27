import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Award, Star, BookOpen, Users, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import UpcomingSessions from '@/components/UpcomingSessions';

const SUBJECT_CATEGORIES = [
  { id: 'dsa', label: 'DSA', icon: '🧮', color: '#6366f1', keywords: ['dsa', 'data structure', 'algorithm'] },
  { id: 'dbms', label: 'Databases', icon: '🗄️', color: '#10b981', keywords: ['database', 'dbms', 'sql', 'mysql', 'db'] },
  { id: 'networks', label: 'Networks', icon: '🌐', color: '#3b82f6', keywords: ['network', 'computer network', 'cn'] },
  { id: 'operating-systems', label: 'OS', icon: '💻', color: '#f59e0b', keywords: ['os', 'operating system'] },
  { id: 'java', label: 'Java', icon: '☕', color: '#ef4444', keywords: ['java'] },
  { id: 'oops', label: 'OOPs', icon: '🔷', color: '#8b5cf6', keywords: ['oops', 'object oriented', 'oop'] },
  { id: 'system-design', label: 'System Design', icon: '🏗️', color: '#06b6d4', keywords: ['system design'] },
  { id: 'competitive-coding', label: 'Competitive', icon: '🏆', color: '#f97316', keywords: ['competitive', 'coding', 'cp'] },
  { id: 'c', label: 'C / C++', icon: '⚙️', color: '#64748b', keywords: ['c++', 'c/', 'c / c', 'cpp', ' c '] },
  { id: 'project-development', label: 'Projects & Git', icon: '🚀', color: '#84cc16', keywords: ['project', 'git', 'github'] },
];

export default function StudentDashboard({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [certCount, setCertCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch(`${import.meta.env.VITE_API_URL}/certificates`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.certificates) setCertCount(d.certificates.length); });
  }, []);

  const fetchMentorsBySubject = async (subject: typeof SUBJECT_CATEGORIES[0]) => {
    setLoadingMentors(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profiles/mentors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch mentors');
      const data = await res.json();
      const all = (data.mentors || []).map((m: any) => ({
        ...m,
        subjects: typeof m.subjects === 'string' ? JSON.parse(m.subjects) : (m.subjects || [])
      }));
      // Filter by keywords — strict match, no fallback to all
      const filtered = all.filter((m: any) =>
        m.subjects?.some((s: string) =>
          subject.keywords.some(kw => s.toLowerCase().includes(kw.toLowerCase()))
        )
      );
      setMentors(filtered);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingMentors(false);
    }
  };

  const handleSubjectClick = (subject: typeof SUBJECT_CATEGORIES[0]) => {
    setSelectedSubject(subject.label);
    fetchMentorsBySubject(subject);
  };

  const handleRequestSession = async (mentorId: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const proposedTime = new Date();
      proposedTime.setDate(proposedTime.getDate() + 1);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          mentor_id: mentorId,
          title: `${selectedSubject || 'Study'} Session Request`,
          requested_time: proposedTime.toISOString(),
          duration: 60
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send request');
      }

      toast({ title: 'Request Sent!', description: 'Mentor will review your session request.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4" style={{ borderTop: '3px solid #6366f1' }}>
          <div className="text-2xl font-bold text-indigo-600">{profile?.total_sessions_attended || 0}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Calendar className="h-3 w-3" /> Sessions</div>
        </Card>
        <Card className="text-center p-4" style={{ borderTop: '3px solid #10b981' }}>
          <div className="text-2xl font-bold text-green-600">{profile?.credits || 0}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Award className="h-3 w-3" /> Credits</div>
        </Card>
        <Card className="text-center p-4" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="text-2xl font-bold text-amber-600">{profile?.contribution_score || 0}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Star className="h-3 w-3" /> Score</div>
        </Card>
        <Card className="text-center p-4" style={{ borderTop: '3px solid #8b5cf6' }}>
          <div className="text-2xl font-bold text-purple-600">{certCount}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><Award className="h-3 w-3" /> Certificates</div>
        </Card>
      </div>

      {/* Subject Picker — Find Mentor by Subject */}
      <Card className="card-clean" style={{ borderTop: '3px solid #6366f1' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-indigo-600" />
            Find a Mentor by Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {SUBJECT_CATEGORIES.map(subject => (
              <button key={subject.id} onClick={() => handleSubjectClick(subject)}
                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${selectedSubject === subject.label ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}>
                <div className="text-2xl mb-1">{subject.icon}</div>
                <div className="text-xs font-medium">{subject.label}</div>
              </button>
            ))}
          </div>

          {/* Browse All */}
          <Button variant="outline" className="w-full" onClick={() => navigate('/find-mentor')}>
            <BookOpen className="mr-2 h-4 w-4" /> Browse All Mentors
          </Button>

          {/* Mentor Results */}
          {selectedSubject && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-3 text-indigo-700">
                {loadingMentors ? 'Loading...' : `Mentors for ${selectedSubject}`}
              </h3>
              {!loadingMentors && mentors.length === 0 && (
                <p className="text-sm text-muted-foreground">No mentors found for this subject.</p>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                {mentors.slice(0, 4).map((mentor: any) => (
                  <div key={mentor.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                      {(mentor.username || mentor.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{mentor.username || mentor.full_name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {Number(mentor.rating || 0).toFixed(1)}
                        {mentor.availability?.length > 0 && (
                          <span className="ml-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mentor.availability[0]?.day}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(mentor.subjects || []).slice(0, 2).map((s: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs py-0">{s}</Badge>
                        ))}
                      </div>
                      <Button size="sm" className="w-full h-7 text-xs btn-primary"
                        onClick={() => handleRequestSession(mentor.user_id || mentor.id)}>
                        Request Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {mentors.length > 4 && (
                <Button variant="link" className="mt-2 text-indigo-600" onClick={() => navigate('/find-mentor')}>
                  View all {mentors.length} mentors →
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Upcoming Sessions */}
        <div className="md:col-span-2">
          <UpcomingSessions />
        </div>

        {/* Quick Actions */}
        <Card className="card-clean">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start btn-primary" onClick={() => navigate('/find-mentor')}>
              <Users className="mr-2 h-4 w-4" /> Find a Mentor
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/my-courses')}>
              <BookOpen className="mr-2 h-4 w-4" /> My Courses
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/schedule')}>
              <Calendar className="mr-2 h-4 w-4" /> My Sessions
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/challenges')}>
              <Award className="mr-2 h-4 w-4" /> Challenges & Quizzes
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/achievements')}>
              <Star className="mr-2 h-4 w-4" /> My Certificates
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/leaderboard')}>
              <Users className="mr-2 h-4 w-4" /> Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
