const db = require('../config/db');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Find one record
  async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
    
    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
    const results = await db.query(query, values);
    return results[0] || null;
  }

  // Find multiple records
  async findMany(conditions = {}, limit = null, offset = 0) {
    let query = `SELECT * FROM ${this.tableName}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      values.push(limit, offset);
    }

    return await db.query(query, values);
  }

  // Create record
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await db.query(query, values);
    
    // Return the created record
    if (result.insertId) {
      return await this.findById(result.insertId);
    }
    return null;
  }

  // Update by ID
  async updateById(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    await db.query(query, [...values, id]);
    
    return await this.findById(id);
  }

  // Update by conditions
  async updateByConditions(conditions, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const whereKeys = Object.keys(conditions);
    const whereValues = Object.values(conditions);
    const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
    
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;
    await db.query(query, [...values, ...whereValues]);
    
    return await this.findOne(conditions);
  }

  // Find by ID
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const results = await db.query(query, [id]);
    return results[0] || null;
  }

  // Delete by ID
  async deleteById(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await db.query(query, [id]);
    return result.affectedRows > 0;
  }

  // Count records
  async count(conditions = {}) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    const results = await db.query(query, values);
    return results[0].count;
  }

  // Custom query
  async query(sql, params = []) {
    return await db.query(sql, params);
  }

  // Get all records
  async getAll(limit = null, offset = 0) {
    let query = `SELECT * FROM ${this.tableName}`;
    const values = [];

    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      values.push(limit, offset);
    }

    return await db.query(query, values);
  }

  // Join query helper
  async join(joinTable, onCondition, selectFields = '*', conditions = {}) {
    let query = `SELECT ${selectFields} FROM ${this.tableName} JOIN ${joinTable} ON ${onCondition}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    return await db.query(query, values);
  }

  // Left join query helper
  async leftJoin(joinTable, onCondition, selectFields = '*', conditions = {}) {
    let query = `SELECT ${selectFields} FROM ${this.tableName} LEFT JOIN ${joinTable} ON ${onCondition}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    return await db.query(query, values);
  }

  // Generate UUID (for compatibility)
  static generateUUID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Get current timestamp
  static getCurrentTimestamp() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

module.exports = BaseModel;
