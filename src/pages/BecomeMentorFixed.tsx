import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SUBJECTS } from '@/data/subjects';

export default function BecomeMentorFixed() {
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

    // Ensure bio meets minimum 10 character requirement
    const bio = formData.bio.trim() || `I am an experienced educator passionate about teaching ${SUBJECTS.filter((s: any) => selectedSubjects.includes(s.id)).map((s: any) => s.title).join(' and ')}. I have extensive knowledge in these subjects and enjoy helping students learn and succeed.`;

    // Ensure username meets minimum 2 character requirement
    const username = (formData.name || user.name || user.email.split('@')[0]).trim();

    if (username.length < 2) {
      toast({
        title: 'Error',
        description: 'Name must be at least 2 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (bio.length < 10) {
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
        bio: bio,
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '20px 0',
      position: 'relative'
    }}>
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
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Become a Mentor</h1>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          padding: '24px',
          transform: 'none !important'
        }}>
          <h2 style={{ marginBottom: '24px' }}>Create Your Mentor Profile</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Name */}
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>Subjects you can teach *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SUBJECTS.map((subject: any) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => toggleSubject(subject.id)}
                    style={{
                      padding: '8px 16px',
                      border: selectedSubjects.includes(subject.id) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      backgroundColor: selectedSubjects.includes(subject.id) ? '#3b82f6' : 'white',
                      color: selectedSubjects.includes(subject.id) ? 'white' : 'black',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      pointerEvents: 'auto',
                      userSelect: 'none'
                    }}
                  >
                    {subject.title}
                    {selectedSubjects.includes(subject.id) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Availability</label>
              <input
                id="availability"
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
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
              <label htmlFor="bio" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Short Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
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
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: loading ? '#ccc' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                pointerEvents: loading ? 'none' : 'auto'
              }}
            >
              {loading ? 'Creating Profile...' : 'Become a Mentor'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
