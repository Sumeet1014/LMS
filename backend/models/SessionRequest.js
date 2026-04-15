const BaseModel = require('./BaseModel');

class SessionRequest extends BaseModel {
  constructor() {
    super('session_requests');
  }

  // Create session request
  async createSessionRequest(sessionData) {
    const data = {
      ...sessionData,
      status: 'pending',
      approval_email_sent: false,
      reminder_5min_sent: false
    };

    return await this.create(data);
  }

  // Get sessions for a user (as mentor or student)
  async getUserSessions(userId, status = null, limit = 50, offset = 0) {
    let query = `
      SELECT sr.*, 
             sp.username as student_name,
             mp.username as mentor_name,
             sub.name as subject_name
      FROM session_requests sr
      LEFT JOIN profiles sp ON sr.student_id = sp.user_id
      LEFT JOIN profiles mp ON sr.mentor_id = mp.user_id
      LEFT JOIN subjects sub ON sr.subject_id = sub.id
      WHERE sr.student_id = ? OR sr.mentor_id = ?
    `;

    const params = [userId, userId];

    if (status) {
      query += ` AND sr.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY sr.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await this.query(query, params);
  }

  // Get session by ID with participant details
  async getSessionWithDetails(sessionId) {
    const query = `
      SELECT sr.*, 
             sp.username as student_name, sp.email as student_email,
             mp.username as mentor_name, mp.email as mentor_email,
             sub.name as subject_name
      FROM session_requests sr
      LEFT JOIN users sp ON sr.student_id = sp.id
      LEFT JOIN users mp ON sr.mentor_id = mp.id
      LEFT JOIN subjects sub ON sr.subject_id = sub.id
      WHERE sr.id = ?
    `;

    const result = await this.query(query, [sessionId]);
    return result.length > 0 ? result[0] : null;
  }

  // Update session status
  async updateStatus(sessionId, status, additionalData = {}) {
    const updateData = {
      status,
      responded_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      ...additionalData
    };

    return await this.updateById(sessionId, updateData);
  }

  // Approve session
  async approveSession(sessionId) {
    return await this.updateStatus(sessionId, 'approved');
  }

  // Reject session
  async rejectSession(sessionId, reason = null) {
    return await this.updateStatus(sessionId, 'rejected', {
      rejection_reason: reason
    });
  }

  // Complete session
  async completeSession(sessionId) {
    return await this.updateStatus(sessionId, 'completed');
  }

  // Get upcoming sessions for user
  async getUpcomingSessions(userId) {
    const query = `
      SELECT sr.*, 
             su.full_name as student_name,
             mu.full_name as mentor_name,
             sub.name as subject_name
      FROM session_requests sr
      LEFT JOIN users su ON sr.student_id = su.id
      LEFT JOIN users mu ON sr.mentor_id = mu.id
      LEFT JOIN subjects sub ON sr.subject_id = sub.id
      WHERE (sr.student_id = ? OR sr.mentor_id = ?)
        AND sr.status IN ('approved', 'ongoing', 'pending')
      ORDER BY 
        CASE sr.status 
          WHEN 'approved' THEN 1 
          WHEN 'pending' THEN 2
          ELSE 3 
        END,
        sr.requested_time ASC
      LIMIT 10
    `;
    return await this.query(query, [userId, userId]);
  }

  // Get sessions by mentor
  async getMentorSessions(mentorId, status = null) {
    let query = `
      SELECT sr.*, 
             sp.username as student_name,
             sub.name as subject_name
      FROM session_requests sr
      LEFT JOIN profiles sp ON sr.student_id = sp.user_id
      LEFT JOIN subjects sub ON sr.subject_id = sub.id
      WHERE sr.mentor_id = ?
    `;

    const params = [mentorId];

    if (status) {
      query += ` AND sr.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY sr.created_at DESC`;

    return await this.query(query, params);
  }

  // Get sessions by student
  async getStudentSessions(studentId, status = null) {
    let query = `
      SELECT sr.*, 
             mp.username as mentor_name,
             sub.name as subject_name
      FROM session_requests sr
      LEFT JOIN profiles mp ON sr.mentor_id = mp.user_id
      LEFT JOIN subjects sub ON sr.subject_id = sub.id
      WHERE sr.student_id = ?
    `;

    const params = [studentId];

    if (status) {
      query += ` AND sr.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY sr.created_at DESC`;

    return await this.query(query, params);
  }

  // Update email sent flags
  async markEmailSent(sessionId, emailType) {
    const updateData = {};

    switch (emailType) {
      case 'approval':
        updateData.approval_email_sent = true;
        break;
      case 'reminder':
        updateData.reminder_5min_sent = true;
        break;
    }

    return await this.updateById(sessionId, updateData);
  }

  // Generate video room ID
  async generateVideoRoomId(sessionId) {
    const roomId = `room_${sessionId}_${Date.now()}`;
    return await this.updateById(sessionId, { video_room_id: roomId });
  }

  // Get session statistics
  async getSessionStats(userId, isMentor = false) {
    const roleField = isMentor ? 'mentor_id' : 'student_id';

    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_sessions,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_sessions
      FROM session_requests
      WHERE ${roleField} = ?
    `;

    const result = await this.query(query, [userId]);
    return result[0];
  }
}

module.exports = new SessionRequest();
