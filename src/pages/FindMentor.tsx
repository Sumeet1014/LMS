import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Star, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Mentor {
  id: string;
  user_id: string;
  username: string;
  bio: string;
  subjects: string[];
  rating: number;
  is_mentor: boolean;
}

export default function FindMentor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profiles/mentors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch mentors');

      const data = await response.json();

      // Parse subjects if they are strings
      const processedMentors = (data.mentors || []).map((m: any) => ({
        ...m,
        subjects: typeof m.subjects === 'string' ? JSON.parse(m.subjects) : (m.subjects || [])
      }));

      setMentors(processedMentors);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load mentors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSession = async (mentorId: number | string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      // Get subjects first
      const subjectsResponse = await fetch(`${import.meta.env.VITE_API_URL}/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      let subjectId = null;
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        // Use first subject as default
        if (subjectsData.subjects && subjectsData.subjects.length > 0) {
          subjectId = subjectsData.subjects[0].id;
        }
      }
      
      const proposedTime = new Date();
      proposedTime.setDate(proposedTime.getDate() + 1);

      const requestBody: any = {
        mentor_id: mentorId,
        title: 'Study Session Request',
        requested_time: proposedTime.toISOString(),
        duration: 60
      };
      
      // Only add subject_id if we have one
      if (subjectId) {
        requestBody.subject_id = subjectId;
      }

      console.log('Sending session request:', requestBody);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send request');
      }

      toast({
        title: 'Success',
        description: 'Session request sent to mentor!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send request',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading mentors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="floating-bubbles" />

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-magic">Find a Mentor</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {mentors.length === 0 ? (
          <Card className="card-clean text-center">
            <CardContent className="py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No mentors available</h3>
              <p className="text-muted-foreground">Check back later or become a mentor yourself!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="card-clean">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{mentor.username || 'Anonymous Mentor'}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{Number(mentor.rating || 0).toFixed(1)}</span>
                    </div>
                  </CardTitle>
                  <CardDescription>Expert Mentor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Subject Expertise */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Subject Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {mentor.subjects?.length > 0 ? mentor.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary">
                            {subject}
                          </Badge>
                        )) : <Badge variant="outline">No subjects listed</Badge>}
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Availability
                      </h4>
                      {mentor.availability?.length > 0 ? (
                        <div className="space-y-1">
                          {mentor.availability.map((slot: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1">
                              <span className="font-medium">{slot.day}</span>
                              <span className="text-muted-foreground">{slot.start_time} – {slot.end_time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No availability listed</p>
                      )}
                    </div>

                    {/* Request Button */}
                    <Button
                      className="w-full btn-primary"
                      onClick={() => handleRequestSession(mentor.user_id || mentor.id)}
                    >
                      Request Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
