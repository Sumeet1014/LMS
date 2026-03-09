const db = require('./config/db');

async function checkSchema() {
    try {
        const rows = await db.query('DESCRIBE profiles');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
