const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// AI Chat endpoint (migrated from existing server)
router.post('/', async (req, res) => {
  try {
    const { sessionId, message, use_ai } = req.body;
    const userId = req.user.id;

    console.log('AI Chat Request:', { use_ai, aiProvider: process.env.AI_PROVIDER, message: message.substring(0, 50) });

    if (!message || !message.toString().trim()) {
      return res.status(400).json({ error: 'empty_message' });
    }

    // Check session participation if sessionId provided
    if (sessionId) {
      const check = await executeQuery(
        'SELECT 1 FROM session_requests WHERE id = ? AND (mentor_id = ? OR student_id = ?) LIMIT 1',
        [sessionId, userId, userId]
      );
      
      if (check.length === 0) {
        return res.status(403).json({ error: 'not_a_participant' });
      }
    }

    let assistant = '';
    let source = 'local';

    // Use AI whenever provider is configured (ignore use_ai flag if AI is set up)
    const aiProvider = process.env.AI_PROVIDER || 'local';
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    const aiConfigured = (aiProvider === 'gemini' && hasGeminiKey) || (aiProvider === 'openai' && hasOpenAIKey);
    // Always use AI if configured; use_ai from client is just a hint
    const useAI = aiConfigured || (use_ai && aiProvider !== 'local');

    console.log('AI Processing:', { use_ai, aiProvider, useAI });

    if (useAI) {
      try {
        const systemPrompt = `You are Learning Management System assistant. Be short, polite and practical. Give study tips, scheduling help, or simple troubleshooting. If user asks for code provide a minimal runnable snippet. If outside scope (medical/legal), politely decline.`;

        // Load recent messages for context
        let contextMessages = [];
        if (sessionId) {
          try {
            const recent = await executeQuery(
              `SELECT user_id, content, created_at
               FROM session_messages
               WHERE session_id = ?
               ORDER BY created_at DESC LIMIT 6`,
              [sessionId]
            );
            
            contextMessages = recent.reverse().map(r => r.content);
          } catch (e) {
            console.warn('Failed to load session context:', e.message);
            // Continue without context if table doesn't exist
          }
        }

        if (aiProvider === 'gemini') {
          // Google Gemini API
          const geminiKey = process.env.GEMINI_API_KEY;
          console.log('Gemini API Key exists:', !!geminiKey);
          console.log('Gemini API Key valid:', geminiKey && geminiKey !== 'your_gemini_api_key_here');
          
          if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
            const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
            const prompt = `${systemPrompt}\n\nContext: ${contextMessages.join('\n')}\n\nUser: ${message}\n\nAssistant:`;
            
            console.log('Calling Gemini API with model:', model);
            
            try {
              const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [{ text: prompt }]
                  }],
                  generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 400
                  }
                })
              });

              console.log('Gemini API response status:', geminiResp.status);

              if (geminiResp.ok) {
                const data = await geminiResp.json();
                console.log('Gemini API success:', !!data.candidates?.[0]?.content?.parts?.[0]?.text);
                assistant = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                if (assistant) {
                  source = 'gemini';
                  console.log('Using Gemini response');
                } else {
                  console.warn('Gemini returned empty response, falling back to local');
                }
              } else {
                const error = await geminiResp.text();
                console.error('Gemini API error:', geminiResp.status, error);
                console.log('Falling back to local response due to API error');
              }
            } catch (e) {
              console.error('Gemini API request failed:', e.message);
              console.log('Falling back to local response due to network error');
            }
          } else {
            console.warn('Gemini API key not configured, using local response');
          }
        } else if (aiProvider === 'openai') {
          // OpenAI API
          const openaiKey = process.env.OPENAI_API_KEY;
          if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
            const messages = [
              { role: 'system', content: systemPrompt },
              ...contextMessages.map(c => ({ role: 'user', content: c })),
              { role: 'user', content: message }
            ];

            try {
              const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${openaiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                  messages,
                  max_tokens: 400,
                  temperature: 0.2
                })
              });

              if (openaiResp.ok) {
                const data = await openaiResp.json();
                assistant = data.choices?.[0]?.message?.content?.trim() || '';
                source = 'openai';
              } else {
                const error = await openaiResp.text();
                console.warn('OpenAI API error:', openaiResp.status, error);
              }
            } catch (e) {
              console.warn('OpenAI API request failed:', e.message);
            }
          }
        }
      } catch (e) {
        console.warn('AI API processing failed, falling back to local responses:', e.message);
      }
    }

    // Fallback to local responses if AI not available or failed
    if (!assistant) {
      source = 'local';
      const lowerMsg = message.toLowerCase();
      
      if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        assistant = "Hi! I'm StudyBot. Ask me about study tips, challenges, or badges!";
      } else if (lowerMsg.includes('study') || lowerMsg.includes('learn')) {
        assistant = "Great question! Try breaking your study sessions into 25-minute focused blocks (Pomodoro technique). Take short breaks between sessions to stay fresh!";
      } else if (lowerMsg.includes('schedule') || lowerMsg.includes('time')) {
        assistant = "Time management is key! I recommend scheduling your most challenging subjects during your peak focus hours. Use our session booking feature to connect with mentors!";
      } else if (lowerMsg.includes('challenge') || lowerMsg.includes('badge')) {
        assistant = "Check out our Challenges section to earn badges and boost your contribution score! Complete quizzes and attend sessions to unlock achievements.";
      } else if (lowerMsg.includes('mentor') || lowerMsg.includes('help')) {
        assistant = "Need help? Browse our mentor directory to find experts in your subject area. You can book 1-on-1 sessions directly through the platform!";
      } else if (lowerMsg.includes('credit') || lowerMsg.includes('point')) {
        assistant = "Earn credits by attending sessions, completing challenges, and helping other students. Use credits to book premium mentor sessions!";
      } else {
        assistant = "I'm here to help with study tips, scheduling, and platform features. Try asking about challenges, mentors, or study techniques!";
      }
    }

    // Save chat to database
    try {
      const chatId = uuidv4();
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await executeQuery(
        'INSERT INTO ai_chats (id, session_id, user_id, user_message, assistant_reply, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [chatId, sessionId || null, userId, message, assistant, source, timestamp]
      );
    } catch (e) {
      console.warn('Failed to save chat to database:', e.message || e);
      // Don't fail the request if database save fails - still return the response
    }

    return res.json({ reply: assistant, source });
  } catch (err) {
    console.error('ai-chat error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Get AI chat history
router.get('/history', async (req, res) => {
  try {
    const { sessionId, limit = 20 } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT id, session_id, user_message, assistant_reply, created_at
      FROM ai_chats
      WHERE user_id = ?
    `;
    const params = [userId];

    if (sessionId) {
      query += ' AND session_id = ?';
      params.push(sessionId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const chats = await executeQuery(query, params);

    res.json({ chats: chats.reverse() });
  } catch (error) {
    console.error('Get AI chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

module.exports = router;
