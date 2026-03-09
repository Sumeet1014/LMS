const BaseModel = require('./BaseModel');
const bcrypt = require('bcrypt');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  // Create user with password hashing
  async createUser(userData) {
    const { password, full_name, username, email_verified, ...otherData } = userData;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return await this.create({
      ...otherData,
      password_hash: hashedPassword,
      full_name: full_name || otherData.name || otherData.fullName,
      username: username || (full_name || otherData.name || otherData.fullName)?.toLowerCase().replace(/\s+/g, '_'),
      email_verified: email_verified || false
    });
  }

  // Find user by email
  async findByEmail(email) {
    return await this.findOne({ email });
  }

  // Verify password
  async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user || !user.password_hash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }

  // Update password
  async updatePassword(userId, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    return await this.updateById(userId, { password_hash: hashedPassword });
  }

  // Get user profile with profile data
  async getUserWithProfile(userId) {
    const query = `
      SELECT u.*, p.username, p.bio, p.college_email, p.is_mentor, 
             p.rating, p.credits, p.contribution_score, 
             p.total_sessions_attended, p.total_sessions_taught,
             p.subjects, p.subject_ids, p.availability
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `;

    const results = await this.query(query, [userId]);
    return results[0] || null;
  }

  // Get all mentors
  async getMentors() {
    const query = `
      SELECT u.*, p.username, p.bio, p.college_email, p.rating, 
             p.total_sessions_taught, p.subjects
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE p.is_mentor = true AND u.role = 'mentor'
      ORDER BY p.rating DESC
    `;

    return await this.query(query);
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    const query = `
      SELECT u.id, u.username, p.contribution_score, p.total_sessions_taught,
             p.rating, p.total_sessions_attended
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      ORDER BY p.contribution_score DESC
      LIMIT ?
    `;

    return await this.query(query, [limit]);
  }

  // Update user role to mentor
  async updateToMentor(userId) {
    await this.updateById(userId, { role: 'mentor' });
    return await this.query(
      'UPDATE profiles SET is_mentor = true WHERE user_id = ?',
      [userId]
    );
  }

  // Get user statistics
  async getUserStats(userId) {
    const query = `
      SELECT 
        COUNT(CASE WHEN sr.mentor_id = ? THEN 1 END) as sessions_mentored,
        COUNT(CASE WHEN sr.student_id = ? THEN 1 END) as sessions_attended,
        COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) as completed_sessions,
        AVG(sf.rating) as avg_rating
      FROM users u
      LEFT JOIN session_requests sr ON (u.id = sr.mentor_id OR u.id = sr.student_id)
      LEFT JOIN session_feedback sf ON sr.id = sf.session_id AND sf.mentor_id = ?
      WHERE u.id = ?
    `;

    const results = await this.query(query, [userId, userId, userId, userId]);
    return results[0] || {};
  }

  // Update user role
  async updateRole(userId, role) {
    return await this.updateById(userId, { role });
  }

  // Store Google refresh token
  async storeGoogleRefreshToken(userId, refreshToken) {
    return await this.updateById(userId, { google_refresh_token: refreshToken });
  }

  // Get user by Google refresh token
  async findByGoogleRefreshToken(refreshToken) {
    return await this.findOne({ google_refresh_token: refreshToken });
  }
}

module.exports = new User();
