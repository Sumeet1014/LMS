import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  source?: string;
}

interface AIChatBotProps {
  sessionId?: string;
  className?: string;
}

export default function AIChatBot({ sessionId, className = '' }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '👋 Hi! I\'m StudyBot powered by Gemini AI! Ask me anything about study tips, courses, scheduling, or the platform.\n\n💡 AI mode is ON by default for smart responses.',
      sender: 'bot',
      timestamp: new Date(),
      source: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: sessionId,
          use_ai: useAI
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.reply || 'Sorry, I couldn\'t process that.',
        sender: 'bot',
        timestamp: new Date(),
        source: data.source || (useAI ? 'ai' : 'local')
      };

      setMessages(prev => [...prev, botMessage]);

      // Show tip if using local responses
      if (data.tip && !useAI) {
        toast({
          title: '💡 Tip',
          description: data.tip,
          duration: 5000
        });
      }

    } catch (error: any) {
      console.error('Chat error:', error);

      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: '⚠️ Oops! Something went wrong. Try asking something else.',
        sender: 'bot',
        timestamp: new Date(),
        source: 'error'
      }]);

      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      text: '👋 Chat cleared! Ask me anything about Study Circle.',
      sender: 'bot',
      timestamp: new Date(),
      source: 'system'
    }]);
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg">StudyBot 🤖</h3>
            <p className="text-xs text-muted-foreground">
              Ask about challenges, tips & badges
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={useAI ? "default" : "outline"}
            onClick={() => {
              setUseAI(!useAI);
              toast({
                title: useAI ? '🔋 Local Mode' : '✨ AI Mode',
                description: useAI
                  ? 'Switched to local responses (free, no API)'
                  : 'Switched to Gemini AI for smart responses'
              });
            }}
            className="gap-1"
          >
            <Sparkles className="w-4 h-4" />
            {useAI ? '✨ AI' : '🔋 Local'}
          </Button>
          <Button size="sm" variant="ghost" onClick={clearChat}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground ml-12'
                  : 'bg-muted mr-12'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.source && msg.source !== 'system' && (
                  <p className="text-xs opacity-70 mt-1">
                    {msg.source.includes('local') ? '🔋 Free' : '✨ AI'}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-2 mr-12">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about study tips, challenges..."
            disabled={loading}
            maxLength={500}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {useAI ? '✨ Gemini AI mode active' : '🔋 Local mode (no AI)'}
        </p>
      </div>
    </Card>
  );
}