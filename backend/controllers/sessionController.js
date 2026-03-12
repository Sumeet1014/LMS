const SessionRequest = require('../models/SessionRequest');
const Profile = require('../models/Profile');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

class SessionController {
  // Create session request
  async createSession(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { mentor_id, title, description, subject_id, requested_time, duration } = req.body;
      const student_id = req.user.id;

      // Create session request
      const session = await SessionRequest.createSessionRequest({
        mentor_id,
        student_id,
        title,
        description,
        subject_id,
        requested_time,
        duration
      });

      res.status(201).json({
        session,
        message: 'Session request created successfully'
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session request' });
    }
  }

  // Get user sessions (as mentor or student)
  async getUserSessions(req, res) {
    try {
      const { status, limit = 50, offset = 0 } = req.query;
      const userId = req.user.id;

      const sessions = await SessionRequest.getUserSessions(
        userId, 
        status, 
        parseInt(limit), 
        parseInt(offset)
      );

      res.json({ 
        sessions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Get user sessions error:', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }

  // Get session by ID
  async getSession(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const session = await SessionRequest.getSessionWithDetails(id);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is participant
      if (session.student_id !== userId && session.mentor_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to view this session' });
      }

      res.json({ session });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  // Update session status (approve/reject/complete)
  async updateSessionStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { id } = req.params;
      const { status, rejection_reason } = req.body;
      const userId = req.user.id;

      // Get session
      const session = await SessionRequest.findById(id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is mentor (only mentors can approve/reject)
      if (session.mentor_id !== userId) {
        return res.status(403).json({ error: 'Only mentors can update session status' });
      }

      // Update session status
      let updatedSession;
      switch (status) {
        case 'approved':
          updatedSession = await SessionRequest.approveSession(id);
          break;
        case 'rejected':
          updatedSession = await SessionRequest.rejectSession(id, rejection_reason);
          break;
        case 'completed':
          // Use transaction to ensure data consistency
          const db = require('../config/db');
          const connection = await db.pool.getConnection();
          try {
            await connection.beginTransaction();

            // Update session status
            await connection.query(
              'UPDATE session_requests SET status = ?, updated_at = NOW() WHERE id = ?',
              ['completed', id]
            );

            // Update session counts
            await connection.query(
              'UPDATE profiles SET total_sessions_attended = total_sessions_attended + 1 WHERE user_id = ?',
              [session.student_id]
            );

            await connection.query(
              'UPDATE profiles SET total_sessions_taught = total_sessions_taught + 1 WHERE user_id = ?',
              [session.mentor_id]
            );

            await connection.commit();
            updatedSession = await SessionRequest.findById(id);
          } catch (error) {
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
          break;
        default:
          return res.status(400).json({ error: 'Invalid status' });
      }

      res.json({
        session: updatedSession,
        message: `Session ${status} successfully`
      });
    } catch (error) {
      console.error('Update session status error:', error);
      res.status(500).json({ error: 'Failed to update session status' });
    }
  }

  // Get upcoming sessions
  async getUpcomingSessions(req, res) {
    try {
      const userId = req.user.id;

      const sessions = await SessionRequest.getUpcomingSessions(userId);

      res.json({ sessions });
    } catch (error) {
      console.error('Get upcoming sessions error:', error);
      res.status(500).json({ error: 'Failed to get upcoming sessions' });
    }
  }

  // Get mentor sessions
  async getMentorSessions(req, res) {
    try {
      const { status } = req.query;
      const mentorId = req.user.id;

      // Verify user is a mentor
      const profile = await Profile.getByUserId(mentorId);
      if (!profile || !profile.is_mentor) {
        return res.status(403).json({ error: 'User is not a mentor' });
      }

      const sessions = await SessionRequest.getMentorSessions(mentorId, status);

      res.json({ sessions });
    } catch (error) {
      console.error('Get mentor sessions error:', error);
      res.status(500).json({ error: 'Failed to get mentor sessions' });
    }
  }

  // Get student sessions
  async getStudentSessions(req, res) {
    try {
      const { status } = req.query;
      const studentId = req.user.id;

      const sessions = await SessionRequest.getStudentSessions(studentId, status);

      res.json({ sessions });
    } catch (error) {
      console.error('Get student sessions error:', error);
      res.status(500).json({ error: 'Failed to get student sessions' });
    }
  }

  // Generate video room ID
  async generateVideoRoom(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get session
      const session = await SessionRequest.findById(id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is participant and session is approved
      if (session.student_id !== userId && session.mentor_id !== userId) {
        return res.status(403).json({ error: 'Not authorized for this session' });
      }

      if (session.status !== 'approved') {
        return res.status(400).json({ error: 'Session must be approved to generate video room' });
      }

      // Generate video room ID
      const updatedSession = await SessionRequest.generateVideoRoomId(id);

      res.json({
        video_room_id: updatedSession.video_room_id,
        message: 'Video room generated successfully'
      });
    } catch (error) {
      console.error('Generate video room error:', error);
      res.status(500).json({ error: 'Failed to generate video room' });
    }
  }

  // Get session statistics
  async getSessionStats(req, res) {
    try {
      const userId = req.user.id;
      const profile = await Profile.getByUserId(userId);
      const isMentor = profile && profile.is_mentor;

      const stats = await SessionRequest.getSessionStats(userId, isMentor);

      res.json({ stats });
    } catch (error) {
      console.error('Get session stats error:', error);
      res.status(500).json({ error: 'Failed to get session statistics' });
    }
  }
}

module.exports = new SessionController();
