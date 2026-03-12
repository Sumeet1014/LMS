const BaseModel = require('./BaseModel');

class Profile extends BaseModel {
  constructor() {
    super('profiles');
  }

  // Create or update profile (allows multiple mentors per user)
  async upsertProfile(userId, profileData) {
    const data = { ...profileData };
    if (data.subjects) {
      data.subjects = typeof data.subjects === 'string' ? data.subjects : JSON.stringify(data.subjects);
    }
    if (data.subject_ids) {
      data.subject_ids = typeof data.subject_ids === 'string' ? data.subject_ids : JSON.stringify(data.subject_ids);
    }
    if (data.availability) {
      // For JSON column, even a plain string must be double-quoted to be valid JSON
      // If it's already a string, we check if it starts with { or [ or "
      const isJson = typeof data.availability === 'string' &&
        (data.availability.startsWith('{') ||
          data.availability.startsWith('[') ||
          data.availability.startsWith('"'));

      if (!isJson) {
        data.availability = JSON.stringify(data.availability);
      }
    }

    // Check if user already has any mentor profiles
    const existingProfiles = await this.findByUserId(userId);
    
    if (existingProfiles && existingProfiles.length > 0) {
      // Update existing profile instead of creating new one
     return await this.updateByUserId(userId, data);
    } else {
      // Create first mentor profile
      return await this.create({ user_id: userId, ...data });
    }
  }

  // Update profile by user_id
  async updateByUserId(userId, profileData) {
    const query = 'UPDATE profiles SET ? WHERE user_id = ?';
    return await this.query(query, [profileData, userId]);
  }

  // Get profile by user_id
  async getByUserId(userId) {
    return await this.findOne({ user_id: userId });
  }

  // Get all profiles by user_id (for multiple mentors support)
  async findByUserId(userId) {
    const query = 'SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at ASC';
    return await this.query(query, [userId]);
  }

  // Update mentor status
  async updateMentorStatus(userId, isMentor) {
    return await this.updateByUserId(userId, { is_mentor: isMentor });
  }

  // Update subjects
  async updateSubjects(userId, subjects, subjectIds) {
    return await this.updateByUserId(userId, {
      subjects: JSON.stringify(subjects),
      subject_ids: JSON.stringify(subjectIds)
    });
  }

  // Update availability
  async updateAvailability(userId, availability) {
    return await this.updateByUserId(userId, {
      availability: JSON.stringify(availability)
    });
  }

  // Update rating
  async updateRating(userId, rating) {
    return await this.updateByUserId(userId, { rating });
  }

  // Increment session counts
  async incrementSessionCounts(userId, isMentor) {
    if (isMentor) {
      const query = 'UPDATE profiles SET total_sessions_taught = total_sessions_taught + 1 WHERE user_id = ?';
      return await this.query(query, [userId]);
    } else {
      const query = 'UPDATE profiles SET total_sessions_attended = total_sessions_attended + 1 WHERE user_id = ?';
      return await this.query(query, [userId]);
    }
  }

  // Update contribution score
  async updateContributionScore(userId, score) {
    return await this.updateByUserId(userId, { contribution_score: score });
  }

  // Get mentors with pagination
  async getMentors(limit = 20, offset = 0) {
    const query = `
      SELECT p.*, u.email, u.full_name
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.is_mentor = true AND u.role = 'mentor'
      ORDER BY p.rating DESC
      LIMIT ? OFFSET ?
    `;

    return await this.query(query, [limit, offset]);
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    const query = `
      SELECT p.*, u.username, u.full_name
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.id
      ORDER BY p.contribution_score DESC
      LIMIT ?
    `;

    return await this.query(query, [limit]);
  }

  // Get mentor stats
  async getMentorStats(userId) {
    const query = `
      SELECT 
        p.rating,
        p.total_sessions_taught,
        p.total_sessions_attended,
        p.contribution_score,
        COUNT(DISTINCT sr.id) as total_sessions,
        AVG(sf.rating) as avg_feedback_rating,
        COUNT(DISTINCT sf.id) as feedback_count
      FROM profiles p
      LEFT JOIN session_requests sr ON p.user_id = sr.mentor_id
      LEFT JOIN session_feedback sf ON sr.id = sf.session_id AND sf.mentor_id = p.user_id
      WHERE p.user_id = ?
      GROUP BY p.id, p.rating, p.total_sessions_taught, p.total_sessions_attended, p.contribution_score
    `;

    const results = await this.query(query, [userId]);
    return results[0] || {};
  }

  // Get student stats
  async getStudentStats(userId) {
    const query = `
      SELECT 
        p.total_sessions_attended,
        p.contribution_score,
        COUNT(DISTINCT sr.id) as total_sessions,
        COUNT(DISTINCT qa.id) as quiz_attempts,
        COUNT(DISTINCT CASE WHEN qa.passed = true THEN qa.id END) as passed_quizzes,
        AVG(qa.score) as avg_quiz_score
      FROM profiles p
      LEFT JOIN session_requests sr ON p.user_id = sr.student_id
      LEFT JOIN quiz_attempts qa ON p.user_id = qa.user_id
      WHERE p.user_id = ?
      GROUP BY p.id, p.total_sessions_attended, p.contribution_score
    `;

    const results = await this.query(query, [userId]);
    return results[0] || {};
  }

  // Store Google refresh token
  async storeGoogleRefreshToken(userId, refreshToken) {
    return await this.updateByUserId(userId, {
      google_refresh_token: refreshToken,
      google_connected_at: new Date()
    });
  }

  // Search mentors by subject
  async searchMentorsBySubject(subject, limit = 10) {
    const query = `
      SELECT p.*, u.email, u.full_name
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.is_mentor = true 
        AND u.role = 'mentor'
        AND (JSON_CONTAINS(p.subjects, ?) OR JSON_CONTAINS(p.subject_ids, ?))
      ORDER BY p.rating DESC
      LIMIT ?
    `;

    return await this.query(query, [JSON.stringify(subject), JSON.stringify(subject), limit]);
  }
}

module.exports = new Profile();
