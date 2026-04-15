import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_name?: string;
}

interface SessionChatProps {
  roomId: string; // This corresponds to session_id
}

export default function SessionChat({ roomId }: SessionChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { emit, on, off } = useSocket(roomId);

  // Load existing messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/video-chat/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
    loadMessages();
  }, [roomId]);

  // Handle incoming socket messages
  useEffect(() => {
    const handleMessage = (data: any) => {
      // Data format from backend: { sessionId, message, userId, userName, ... }
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        user_id: data.userId,
        message: data.message,
        created_at: new Date().toISOString(),
        user_name: data.userName
      }]);
    };

    on('chat-message', handleMessage);
    return () => off('chat-message', handleMessage);
  }, [on, off]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      // 1. Save to database via API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/video-chat/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to save message');

      const resData = await response.json();

      // 2. Broadcast via socket
      emit('chat-message', {
        message: newMessage.trim(),
        userId: user.id,
        userName: user.name || 'Anonymous',
      });

      // 3. Update local state
      setMessages(prev => [...prev, resData.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ minHeight: '400px' }}>
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-sm text-gray-800">💬 Session Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg) => {
          const isOwnMessage = String(msg.user_id) === String(user?.id);
          return (
            <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {!isOwnMessage && msg.user_name && (
                  <p className="text-xs font-medium text-gray-500 mb-1">{msg.user_name}</p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." disabled={sending} className="flex-1 text-gray-800" />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
