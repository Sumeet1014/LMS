import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Edit, Users, BookOpen, Clock, FileText } from 'lucide-react';
import { SUBJECTS } from '@/data/subjects';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('auth_token');

export default function MentorCourses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', domain: '', description: '', duration: 10
  });

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    const res = await fetch(`${API}/courses/my`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const d = await res.json(); setCourses(d.courses || []); }
  };

  const resetForm = () => { setForm({ title: '', domain: '', description: '', duration: 10 }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `${API}/courses/${editingId}` : `${API}/courses`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast({ title: editingId ? 'Course Updated!' : 'Course Created!' });
      resetForm();
      loadCourses();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const deleteCourse = async (id: number) => {
    if (!confirm('Delete this course? All assignments will also be deleted.')) return;
    await fetch(`${API}/courses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    toast({ title: 'Course Deleted' });
    loadCourses();
  };

  const editCourse = (course: any) => {
    setForm({ title: course.title, domain: course.domain, description: course.description || '', duration: course.duration });
    setEditingId(course.id);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/mentor/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-sm text-muted-foreground">Create and manage courses for your students</p>
          </div>
        </div>
        {!showForm && (
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Course
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card className="mb-6 border-green-200" style={{ borderLeft: '4px solid #10b981' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{editingId ? 'Edit Course' : 'Create New Course'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course Title *</label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Data Structures & Algorithms" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Domain / Subject *</label>
                  <select value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm" required>
                    <option value="">-- Select Subject --</option>
                    {(SUBJECTS as any[]).map((s: any) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What will students learn in this course?" rows={3} />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                <Input type="number" min="1" max="200" value={form.duration}
                  onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 10 })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                  {loading ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses List */}
      {courses.length === 0 && !showForm ? (
        <Card className="p-8 text-center border-dashed border-2">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No courses yet. Create your first course!</p>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create First Course
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course: any) => (
            <Card key={course.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{course.title}</h3>
                    <Badge className="bg-green-100 text-green-700">{course.domain}</Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />{course.duration}h
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {course.student_count || 0} students enrolled
                    </span>
                    <span className="text-gray-400">Created {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/mentor-assignments?course=${course.id}`)}>
                    <FileText className="h-4 w-4 mr-1" /> Assignments
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => editCourse(course)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteCourse(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
