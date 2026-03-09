import React, { useEffect, useState } from 'react';

export default function MentorRequests({ currentUser }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch('/api/mentor/requests', { credentials: 'include' })
      .then(r => r.json())
      .then(j => setRequests(j.requests || []))
      .catch(() => setRequests([]));
  }, []);

  const confirm = async (sessionId, index) => {
    const res = await fetch(`/api/sessions/${sessionId}/choose`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'accept', chosenIndex: index })
    });
    const j = await res.json();
    if (j.ok) {
      alert('Scheduled. Meet: ' + (j.hangoutLink || 'sent via email'));
      setRequests(prev => prev.filter(r => r.id !== sessionId));
    } else {
      alert('Error: ' + (j.error || 'unknown'));
    }
  };

  const reject = async (sessionId) => {
    await fetch(`/api/sessions/${sessionId}/choose`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'reject' })
    });
    setRequests(prev => prev.filter(r => r.id !== sessionId));
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Session Requests</h3>
      {requests.length === 0 && <p>No requests</p>}
      {requests.map(req => (
        <div key={req.id} className="border p-4 mb-4 rounded-lg">
          <div><b>From:</b> {req.requester_name}</div>
          <div><b>Subject:</b> {req.subject}</div>
          <div><b>Proposed slots:</b></div>
          {req.proposedSlots?.map((s, i) => (
            <div key={i} className="ml-4">
              <label className="flex items-center space-x-2">
                <input type="radio" name={`choice-${req.id}`} />
                <span>{new Date(s.startIso).toLocaleString()} - {new Date(s.endIso).toLocaleString()}</span>
                <button onClick={() => confirm(req.id, i)} className="ml-2 px-3 py-1 bg-green-500 text-white rounded">
                  Confirm
                </button>
              </label>
            </div>
          ))}
          <button onClick={() => reject(req.id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}