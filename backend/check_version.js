const db = require('./config/db');

async function checkVersion() {
    try {
        const [rows] = await db.query('SELECT VERSION() as version');
        console.log('Database version:', rows.version);
        process.exit(0);
    } catch (error) {
        console.error('Error checking version:', error);
        process.exit(1);
    }
}

checkVersion();
