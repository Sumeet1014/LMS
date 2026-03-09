import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionConfirmationProps {
  session: {
    id: string;
    title: string;
    subject: string;
    start_ts: string;
    end_ts: string;
    status: string;
    student_id: string;
    teacher_id: string;
  };
  teacherEmail?: string;
  studentEmail?: string;
  onConfirm?: () => void;
}

export default function SessionConfirmation({
  session,
  teacherEmail,
  studentEmail,
  onConfirm
}: SessionConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions/${session.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm session');
      }

      toast({
        title: 'Session Confirmed!',
        description: 'Session confirmed successfully',
      });

      onConfirm?.();
    } catch (error: any) {
      console.error('Error confirming session:', error);
      toast({
        title: 'Confirmation Failed',
        description: error.message || 'Failed to confirm session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Confirm Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">{session.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            Subject: {session.subject}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDateTime(session.start_ts)} - {formatDateTime(session.end_ts)}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                🎯 Smart Session Management
              </p>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <p>✅ Automatic calendar event creation</p>
                <p>🔗 Google Meet link generation</p>
                <p>📧 Calendar invites sent to all participants</p>
                <p>⏰ Smart reminders before the session</p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Calendar Event...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Confirm Session & Create Meeting
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}