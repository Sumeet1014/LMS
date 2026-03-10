import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SUBJECTS } from '@/data/subjects';

export default function BecomeMentorWorking() {
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
      alert('Please select at least one subject to teach');
      return;
    }

    // Ensure name meets minimum 2 character requirement
    const username = (name || user.name || user.email.split('@')[0]).trim();
    if (username.length < 2) {
      alert('Name must be at least 2 characters long');
      return;
    }

    // Ensure bio meets minimum 10 character requirement
    const finalBio = bio.trim() || `I am an experienced educator passionate about teaching ${SUBJECTS.filter((s: any) => selectedSubjects.includes(s.id)).map((s: any) => s.title).join(' and ')}. I have extensive knowledge in these subjects and enjoy helping students learn and succeed.`;

    if (finalBio.length < 10) {
      alert('Bio must be at least 10 characters long');
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

      alert('Mentor profile created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Failed to create mentor profile');
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
        <h1 style={{ margin: '20px 0', fontSize: '24px' }}>Become a Mentor</h1>
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
        
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
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
          <div style={{ marginBottom: '20px' }}>
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
          <div style={{ marginBottom: '20px' }}>
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
          <div style={{ marginBottom: '20px' }}>
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
            {loading ? 'Creating Profile...' : 'Become a Mentor'}
          </button>
        </form>
      </div>
    </div>
  );
}
