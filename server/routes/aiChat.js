const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SUPABASE_URL = process.env.SUPABASE_URL;

async function getUserFromSupabaseToken(accessToken) {
  if (!accessToken) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!r.ok) return null;
  return await r.json();
}

async function loadRecentMessages(sessionId, maxRows = 6) {
  if (!sessionId) return [];
  const q = `select user_id, user_email, content, created_at
             from public.session_messages
             where session_id = $1
             order by created_at desc limit $2`;
  const { rows } = await pool.query(q, [sessionId, maxRows]);
  return rows.reverse();
}

router.post('/ai-chat', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.replace('Bearer ', '').trim();
    const user = await getUserFromSupabaseToken(accessToken);
    if (!user) return res.status(401).json({ error: 'unauthenticated' });

    const { sessionId, message } = req.body;
    if (!message || !message.toString().trim()) return res.status(400).json({ error: 'empty_message' });

    if (sessionId) {
      const check = await pool.query(
        'select 1 from public.sessions where id=$1 and (requester_id=$2 or mentor_id=$2) limit 1',
        [sessionId, user.id]
      );
      if (check.rowCount === 0) return res.status(403).json({ error: 'not_a_participant' });
    }

    const systemPrompt = `You are Study Circle assistant. Be short, polite and practical. Give study tips, scheduling help, or simple troubleshooting. If user asks for code provide a minimal runnable snippet. If outside scope (medical/legal), politely decline.`;

    const recent = await loadRecentMessages(sessionId, 6);
    const contextMessages = recent.map(r => ({ role: 'user', content: `${r.user_email || r.user_id}: ${r.content}` }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
      { role: 'user', content: message }
    ];

    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
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

    (async () => {
      try {
        await pool.query(
          'insert into public.ai_chats(session_id, user_id, user_message, assistant_reply) values ($1,$2,$3,$4)',
          [sessionId || null, user.id, message, assistant]
        );
      } catch (e) {
        console.warn('ai_chats save failed', e.message || e);
      }
    })();

    return res.json({ reply: assistant });
  } catch (err) {
    console.error('ai-chat error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;