const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './.env' }); // Current dir is backend

async function setupDatabase() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server');

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'lms_db'}`);
        console.log(`Database ${process.env.DB_NAME || 'lms_db'} created or already exists`);

        await connection.query(`USE ${process.env.DB_NAME || 'lms_db'}`);

        const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
        if (tables.length > 0) {
            console.log('Users table exists. Checking columns...');
            const [columns] = await connection.query("DESCRIBE users");

            const hasPasswordHash = columns.some(c => c.Field === 'password_hash');
            const hasUsername = columns.some(c => c.Field === 'username');
            const hasEmailVerified = columns.some(c => c.Field === 'email_verified');

            if (!hasPasswordHash) {
                console.log('Adding password_hash column...');
                await connection.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER email');
            }

            if (!hasUsername) {
                console.log('Adding username column...');
                await connection.query('ALTER TABLE users ADD COLUMN username VARCHAR(255) AFTER full_name');
            }

            if (!hasEmailVerified) {
                console.log('Adding email_verified column...');
                await connection.query('ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER role');
            }

            console.log('Schema check/repair complete!');
        } else {
            console.warn('Users table does not exist. The schema might not have been imported.');
        }

    } catch (error) {
        console.error('Database setup error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
