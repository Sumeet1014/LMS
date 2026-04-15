import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, BookOpen, Users, Clock, CheckCircle, PlayCircle, FileText, Award } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('auth_token');

export default function StudentCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'browse' | 'enrolled'>('browse');
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadAllCourses(), loadEnrolled(), loadAssignments(), loadQuizzes()]);
    setLoading(false);
  };

  const loadAllCourses = async () => {
    const res = await fetch(`${API}/courses?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setAllCourses(d.courses || []); }
  };

  const loadEnrolled = async () => {
    const res = await fetch(`${API}/courses/enrolled?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setEnrolledCourses(d.courses || []); }
  };

  const loadAssignments = async () => {
    const res = await fetch(`${API}/assignments/student`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setAssignments(d.assignments || []); }
  };

  const loadQuizzes = async () => {
    const res = await fetch(`${API}/challenges`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setQuizzes(d.challenges || []); }
  };

  const enroll = async (courseId: number) => {
    const res = await fetch(`${API}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` }
    });
    if (res.ok) {
      toast({ title: 'Enrolled!', description: 'Live class session auto-scheduled. Check your dashboard!' });
      loadAll();
      setTab('enrolled');
    } else {
      const d = await res.json();
      toast({ title: 'Error', description: d.error, variant: 'destructive' });
    }
  };

  const isEnrolled = (courseId: number) => enrolledCourses.some((c: any) => c.id === courseId);

  const requestSession = async (mentorId: number, courseTitle: string) => {
    const proposedTime = new Date();
    proposedTime.setDate(proposedTime.getDate() + 1);
    const res = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ mentor_id: mentorId, title: `${courseTitle} - Online Class`, requested_time: proposedTime.toISOString(), duration: 60 })
    });
    if (res.ok) toast({ title: 'Session Requested!', description: 'Mentor will confirm the class time.' });
    else toast({ title: 'Error', description: 'Failed to request session', variant: 'destructive' });
  };

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px', border: 'none', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    background: 'none', fontWeight: active ? 600 : 400, color: active ? '#6366f1' : '#555', cursor: 'pointer', fontSize: '15px'
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">My Learning</h1>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <button style={tabStyle(tab === 'browse')} onClick={() => setTab('browse')}>📚 Browse Courses</button>
        <button style={tabStyle(tab === 'enrolled')} onClick={() => setTab('enrolled')}>✅ My Courses ({enrolledCourses.length})</button>
      </div>

      {/* ── BROWSE COURSES ── */}
      {tab === 'browse' && (
        <div>
          {allCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allCourses.map((course: any) => (
                <Card key={course.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      <Badge variant="secondary" className="mt-1">{course.domain}</Badge>
                    </div>
                    {isEnrolled(course.id) && <Badge className="bg-green-100 text-green-700">Enrolled ✓</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{course.description || 'No description provided.'}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}h</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.student_count || 0} students</span>
                    <span className="flex items-center gap-1">👨‍🏫 {course.mentor_name}</span>
                  </div>
                  {isEnrolled(course.id) ? (
                    <Button className="w-full" variant="outline" onClick={() => { setSelectedCourse(course); setTab('enrolled'); }}>
                      <PlayCircle className="mr-2 h-4 w-4" /> Continue Learning
                    </Button>
                  ) : (
                    <Button className="w-full btn-primary" onClick={() => enroll(course.id)}>
                      <BookOpen className="mr-2 h-4 w-4" /> Enroll Now
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MY ENROLLED COURSES ── */}
      {tab === 'enrolled' && (
        <div className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
              <Button onClick={() => setTab('browse')} className="btn-primary">Browse Courses</Button>
            </Card>
          ) : (
            enrolledCourses.map((course: any) => {
              const courseAssignments = assignments.filter((a: any) => a.course_id === course.id);
              return (
                <Card key={course.id} className="overflow-hidden" style={{ borderLeft: '4px solid #6366f1' }}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">👨‍🏫 Mentor: {course.mentor_name}</p>
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-700">{course.domain}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Step 1: Online Class */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                        <span className="font-medium text-sm">Live Class with Mentor</span>
                        <span className="text-xs text-green-600 font-medium">✓ Auto-scheduled on enrollment</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Your live class session has been automatically scheduled. Check Upcoming Sessions on your dashboard to join.</p>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/student/dashboard')}>
                        View Upcoming Sessions
                      </Button>
                    </div>

                    {/* Step 2: Assignments */}
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                        <span className="font-medium text-sm">Assignments ({courseAssignments.length})</span>
                      </div>
                      {courseAssignments.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No assignments yet. Mentor will assign them after class.</p>
                      ) : (
                        <div className="space-y-2">
                          {courseAssignments.map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                              <div>
                                <span className="font-medium">{a.title}</span>
                                <span className="text-xs text-muted-foreground ml-2">Due: {new Date(a.due_date).toLocaleDateString()}</span>
                              </div>
                              {a.submission_status ? (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {a.submission_status === 'reviewed' ? `${a.marks_obtained} marks` : 'Submitted'}
                                </Badge>
                              ) : (
                                <Button size="sm" variant="outline" className="h-7 text-xs"
                                  onClick={() => navigate(`/submit-assignment/${a.id}`)}>
                                  <FileText className="mr-1 h-3 w-3" /> Submit
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Step 3: Quiz */}
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                        <span className="font-medium text-sm">Quiz Exam</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Attempt the quiz for this subject. Score ≥ 60% to earn a certificate.</p>
                      {quizzes.filter((q: any) => q.subject?.toLowerCase().includes(course.domain?.toLowerCase()) || q.title?.toLowerCase().includes(course.title?.toLowerCase())).length > 0 ? (
                        <div className="space-y-1">
                          {quizzes.filter((q: any) => q.subject?.toLowerCase().includes(course.domain?.toLowerCase()) || q.title?.toLowerCase().includes(course.title?.toLowerCase())).map((q: any) => (
                            <div key={q.id} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                              <span className="font-medium">{q.title}</span>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs"
                                onClick={() => navigate('/challenges')}>
                                Take Quiz
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => navigate('/challenges')}>
                          View All Quizzes
                        </Button>
                      )}
                    </div>

                    {/* Step 4: Certificate */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">4</div>
                        <span className="font-medium text-sm">Certificate</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Pass the quiz with ≥ 60% to automatically earn your certificate.</p>
                      <Button size="sm" variant="outline" onClick={() => navigate('/achievements')}>
                        <Award className="mr-1 h-3 w-3" /> View My Certificates
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
