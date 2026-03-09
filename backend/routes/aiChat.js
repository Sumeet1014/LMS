const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// AI Chat endpoint (migrated from existing server)
router.post('/ai-chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user.id;

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

    const systemPrompt = `You are Study Circle assistant. Be short, polite and practical. Give study tips, scheduling help, or simple troubleshooting. If user asks for code provide a minimal runnable snippet. If outside scope (medical/legal), politely decline.`;

    // Load recent messages for context
    let contextMessages = [];
    if (sessionId) {
      const recent = await executeQuery(
        `SELECT user_id, content, created_at
         FROM session_messages
         WHERE session_id = ?
         ORDER BY created_at DESC LIMIT 6`,
        [sessionId]
      );
      
      contextMessages = recent.reverse().map(r => ({ 
        role: 'user', 
        content: r.content 
      }));
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 400,
        temperature: 0.2
      })
    });

    if (!openaiResp.ok) {
      const txt = await openaiResp.text();
      console.error('OpenAI error', txt);
      return res.status(500).json({ error: 'ai_service_error', detail: txt });
    }

    const data = await openaiResp.json();
    const assistant = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    // Save chat to database
    try {
      const chatId = uuidv4();
      await executeQuery(
        'INSERT INTO ai_chats (id, session_id, user_id, user_message, assistant_reply, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [chatId, sessionId || null, userId, message, assistant, new Date().toISOString().slice(0, 19).replace('T', ' ')]
      );
    } catch (e) {
      console.warn('ai_chats save failed', e.message || e);
    }

    return res.json({ reply: assistant });
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
