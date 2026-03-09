import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PROFANITY_LIST = ['badword1', 'badword2', 'badword3', 'fuck', 'shit', 'ass', 'damn', 'bitch', 'crap', 'dick', 'bastard'];

interface RatingModalProps {
  sessionId: string;
  raterId: string;
  rateeId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

function containsProfanity(txt: string): boolean {
  if (!txt) return false;
  const lowered = txt.toLowerCase();
  for (const w of PROFANITY_LIST) {
    const re = new RegExp(`(^|\\W)${w}($|\\W)`, 'i');
    if (re.test(lowered)) return true;
  }
  return false;
}

export default function RatingModal({ sessionId, raterId, rateeId, onClose, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (containsProfanity(comment)) {
      setError('Please remove inappropriate language from your comment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          feedback_text: comment || null,
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit rating');
      }

      toast({
        title: 'Rating submitted',
        description: 'Thank you for your feedback!',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-foreground mb-2">Rate Your Session</h2>
        <p className="text-sm text-muted-foreground mb-6">
          How was your learning experience?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                    }`}
                />
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-foreground">
              Comment (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError(null);
              }}
              rows={4}
              className="mt-2"
              placeholder="Share what went well or what could be improved..."
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
