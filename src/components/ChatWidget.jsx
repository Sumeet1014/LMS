import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function ChatWidget({ sessionId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    let mounted = true;
    supabase.from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (mounted) setMessages(data || []);
      });

    const channel = supabase
      .channel('public:session_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_messages',
        filter: `session_id=eq.${sessionId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const send = async () => {
    if (!text.trim()) return;
    await supabase.from('session_messages').insert([{
      session_id: sessionId,
      user_id: currentUser.id,
      content: text
    }]);
    setText('');
  };

  return (
    <div className="border rounded-lg p-4 w-80">
      <div className="h-48 overflow-y-auto mb-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`p-2 rounded ${m.user_id === currentUser.id ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}>
            <small className="font-medium">{m.user_id === currentUser.id ? 'You' : 'Other'}</small>
            <div>{m.content}</div>
            <small className="text-gray-500">{new Date(m.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div className="flex">
        <input 
          value={text} 
          onChange={e => setText(e.target.value)}
          className="flex-1 border rounded-l px-3 py-2"
          placeholder="Type message..."
        />
        <button onClick={send} className="px-4 py-2 bg-blue-500 text-white rounded-r">
          Send
        </button>
      </div>
    </div>
  );
}