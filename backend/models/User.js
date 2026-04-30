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

  if (!user) return null;

  
  if (!user.password_hash) {
    throw new Error("GOOGLE_USER");
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) return null;

  return user;
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
      SELECT u.*, 
             COALESCE(p.username, u.full_name) as username,
             p.bio, p.college_email, p.is_mentor, 
             p.rating, p.credits, p.contribution_score, 
             p.total_sessions_attended, p.total_sessions_taught
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
      SELECT u.id, u.full_name, u.email, u.role,
             p.id as profile_id, p.username, p.bio, p.college_email, p.rating, 
             p.total_sessions_taught, p.is_mentor,
             GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ',') as subjects_csv,
             GROUP_CONCAT(DISTINCT CONCAT(pa.day, '|', pa.start_time, '|', pa.end_time) ORDER BY pa.day SEPARATOR ';;') as availability_slots
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      LEFT JOIN profile_subjects ps ON p.id = ps.profile_id
      LEFT JOIN subjects s ON ps.subject_id = s.id
      LEFT JOIN profile_availability pa ON p.id = pa.profile_id
      WHERE p.is_mentor = true OR u.role = 'mentor'
      GROUP BY u.id, p.id
      ORDER BY p.rating DESC
    `;

    const rows = await this.query(query);

    // Deduplicate by user id
    const seen = new Set();
    const unique = rows.filter(row => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });

    return unique.map(row => {
      let availability = [];
      if (row.availability_slots) {
        availability = row.availability_slots.split(';;').map(slot => {
          const [day, start, end] = slot.split('|');
          const fmt = (t) => t ? t.substring(0, 5) : '';
          return { day, start_time: fmt(start), end_time: fmt(end) };
        });
      }
      return {
        ...row,
        username: row.username || row.full_name,
        subjects: row.subjects_csv ? row.subjects_csv.split(',') : [],
        availability
      };
    });
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
