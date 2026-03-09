const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' }); // Current dir is backend

async function testQuery() {
    console.log('Connecting with:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
    });

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_db'
    });

    try {
        const [rows] = await connection.query('SELECT id, email, password_hash, full_name FROM users');
        console.log('Users found:', rows.length);
        console.table(rows.map(r => ({ ...r, password_hash: r.password_hash ? 'SET' : 'MISSING' })));
    } catch (error) {
        console.error('Query error:', error.message);
    } finally {
        await connection.end();
    }
}

testQuery();
