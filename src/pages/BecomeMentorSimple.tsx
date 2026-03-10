import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Simple subjects data
const SUBJECTS = [
  { id: '1', title: 'Mathematics' },
  { id: '2', title: 'Science' },
  { id: '3', title: 'English' },
  { id: '4', title: 'History' },
  { id: '5', title: 'Computer Science' }
];

export default function BecomeMentorSimple() {
  const navigate = useNavigate();
  const { becomeMentor } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    availability: 'Weekdays 6-8 PM'
  });

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one subject',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const selectedSubjectsTitles = SUBJECTS
        .filter(s => selectedSubjects.includes(s.id))
        .map(s => s.title);

      const result = await becomeMentor({
        username: formData.name,
        bio: formData.bio,
        college_email: 'test@test.com',
        subjects: selectedSubjectsTitles,
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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Become a Mentor - Simple Test</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              console.log('Name input:', e.target.value);
              setFormData(prev => ({ ...prev, name: e.target.value }));
            }}
            placeholder="Your name"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Subjects you can teach *:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => {
                  console.log('Subject toggled:', subject.title);
                  toggleSubject(subject.id);
                }}
                style={{
                  padding: '6px 12px',
                  border: selectedSubjects.includes(subject.id) ? '1px solid #007bff' : '1px solid #ccc',
                  backgroundColor: selectedSubjects.includes(subject.id) ? '#007bff' : '#fff',
                  color: selectedSubjects.includes(subject.id) ? '#fff' : '#333',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {subject.title}
                {selectedSubjects.includes(subject.id) && ' ✓'}
              </button>
            ))}
          </div>
          {selectedSubjects.length === 0 && (
            <p style={{ color: 'red', fontSize: '12px' }}>Please select at least one subject</p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Bio:</label>
          <textarea
            value={formData.bio}
            onChange={(e) => {
              console.log('Bio input:', e.target.value);
              setFormData(prev => ({ ...prev, bio: e.target.value }));
            }}
            placeholder="Tell us about yourself"
            rows={4}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Availability:</label>
          <input
            type="text"
            value={formData.availability}
            onChange={(e) => {
              console.log('Availability input:', e.target.value);
              setFormData(prev => ({ ...prev, availability: e.target.value }));
            }}
            placeholder="When are you available?"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Creating...' : 'Become a Mentor'}
        </button>
      </form>
    </div>
  );
}
