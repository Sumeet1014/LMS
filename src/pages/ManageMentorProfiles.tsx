import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { SUBJECTS } from '@/data/subjects';

export default function ManageMentorProfiles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    profile_name: '',
    bio: '',
    subjects: [],
    expertise_level: 'intermediate',
    hourly_rate: 0
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor-profiles/my/profiles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Load profiles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.subjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one subject',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/mentor-profiles/${editingId}`
        : `${import.meta.env.VITE_API_URL}/mentor-profiles`;

      console.log('Submitting to:', url, 'Method:', editingId ? 'PUT' : 'POST');
      console.log('Form data:', formData);

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('Response:', result);

      if (response.ok) {
        toast({
          title: editingId ? 'Profile Updated' : 'Profile Created',
          description: 'Your mentor profile has been saved successfully'
        });
        
        // Reset form
        setShowForm(false);
        setEditingId(null);
        setFormData({
          profile_name: '',
          bio: '',
          subjects: [],
          expertise_level: 'intermediate',
          hourly_rate: 0
        });
        
        // Reload profiles
        await loadProfiles();
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profile) => {
    setFormData({
      profile_name: profile.profile_name,
      bio: profile.bio,
      subjects: profile.subjects,
      expertise_level: profile.expertise_level,
      hourly_rate: profile.hourly_rate
    });
    setEditingId(profile.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mentor profile?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor-profiles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: 'Profile Deleted', description: 'Mentor profile removed successfully' });
        loadProfiles();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete profile', variant: 'destructive' });
    }
  };

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  if (loading && !showForm) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">My Mentor Profiles</h1>
        </div>
        {!showForm && (
          <Button onClick={() => {
            setEditingId(null);
            setFormData({
              profile_name: '',
              bio: '',
              subjects: [],
              expertise_level: 'intermediate',
              hourly_rate: 0
            });
            setShowForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Profile
          </Button>
        )}
      </div>

      {showForm ? (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? 'Edit' : 'Create'} Mentor Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Profile Name</label>
              <Input
                value={formData.profile_name}
                onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                placeholder="e.g., Math Tutor, Python Expert"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell students about your expertise..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subjects (select at least one)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUBJECTS.map(subject => (
                  <label key={subject} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => toggleSubject(subject)}
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expertise Level</label>
              <select
                value={formData.expertise_level}
                onChange={(e) => setFormData({ ...formData, expertise_level: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate (optional)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || formData.subjects.length === 0}>
                {loading ? 'Saving...' : editingId ? 'Update Profile' : 'Create Profile'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    profile_name: '',
                    bio: '',
                    subjects: [],
                    expertise_level: 'intermediate',
                    hourly_rate: 0
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any mentor profiles yet.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Profile
              </Button>
            </Card>
          ) : (
            profiles.map(profile => (
              <Card key={profile.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{profile.profile_name}</h3>
                    <p className="text-muted-foreground mb-3">{profile.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.subjects.map(subject => (
                        <span key={subject} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Level: {profile.expertise_level}</span>
                      <span>Rating: {profile.rating.toFixed(1)} ⭐</span>
                      <span>Sessions: {profile.total_sessions}</span>
                      {profile.hourly_rate > 0 && <span>Rate: ${profile.hourly_rate}/hr</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(profile)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
