import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Trophy, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizOption {
  id: string;
  option_text: string;
  option_order: number;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  marks: number;
  question_order: number;
  quiz_options: QuizOption[];
}

interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  certificateUrl?: string;
  answers: { questionId: string; selectedOptionId: string; isCorrect: boolean }[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  challengeTitle: string;
  userId: string;
  onComplete?: (result: QuizResult) => void;
}

export default function QuizModal({
  isOpen,
  onClose,
  challengeId,
  challengeTitle,
  userId,
  onComplete
}: QuizModalProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (isOpen && challengeId) {
      fetchQuestions();
    }
  }, [isOpen, challengeId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/quizzes/questions/${challengeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();

      const sortedQuestions = (data.questions || []).map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        marks: q.marks,
        question_order: q.question_order,
        quiz_options: (q.options || []).map((o: any) => ({
          id: o.id, // Ensure your backend returns the option ID
          option_text: o.option_text,
          option_order: o.option_order
        })).sort((a: any, b: any) => a.option_order - b.option_order)
      }));

      setQuestions(sortedQuestions);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load quiz questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: 'Incomplete',
        description: 'Please answer all questions before submitting',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/quizzes/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId,
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            question_id: questionId,
            selected_option_id: optionId
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();

        setResult({
          score: data.score,
          total: data.total,
          passed: data.passed,
          certificateUrl: data.certificateUrl,
          answers: [] // We could populate this if backend returned details
        });
        onComplete?.(data);

        if (data.passed) {
          toast({
            title: '🎉 Congratulations!',
            description: `You passed with ${data.score}/${data.total} marks! Certificate generated.`
          });
        } else {
          toast({
            title: 'Quiz Completed',
            description: `You scored ${data.score}/${data.total}. Keep learning!`
          });
        }
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit quiz',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    onClose();
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {challengeTitle}
          </DialogTitle>
          <DialogDescription>
            Answer all questions to complete the quiz and earn your certificate
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading questions...</div>
        ) : result ? (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-4">
              {result.passed ? (
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Award className="h-16 w-16 text-green-600" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20">
                    <Trophy className="h-16 w-16 text-orange-500" />
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold">
                {result.passed ? 'Congratulations! 🎉' : 'Keep Learning!'}
              </h2>

              <div className="text-4xl font-bold text-primary">
                {result.score} / {result.total}
              </div>

              <p className="text-muted-foreground">
                {result.passed
                  ? 'You passed the quiz and earned a certificate!'
                  : 'You need 60% or more to pass. Try again!'}
              </p>

              {result.certificateUrl && (
                <Button asChild className="mt-4">
                  <a href={result.certificateUrl} target="_blank" rel="noopener noreferrer">
                    View Certificate
                  </a>
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Your Answers:</h3>
              {questions.map((q, idx) => {
                const answer = result.answers.find(a => a.questionId === q.id);
                return (
                  <Card key={q.id} className="p-3">
                    <div className="flex items-start gap-2">
                      {answer?.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          Q{idx + 1}: {q.question_text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {q.marks} marks
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{question?.marks} marks</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {question && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{question.question_text}</h3>

                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleSelectOption(question.id, value)}
                  className="space-y-3"
                >
                  {question.quiz_options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${answers[question.id] === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                        }`}
                      onClick={() => handleSelectOption(question.id, option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer flex-1">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length < questions.length}
                  className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-200 dark:hover:bg-slate-300 dark:text-slate-900"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  disabled={!answers[question?.id]}
                  className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-200 dark:hover:bg-slate-300 dark:text-slate-900"
                >
                  Next
                </Button>
              )}
            </div>

            <div className="flex justify-center gap-1.5 pt-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${answers[q.id]
                    ? 'bg-primary'
                    : idx === currentQuestion
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30'
                    }`}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
