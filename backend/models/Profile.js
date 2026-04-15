const BaseModel = require('./BaseModel');

class Profile extends BaseModel {
  constructor() {
    super('profiles');
  }

  // Create or update profile (allows multiple mentors per user)
  async upsertProfile(userId, profileData) {
    const data = { ...profileData };
    // Remove columns that no longer exist in profiles table
    delete data.subjects;
    delete data.subject_ids;
    delete data.availability;

    // Check if user already has any mentor profiles
    const existingProfiles = await this.findByUserId(userId);
    
    if (existingProfiles && existingProfiles.length > 0) {
      return await this.updateByUserId(userId, data);
    } else {
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

  // Update subjects (now handled via profile_subjects table)
  async updateSubjects(userId, subjects, subjectIds) {
    // subjects are now stored in profile_subjects table
    // kept for backward compatibility
    return Promise.resolve();
  }

  // Update availability (now handled via profile_availability table)
  async updateAvailability(userId, availability) {
    // availability is now stored in profile_availability table
    // kept for backward compatibility
    return Promise.resolve();
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
      INNER JOIN profile_subjects ps ON p.id = ps.profile_id
      INNER JOIN subjects s ON ps.subject_id = s.id
      WHERE p.is_mentor = true 
        AND u.role = 'mentor'
        AND s.name LIKE ?
      ORDER BY p.rating DESC
      LIMIT ?
    `;

    return await this.query(query, [`%${subject}%`, limit]);
  }
}

module.exports = new Profile();
