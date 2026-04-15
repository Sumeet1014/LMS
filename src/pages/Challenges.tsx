import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Calendar, BookOpen, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import QuizModal from '@/components/QuizModal';

interface Challenge {
  id: string;
  title: string;
  subject: string;
  description: string;
  start_date: string;
  end_date: string;
  target_value: number;
  points_reward: number;
  is_active: boolean;
}

interface ChallengeProgress {
  current_value: number;
  completed: boolean;
}

export default function Challenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>({});
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      // Fetch challenges
      const challengesRes = await fetch(`${import.meta.env.VITE_API_URL}/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!challengesRes.ok) throw new Error('Failed to fetch challenges');
      const challengesData = await challengesRes.json();
      setChallenges(challengesData.challenges || []);

      // Fetch progress
      const progressRes = await fetch(`${import.meta.env.VITE_API_URL}/challenges/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        const progressMap: Record<string, ChallengeProgress> = {};
        (progressData.progress || []).forEach((p: any) => {
          progressMap[p.challenge_id] = {
            current_value: p.current_value,
            completed: p.completed,
          };
        });
        setProgress(progressMap);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsQuizOpen(true);
  };

  const handleQuizComplete = () => {
    fetchChallenges(); // Refresh progress after quiz completion
  };

  const getProgressPercentage = (challenge: Challenge) => {
    const prog = progress[challenge.id];
    if (!prog) return 0;
    return Math.min((prog.current_value / challenge.target_value) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 mr-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Quizzes & Challenges</h1>
            <p className="text-muted-foreground">Test your knowledge and earn certificates</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => {
            const userProgress = progress[challenge.id];
            const hasCompleted = userProgress?.completed;
            const percentage = getProgressPercentage(challenge);

            return (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow relative overflow-hidden">
                {hasCompleted && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Passed
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {challenge.points_reward} pts
                    </span>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Subject: {challenge.subject}</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      5 questions • 10 marks each • Total: 50 marks
                    </div>

                    {userProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Best Score</span>
                          <span className="font-semibold">
                            {userProgress.current_value} / {challenge.target_value}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )}

                    <Button
                      onClick={() => startQuiz(challenge)}
                      className="w-full"
                      variant={hasCompleted ? 'outline' : 'default'}
                    >
                      {hasCompleted ? 'Retake Quiz' : userProgress ? 'Continue Quiz' : 'Start Quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No quizzes available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later for new challenges!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedChallenge && user && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          challengeId={selectedChallenge.id}
          challengeTitle={selectedChallenge.title}
          userId={user.id}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}
