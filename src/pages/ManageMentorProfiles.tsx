import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ArrowLeft, Clock, BookOpen, Star, Users } from 'lucide-react';
import { SUBJECTS } from '@/data/subjects';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface TimeSlot { day: string; start_time: string; end_time: string; }

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
    hourly_rate: 0,
    availability: [{ day: 'Monday', start_time: '09:00', end_time: '17:00' }] as TimeSlot[]
  });

  useEffect(() => { loadProfiles(); }, []);

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

  const resetForm = () => ({
    profile_name: '', bio: '', subjects: [],
    expertise_level: 'intermediate', hourly_rate: 0,
    availability: [{ day: 'Monday', start_time: '09:00', end_time: '17:00' }] as TimeSlot[]
  });

  const addSlot = () => setFormData(p => ({ ...p, availability: [...p.availability, { day: 'Monday', start_time: '09:00', end_time: '17:00' }] }));
  const removeSlot = (i: number) => setFormData(p => ({ ...p, availability: p.availability.filter((_, idx) => idx !== i) }));
  const updateSlot = (i: number, field: keyof TimeSlot, val: string) =>
    setFormData(p => ({ ...p, availability: p.availability.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one subject', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/mentor-profiles/${editingId}`
        : `${import.meta.env.VITE_API_URL}/mentor-profiles`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok) {
        toast({ title: editingId ? 'Profile Updated' : 'Profile Created', description: 'Saved successfully' });
        setShowForm(false);
        setEditingId(null);
        setFormData(resetForm());
        await loadProfiles();
      } else {
        const errorMsg = result.details
          ? result.details.map((d: any) => d.msg).join(', ')
          : result.error;
        throw new Error(errorMsg || 'Failed to save profile');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profile) => {
    const normalizedSubjects = (Array.isArray(profile.subjects) ? profile.subjects : [])
      .map((s: any) => typeof s === 'object' ? s.title : s);
    const normalizedAvailability = Array.isArray(profile.availability) && profile.availability.length > 0
      ? profile.availability
      : [{ day: 'Monday', start_time: '09:00', end_time: '17:00' }];
    setFormData({
      profile_name: profile.profile_name,
      bio: profile.bio,
      subjects: normalizedSubjects,
      expertise_level: profile.expertise_level,
      hourly_rate: profile.hourly_rate,
      availability: normalizedAvailability
    });
    setEditingId(profile.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mentor profile?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mentor-profiles/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: 'Profile Deleted' });
        loadProfiles();
      }
    } catch {
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

  if (loading && !showForm) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-3xl font-bold">My Mentor Profile</h1>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditingId(null); setFormData(resetForm()); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Create New Profile
          </Button>
        )}
      </div>

      {showForm ? (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit' : 'Create'} Mentor Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide">Basic Info</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Profile Name *</label>
                <Input value={formData.profile_name} onChange={e => setFormData({ ...formData, profile_name: e.target.value })}
                  placeholder="e.g., DSA Expert, Python Tutor" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio *</label>
                <Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell students about your teaching experience and approach..." rows={4} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expertise Level</label>
                  <select value={formData.expertise_level} onChange={e => setFormData({ ...formData, expertise_level: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hourly Rate (₹)</label>
                  <Input type="number" min="0" step="1" value={formData.hourly_rate}
                    onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="0 = Free" />
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">Subjects You Teach *</h3>

              {/* Selected subjects as tags */}
              {formData.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  {formData.subjects.map((s: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                      {s}
                      <button type="button" onClick={() => toggleSubject(s)} className="ml-1 hover:text-red-200">✕</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Predefined subjects grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {(SUBJECTS as any[]).map(subject => (
                  <label key={subject.id} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${formData.subjects.includes(subject.title) ? 'bg-green-50 border-green-400' : 'hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={formData.subjects.includes(subject.title)} onChange={() => toggleSubject(subject.title)} className="accent-green-600" />
                    <span className="text-xs">{subject.title}</span>
                  </label>
                ))}
              </div>

              {/* Custom subject input */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  id="custom-subject"
                  placeholder="Add a custom subject not in the list..."
                  className="flex-1 p-2 border rounded-md text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !formData.subjects.includes(val)) {
                        setFormData(prev => ({ ...prev, subjects: [...prev.subjects, val] }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  onClick={() => {
                    const input = document.getElementById('custom-subject') as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val && !formData.subjects.includes(val)) {
                      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, val] }));
                      input.value = '';
                    }
                  }}
                >
                  + Add
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Press Enter or click + Add to add a custom subject</p>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">Availability</h3>
              <div className="space-y-2">
                {formData.availability.map((slot, i) => (
                  <div key={i} className="flex gap-2 items-center flex-wrap">
                    <select value={slot.day} onChange={e => updateSlot(i, 'day', e.target.value)}
                      className="p-2 border rounded-md text-sm flex-1 min-w-[120px]">
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" value={slot.start_time} onChange={e => updateSlot(i, 'start_time', e.target.value)}
                      className="p-2 border rounded-md text-sm" />
                    <span className="text-sm text-gray-500">to</span>
                    <input type="time" value={slot.end_time} onChange={e => updateSlot(i, 'end_time', e.target.value)}
                      className="p-2 border rounded-md text-sm" />
                    {formData.availability.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeSlot(i)}>✕</Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addSlot}>
                <Plus className="h-3 w-3 mr-1" /> Add Time Slot
              </Button>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading || formData.subjects.length === 0} className="bg-green-600 hover:bg-green-700">
                {loading ? 'Saving...' : editingId ? 'Update Profile' : 'Create Profile'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setFormData(resetForm()); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No mentor profiles yet. Create one to start teaching!</p>
              <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Create Your First Profile</Button>
            </Card>
          ) : (
            profiles.map((profile: any) => (
              <Card key={profile.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{profile.profile_name}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">{profile.expertise_level}</span>
                      {profile.hourly_rate > 0 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">₹{profile.hourly_rate}/hr</span>}
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">{profile.bio}</p>

                    {/* Subjects */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(Array.isArray(profile.subjects) ? profile.subjects : []).map((s: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                          {typeof s === 'object' ? s.title : s}
                        </span>
                      ))}
                    </div>

                    {/* Availability */}
                    {Array.isArray(profile.availability) && profile.availability.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><Clock className="h-3 w-3" /> Availability</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.availability.map((slot: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {slot.day} {slot.start_time?.substring(0,5)} – {slot.end_time?.substring(0,5)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{parseFloat(profile.rating || 0).toFixed(1)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{profile.total_sessions} sessions</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(profile)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}><Trash2 className="h-4 w-4" /></Button>
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

