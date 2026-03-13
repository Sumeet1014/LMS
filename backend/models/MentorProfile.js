const { executeQuery } = require('../config/db');

class MentorProfile {
  // Create a new mentor profile
  static async create(userId, profileData) {
    const {
      profile_name,
      bio,
      subjects,
      expertise_level = 'intermediate',
      hourly_rate = 0,
      availability
    } = profileData;

    const result = await executeQuery(
      `INSERT INTO mentor_profiles 
       (user_id, profile_name, bio, subjects, expertise_level, hourly_rate, availability) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        profile_name,
        bio,
        JSON.stringify(subjects),
        expertise_level,
        hourly_rate,
        availability ? JSON.stringify(availability) : null
      ]
    );

    return this.findById(result.insertId);
  }

  // Get mentor profile by ID
  static async findById(id) {
    const profiles = await executeQuery(
      `SELECT mp.*, u.full_name, u.email 
       FROM mentor_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.id = ?`,
      [id]
    );

    if (profiles.length === 0) return null;

    const profile = profiles[0];
    return {
      ...profile,
      subjects: JSON.parse(profile.subjects || '[]'),
      availability: profile.availability ? JSON.parse(profile.availability) : null
    };
  }

  // Get all mentor profiles for a user
  static async findByUserId(userId) {
    const profiles = await executeQuery(
      `SELECT mp.*, u.full_name, u.email 
       FROM mentor_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = ?
       ORDER BY mp.created_at DESC`,
      [userId]
    );

    return profiles.map(profile => ({
      ...profile,
      subjects: JSON.parse(profile.subjects || '[]'),
      availability: profile.availability ? JSON.parse(profile.availability) : null
    }));
  }

  // Get all active mentor profiles
  static async findAllActive(filters = {}) {
    let query = `
      SELECT mp.*, u.full_name, u.email 
      FROM mentor_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.is_active = TRUE
    `;
    const params = [];

    if (filters.subject) {
      query += ` AND JSON_CONTAINS(mp.subjects, ?)`;
      params.push(JSON.stringify(filters.subject));
    }

    if (filters.expertise_level) {
      query += ` AND mp.expertise_level = ?`;
      params.push(filters.expertise_level);
    }

    query += ` ORDER BY mp.rating DESC, mp.total_sessions DESC`;

    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
    }

    const profiles = await executeQuery(query, params);

    return profiles.map(profile => ({
      ...profile,
      subjects: JSON.parse(profile.subjects || '[]'),
      availability: profile.availability ? JSON.parse(profile.availability) : null
    }));
  }

  // Update mentor profile
  static async update(id, userId, profileData) {
    const updates = [];
    const params = [];

    if (profileData.profile_name !== undefined) {
      updates.push('profile_name = ?');
      params.push(profileData.profile_name);
    }
    if (profileData.bio !== undefined) {
      updates.push('bio = ?');
      params.push(profileData.bio);
    }
    if (profileData.subjects !== undefined) {
      updates.push('subjects = ?');
      params.push(JSON.stringify(profileData.subjects));
    }
    if (profileData.expertise_level !== undefined) {
      updates.push('expertise_level = ?');
      params.push(profileData.expertise_level);
    }
    if (profileData.hourly_rate !== undefined) {
      updates.push('hourly_rate = ?');
      params.push(profileData.hourly_rate);
    }
    if (profileData.availability !== undefined) {
      updates.push('availability = ?');
      params.push(JSON.stringify(profileData.availability));
    }
    if (profileData.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(profileData.is_active);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id, userId);

    await executeQuery(
      `UPDATE mentor_profiles 
       SET ${updates.join(', ')} 
       WHERE id = ? AND user_id = ?`,
      params
    );

    return this.findById(id);
  }

  // Delete mentor profile
  static async delete(id, userId) {
    const result = await executeQuery(
      'DELETE FROM mentor_profiles WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return result.affectedRows > 0;
  }

  // Update session stats
  static async incrementSessions(id) {
    await executeQuery(
      'UPDATE mentor_profiles SET total_sessions = total_sessions + 1 WHERE id = ?',
      [id]
    );
  }

  // Update rating
  static async updateRating(id, newRating) {
    await executeQuery(
      'UPDATE mentor_profiles SET rating = ? WHERE id = ?',
      [newRating, id]
    );
  }
}

module.exports = MentorProfile;
