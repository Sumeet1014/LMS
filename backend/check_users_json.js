const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function testQuery() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_db'
    });

    try {
        const [rows] = await connection.query('SELECT id, email, full_name FROM users');
        console.log('USERS_LIST:' + JSON.stringify(rows));
    } catch (error) {
        console.error('Query error:', error.message);
    } finally {
        await connection.end();
    }
}

testQuery();
