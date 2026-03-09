import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AiHelper({ sessionId }) {
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!question.trim()) return;
    setLoading(true);
    setReply('');

    let access;
    try {
      const { data } = await supabase.auth.getSession();
      access = data?.session?.access_token;
    } catch (e) {
      console.warn('session fetch failed', e);
    }

    if (!access) {
      alert('Please sign in to use the assistant.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
        body: JSON.stringify({ sessionId, message: question })
      });
      const j = await res.json();
      if (!res.ok) {
        alert('AI error: ' + (j.error || j.detail || 'unknown'));
      } else {
        setReply(j.reply);
      }
    } catch (err) {
      console.error('ai call failed', err);
      alert('Network error');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  }

  return (
    <div className="max-w-md border border-border p-3 rounded-lg bg-card">
      <h4 className="text-lg font-semibold mb-2">Study Circle Helper</h4>
      <textarea
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about scheduling, study tips, or site help..."
        className="w-full p-2 border border-border rounded-md resize-none bg-background"
      />
      <div className="flex gap-2 mt-2">
        <button 
          onClick={send} 
          disabled={loading || !question.trim()}
          className="px-3 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Ask AI'}
        </button>
        <button 
          onClick={() => { setQuestion(''); setReply(''); }}
          className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md"
        >
          Clear
        </button>
      </div>

      {reply && (
        <div className="mt-3 bg-muted p-3 rounded-md">
          <div dangerouslySetInnerHTML={{ __html: reply.replace(/\n/g, '<br/>') }} />
        </div>
      )}
    </div>
  );
}