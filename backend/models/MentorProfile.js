const { executeQuery } = require('../config/db');

class MentorProfile {

  // Save subjects to mentor_subjects junction table
  static async _saveSubjects(mentorProfileId, subjects) {
    await executeQuery('DELETE FROM mentor_subjects WHERE mentor_id = ?', [mentorProfileId]);
    for (const subjectName of subjects) {
      let rows = await executeQuery('SELECT id FROM subjects WHERE name = ?', [subjectName]);
      let subjectId;
      if (rows.length > 0) {
        subjectId = rows[0].id;
      } else {
        const ins = await executeQuery('INSERT INTO subjects (name) VALUES (?)', [subjectName]);
        subjectId = ins.insertId;
      }
      await executeQuery(
        'INSERT IGNORE INTO mentor_subjects (mentor_id, subject_id) VALUES (?, ?)',
        [mentorProfileId, subjectId]
      );
    }
  }

  // Get subjects for a mentor profile
  static async _getSubjects(mentorProfileId) {
    const rows = await executeQuery(
      `SELECT s.name FROM mentor_subjects ms
       JOIN subjects s ON ms.subject_id = s.id
       WHERE ms.mentor_id = ?`,
      [mentorProfileId]
    );
    return rows.map(r => r.name);
  }

  // Save availability to mentor_availability junction table
  static async _saveAvailability(mentorProfileId, availability) {
    await executeQuery('DELETE FROM mentor_availability WHERE mentor_id = ?', [mentorProfileId]);
    for (const slot of availability) {
      if (slot.day && slot.start_time && slot.end_time) {
        await executeQuery(
          'INSERT INTO mentor_availability (mentor_id, day, start_time, end_time) VALUES (?, ?, ?, ?)',
          [mentorProfileId, slot.day, slot.start_time, slot.end_time]
        );
      }
    }
  }

  // Get availability for a mentor profile
  static async _getAvailability(mentorProfileId) {
    const rows = await executeQuery(
      'SELECT day, start_time, end_time FROM mentor_availability WHERE mentor_id = ? ORDER BY FIELD(day,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")',
      [mentorProfileId]
    );
    return rows.map(r => ({
      day: r.day,
      start_time: r.start_time?.substring(0, 5),
      end_time: r.end_time?.substring(0, 5)
    }));
  }

  // Create a new mentor profile
  static async create(userId, profileData) {
    const { profile_name, bio, subjects = [], expertise_level = 'intermediate', hourly_rate = 0, availability = [] } = profileData;

    const result = await executeQuery(
      `INSERT INTO mentor_profiles (user_id, profile_name, bio, expertise_level, hourly_rate)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, profile_name, bio, expertise_level, hourly_rate]
    );

    await this._saveSubjects(result.insertId, subjects);
    await this._saveAvailability(result.insertId, availability);
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
      subjects: await this._getSubjects(id),
      availability: await this._getAvailability(id)
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
    return Promise.all(profiles.map(async p => ({
      ...p,
      subjects: await this._getSubjects(p.id),
      availability: await this._getAvailability(p.id)
    })));
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
      query += ` AND EXISTS (SELECT 1 FROM mentor_subjects ms2 JOIN subjects s2 ON ms2.subject_id = s2.id WHERE ms2.mentor_id = mp.id AND s2.name LIKE ?)`;
      params.push(`%${filters.subject}%`);
    }
    if (filters.expertise_level) {
      query += ` AND mp.expertise_level = ?`;
      params.push(filters.expertise_level);
    }

    query += ` ORDER BY mp.rating DESC, mp.total_sessions DESC`;
    if (filters.limit) { query += ` LIMIT ?`; params.push(parseInt(filters.limit)); }

    const profiles = await executeQuery(query, params);
    return Promise.all(profiles.map(async p => ({ ...p, subjects: await this._getSubjects(p.id) })));
  }

  // Update mentor profile
  static async update(id, userId, profileData) {
    const updates = [];
    const params = [];

    if (profileData.profile_name !== undefined) { updates.push('profile_name = ?'); params.push(profileData.profile_name); }
    if (profileData.bio !== undefined) { updates.push('bio = ?'); params.push(profileData.bio); }
    if (profileData.expertise_level !== undefined) { updates.push('expertise_level = ?'); params.push(profileData.expertise_level); }
    if (profileData.hourly_rate !== undefined) { updates.push('hourly_rate = ?'); params.push(profileData.hourly_rate); }
    if (profileData.is_active !== undefined) { updates.push('is_active = ?'); params.push(profileData.is_active); }

    if (updates.length > 0) {
      params.push(id, userId);
      await executeQuery(`UPDATE mentor_profiles SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
    }

    if (profileData.subjects !== undefined) {
      await this._saveSubjects(id, profileData.subjects);
    }
    if (profileData.availability !== undefined) {
      await this._saveAvailability(id, profileData.availability);
    }

    return this.findById(id);
  }

  // Delete mentor profile
  static async delete(id, userId) {
    const result = await executeQuery('DELETE FROM mentor_profiles WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }

  // Update session stats
  static async incrementSessions(id) {
    await executeQuery('UPDATE mentor_profiles SET total_sessions = total_sessions + 1 WHERE id = ?', [id]);
  }

  // Update rating
  static async updateRating(id, newRating) {
    await executeQuery('UPDATE mentor_profiles SET rating = ? WHERE id = ?', [newRating, id]);
  }
}

module.exports = MentorProfile;
