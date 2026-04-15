import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('auth_token');

export default function SubmitAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API}/assignments/student`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => {
        const a = (d.assignments || []).find((a: any) => String(a.id) === String(id));
        setAssignment(a);
        if (a?.submission_status) setSubmitted(true);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API}/assignments/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ file_url: fileUrl, pages: parseInt(pages) || null })
    });
    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      toast({ title: 'Assignment Submitted!', description: 'Your mentor will review and grade it.' });
    } else {
      const d = await res.json();
      toast({ title: 'Error', description: d.error, variant: 'destructive' });
    }
  };

  if (!assignment) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">Submit Assignment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{assignment.description}</p>
          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            <span>📅 Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
            <span>🎯 Total Marks: {assignment.total_marks}</span>
            <span>📚 {assignment.course_title}</span>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700">Assignment Submitted!</h3>
              <p className="text-muted-foreground mt-2">
                {assignment.submission_status === 'reviewed'
                  ? `Graded: ${assignment.marks_obtained} / ${assignment.total_marks} marks`
                  : 'Waiting for mentor to review and grade.'}
              </p>
              <Button className="mt-4" variant="outline" onClick={() => navigate('/my-courses')}>
                Back to My Courses
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Submission Link / File URL</label>
                <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                  placeholder="e.g., Google Drive link, GitHub link, etc." required />
                <p className="text-xs text-muted-foreground mt-1">Share a link to your work (Google Drive, GitHub, etc.)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Pages (optional)</label>
                <Input type="number" min="1" value={pages} onChange={e => setPages(e.target.value)} placeholder="e.g., 5" />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-primary">
                <Upload className="mr-2 h-4 w-4" />
                {loading ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
