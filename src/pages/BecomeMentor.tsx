import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SUBJECTS } from '@/data/subjects';

export default function BecomeMentor() {
  const navigate = useNavigate();
  const { user, becomeMentor } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    availability: 'Weekdays 6-8 PM'
  });

  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one subject to teach',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await becomeMentor({
        username: formData.name,
        bio: formData.bio,
        college_email: user.email,
        subjects: SUBJECTS.filter((s: any) => selectedSubjects.includes(s.id)).map((s: any) => s.title),
        availability: formData.availability
      } as any);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success',
        description: 'Mentor profile created successfully!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create mentor profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="floating-bubbles" />

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-magic">Become a Mentor</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="card-clean">
          <CardHeader>
            <CardTitle>Create Your Mentor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Subjects */}
              <div className="space-y-3">
                <Label>Subjects you can teach *</Label>

                {/* Available subjects */}
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((subject: any) => (
                    <Badge
                      key={subject.id}
                      variant={selectedSubjects.includes(subject.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSubject(subject.id)}
                    >
                      {subject.title}
                      {selectedSubjects.includes(subject.id) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="e.g., Weekdays 6-8 PM, Weekends 2-5 PM"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell students about your teaching experience and approach..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Creating Profile...' : 'Become a Mentor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
