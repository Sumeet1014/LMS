import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Edit, Users, FileText } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('auth_token');

export default function MentorAssignments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<'assignments' | 'quizzes'>('assignments');

  // ── Assignments state ──────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ title: '', description: '', course_id: '', due_date: '', total_marks: 100 });

  // ── Quizzes state ──────────────────────────────────────────────────────
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', subject: '', description: '', duration: 30, points_reward: 50 });
  const [questions, setQuestions] = useState([{ question_text: '', marks: 10, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] }]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
    loadCourses();
    loadQuizzes();
  }, []);

  const loadAssignments = async () => {
    const res = await fetch(`${API}/assignments/my`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setAssignments(d.assignments || []); }
  };

  const loadCourses = async () => {
    const res = await fetch(`${API}/courses/my`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setCourses(d.courses || []); }
  };

  const loadQuizzes = async () => {
    const res = await fetch(`${API}/mentor-quizzes/my`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setQuizzes(d.quizzes || []); }
  };

  // ── Create Course (quick) ──────────────────────────────────────────────
  const createCourse = async (title: string) => {
    const res = await fetch(`${API}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ title, domain: 'General', duration: 10 })
    });
    if (res.ok) { const d = await res.json(); return d.course; }
    return null;
  };

  // ── Submit Assignment ──────────────────────────────────────────────────
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let courseId = assignForm.course_id;
      // If no course selected, create one with assignment title
      if (!courseId) {
        const course = await createCourse(assignForm.title);
        if (!course) throw new Error('Failed to create course');
        courseId = course.id;
        await loadCourses();
      }

      const res = await fetch(`${API}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...assignForm, course_id: courseId })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast({ title: 'Assignment Created!' });
      setShowAssignForm(false);
      setAssignForm({ title: '', description: '', course_id: '', due_date: '', total_marks: 100 });
      loadAssignments();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // ── Delete Assignment ──────────────────────────────────────────────────
  const deleteAssignment = async (id: number) => {
    if (!confirm('Delete this assignment?')) return;
    await fetch(`${API}/assignments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    loadAssignments();
    toast({ title: 'Deleted' });
  };

  // ── Quiz question helpers ──────────────────────────────────────────────
  const addQuestion = () => setQuestions(p => [...p, { question_text: '', marks: 10, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] }]);
  const removeQuestion = (i: number) => setQuestions(p => p.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, field: string, val: any) => setQuestions(p => p.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOption = (qi: number, oi: number, field: string, val: any) => setQuestions(p => p.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? { ...o, [field]: val } : o) } : q));
  const setCorrect = (qi: number, oi: number) => setQuestions(p => p.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, oidx) => ({ ...o, is_correct: oidx === oi })) } : q));

  // ── Submit Quiz ────────────────────────────────────────────────────────
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.some(q => !q.question_text.trim())) { toast({ title: 'Error', description: 'All questions need text', variant: 'destructive' }); return; }
    if (questions.some(q => !q.options.some(o => o.is_correct))) { toast({ title: 'Error', description: 'Each question needs a correct answer', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/mentor-quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...quizForm, questions })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast({ title: 'Quiz Created!' });
      setShowQuizForm(false);
      setQuizForm({ title: '', subject: '', description: '', duration: 30, points_reward: 50 });
      setQuestions([{ question_text: '', marks: 10, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] }]);
      loadQuizzes();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const deleteQuiz = async (id: number) => {
    if (!confirm('Delete this quiz?')) return;
    await fetch(`${API}/mentor-quizzes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    loadQuizzes();
    toast({ title: 'Deleted' });
  };

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px', border: 'none', borderBottom: active ? '2px solid #10b981' : '2px solid transparent',
    background: 'none', fontWeight: active ? 600 : 400, color: active ? '#10b981' : '#555', cursor: 'pointer', fontSize: '15px'
  });

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">Assignments & Quizzes</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <button style={tabStyle(tab === 'assignments')} onClick={() => setTab('assignments')}>📝 Assignments</button>
        <button style={tabStyle(tab === 'quizzes')} onClick={() => setTab('quizzes')}>🧠 Quizzes</button>
      </div>

      {/* ── ASSIGNMENTS TAB ── */}
      {tab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{assignments.length} assignment(s) created</p>
            <Button onClick={() => setShowAssignForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Assignment
            </Button>
          </div>

          {showAssignForm && (
            <Card className="p-6 border-green-200">
              <h2 className="text-lg font-bold mb-4">New Assignment</h2>
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <Input value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} placeholder="e.g., Array Problems Set 1" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} placeholder="Instructions for students..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Course (optional)</label>
                    <select value={assignForm.course_id} onChange={e => setAssignForm({ ...assignForm, course_id: e.target.value })}
                      className="w-full p-2 border rounded-md text-sm">
                      <option value="">Auto-create course</option>
                      {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Marks</label>
                    <Input type="number" min="1" value={assignForm.total_marks} onChange={e => setAssignForm({ ...assignForm, total_marks: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date *</label>
                  <Input type="datetime-local" value={assignForm.due_date} onChange={e => setAssignForm({ ...assignForm, due_date: e.target.value })} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">{loading ? 'Creating...' : 'Create Assignment'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {assignments.length === 0 && !showAssignForm && (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No assignments yet. Create one for your students.</p>
            </Card>
          )}

          {assignments.map((a: any) => (
            <Card key={a.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span>📚 {a.course_title}</span>
                    <span>📅 Due: {new Date(a.due_date).toLocaleDateString()}</span>
                    <span>🎯 {a.total_marks} marks</span>
                    <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{a.submission_count || 0} submissions</Badge>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteAssignment(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── QUIZZES TAB ── */}
      {tab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{quizzes.length} quiz(zes) created</p>
            <Button onClick={() => setShowQuizForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Quiz
            </Button>
          </div>

          {showQuizForm && (
            <Card className="p-6 border-indigo-200">
              <h2 className="text-lg font-bold mb-4">New Quiz</h2>
              <form onSubmit={handleQuizSubmit} className="space-y-6">
                {/* Quiz Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quiz Title *</label>
                    <Input value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="e.g., DSA Basics Quiz" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject *</label>
                    <Input value={quizForm.subject} onChange={e => setQuizForm({ ...quizForm, subject: e.target.value })} placeholder="e.g., Data Structures" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <Input type="number" min="5" value={quizForm.duration} onChange={e => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Points Reward</label>
                    <Input type="number" min="1" value={quizForm.points_reward} onChange={e => setQuizForm({ ...quizForm, points_reward: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} placeholder="What is this quiz about?" rows={2} />
                </div>

                {/* Questions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Questions ({questions.length})</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}><Plus className="h-3 w-3 mr-1" /> Add Question</Button>
                  </div>

                  {questions.map((q, qi) => (
                    <Card key={qi} className="p-4 mb-3 border-indigo-100">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-indigo-600">Question {qi + 1}</span>
                        {questions.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qi)}><Trash2 className="h-3 w-3" /></Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input value={q.question_text} onChange={e => updateQuestion(qi, 'question_text', e.target.value)}
                            placeholder="Enter question..." className="flex-1" required />
                          <Input type="number" min="1" value={q.marks} onChange={e => updateQuestion(qi, 'marks', parseInt(e.target.value))}
                            className="w-20" placeholder="Marks" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Options (click radio to mark correct answer)</p>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`flex items-center gap-2 p-2 rounded border ${opt.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                              <input type="radio" name={`correct-${qi}`} checked={opt.is_correct} onChange={() => setCorrect(qi, oi)} className="accent-green-600" />
                              <Input value={opt.option_text} onChange={e => updateOption(qi, oi, 'option_text', e.target.value)}
                                placeholder={`Option ${oi + 1}`} className="flex-1 h-8 text-sm" />
                              {opt.is_correct && <span className="text-xs text-green-600 font-medium">✓ Correct</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">{loading ? 'Creating...' : 'Create Quiz'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowQuizForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {quizzes.length === 0 && !showQuizForm && (
            <Card className="p-8 text-center">
              <p className="text-4xl mb-3">🧠</p>
              <p className="text-muted-foreground">No quizzes yet. Create one to test your students.</p>
            </Card>
          )}

          {quizzes.map((q: any) => (
            <Card key={q.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{q.title}</h3>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span>📚 {q.subject}</span>
                    <span>⏱ {q.duration} min</span>
                    <span>🎯 {q.points_reward} pts</span>
                    <Badge variant="secondary">{q.question_count || 0} questions</Badge>
                    <Badge variant="outline">{q.attempt_count || 0} attempts</Badge>
                    <Badge className={q.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {q.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteQuiz(q.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
