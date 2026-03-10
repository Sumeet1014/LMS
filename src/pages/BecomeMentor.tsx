import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [name, setName] = useState(user?.name || '');
  const [availability, setAvailability] = useState('Weekdays 6-8 PM');
  const [bio, setBio] = useState('');

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

    // Ensure name meets minimum 2 character requirement
    const username = (name || user.name || user.email.split('@')[0]).trim();
    if (username.length < 2) {
      toast({
        title: 'Error',
        description: 'Name must be at least 2 characters long',
        variant: 'destructive',
      });
      return;
    }

    // Ensure bio meets minimum 10 character requirement
    const finalBio = bio.trim() || `I am an experienced educator passionate about teaching ${SUBJECTS.filter((s: any) => selectedSubjects.includes(s.id)).map((s: any) => s.title).join(' and ')}. I have extensive knowledge in these subjects and enjoy helping students learn and succeed.`;

    if (finalBio.length < 10) {
      toast({
        title: 'Error',
        description: 'Bio must be at least 10 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await becomeMentor({
        username: username,
        bio: finalBio,
        college_email: user.email,
        subjects: SUBJECTS
          .filter((s: any) => selectedSubjects.includes(s.id))
          .map((s: any) => s.title),
        availability: availability
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px 0' }}>
      <style>{`
        .card-clean {
          transform: none !important;
        }
        input, textarea, select {
          transform: none !important;
          pointer-events: auto !important;
        }
      `}</style>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 0', marginBottom: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Become a Mentor</h1>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <Card style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <CardHeader>
            <CardTitle>Create Your Mentor Profile</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Name */}
              <div>
                <Label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name *</Label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #3b82f6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                />
              </div>

              {/* Subjects */}
              <div>
                <Label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>Subjects you can teach *</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SUBJECTS.map((subject: any) => (
                    <Badge
                      key={subject.id}
                      variant={selectedSubjects.includes(subject.id) ? "default" : "outline"}
                      style={{ cursor: 'pointer', padding: '8px 16px' }}
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
              <div>
                <Label htmlFor="availability" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Availability</Label>
                <input
                  id="availability"
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Weekdays 6-8 PM, Weekends 2-5 PM"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #3b82f6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Short Bio</Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about your teaching experience and approach..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #3b82f6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                />
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                disabled={loading} 
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Creating Profile...' : 'Become a Mentor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}