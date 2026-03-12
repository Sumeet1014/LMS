import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SUBJECTS } from '@/data/subjects';

export default function CreateMentorProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [mentorName, setMentorName] = useState('');
  const [availability, setAvailability] = useState('Weekdays 6-8 PM');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject to teach');
      return;
    }

    if (mentorName.length < 2) {
      alert('Mentor name must be at least 2 characters long');
      return;
    }

    const finalBio = bio.trim() || `I am an experienced educator passionate about teaching ${SUBJECTS.filter((s: any) => selectedSubjects.includes(s.id)).map((s: any) => s.title).join(' and ')}. I have extensive knowledge in these subjects and enjoy helping students learn and succeed.`;

    if (finalBio.length < 10) {
      alert('Bio must be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/become-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: mentorName,
          bio: finalBio,
          college_email: user.email,
          subjects: SUBJECTS
            .filter((s: any) => selectedSubjects.includes(s.id))
            .map((s: any) => s.title),
          availability: availability
        })
      });

      const result = await response.json();

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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f0f0f0', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ margin: '20px 0', fontSize: '24px' }}>Create New Mentor Profile</h1>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '30px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Create Your Mentor Profile</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Mentor Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Mentor Name *
            </label>
            <input
              type="text"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              placeholder="e.g., Math Tutor, Science Teacher"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #007bff',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Subjects */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Subjects you can teach *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUBJECTS.map((subject: any) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  style={{
                    padding: '8px 12px',
                    border: selectedSubjects.includes(subject.id) ? '2px solid #007bff' : '1px solid #ccc',
                    backgroundColor: selectedSubjects.includes(subject.id) ? '#007bff' : 'white',
                    color: selectedSubjects.includes(subject.id) ? 'white' : 'black',
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
          </div>

          {/* Availability */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Availability
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g., Weekdays 6-8 PM, Weekends 2-5 PM"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #007bff',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Short Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about your teaching experience and approach..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #007bff',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit'
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
              fontWeight: 'bold',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Profile...' : 'Create Mentor Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
