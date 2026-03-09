// Express route for session confirmation with Meet creation
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

function oauth2ClientFromRefresh(refreshToken) {
  const oAuth2 = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oAuth2.setCredentials({ refresh_token: refreshToken });
  return oAuth2;
}

async function createEventWithMeet(oauth2Client, calendarId, attendees = [], startIso, endIso, summary = 'Study Session') {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const requestId = `meet-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const body = {
    summary,
    start: { dateTime: startIso, timeZone: 'Asia/Kolkata' },
    end: { dateTime: endIso, timeZone: 'Asia/Kolkata' },
    attendees: attendees.map(email => ({ email })),
    conferenceData: { createRequest: { requestId } }
  };
  const inserted = await calendar.events.insert({ calendarId, conferenceDataVersion: 1, requestBody: body });
  let event = inserted.data;
  let tries = 0;
  while ((!event.conferenceData || !event.hangoutLink) && tries < 3) {
    tries++;
    await new Promise(r => setTimeout(r, 1400));
    event = (await calendar.events.get({ calendarId, eventId: event.id, conferenceDataVersion: 1 })).data;
  }
  return event;
}

router.post('/:id/choose', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'unauthenticated' });
    
    const { action, chosenIndex } = req.body;
    const session = await db.getSession(sessionId);
    if (!session || session.mentor_id !== userId) return res.status(403).json({ error: 'forbidden' });
    
    if (action === 'reject') {
      await db.updateSession(sessionId, { status: 'cancelled' });
      return res.json({ ok: true, status: 'cancelled' });
    }
    
    const option = session.proposed_slots?.[chosenIndex];
    if (!option) return res.status(400).json({ error: 'invalid_choice' });
    
    const mentor = await db.getUser(session.mentor_id);
    const requester = await db.getUser(session.requester_id);
    if (!mentor.google_refresh_token) return res.status(400).json({ error: 'mentor_not_connected' });
    
    const oauthMentor = oauth2ClientFromRefresh(mentor.google_refresh_token);
    const event = await createEventWithMeet(oauthMentor, mentor.email, [mentor.email, requester.email], option.startIso, option.endIso, `Study Session: ${session.subject || 'Topic'}`);
    
    await db.updateSession(sessionId, { status: 'confirmed', chosen_slot_id: option.id });
    await db.createEventRow({ session_id: sessionId, google_event_id: event.id, hangout_link: event.hangoutLink });
    
    return res.json({ ok: true, sessionId, eventId: event.id, hangoutLink: event.hangoutLink });
  } catch (err) {
    console.error('choose error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;