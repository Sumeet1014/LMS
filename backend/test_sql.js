const db = require('./config/db');

async function testSQL() {
    try {
        const userId = 1; // Assuming user 1 exists or doesn't matter for syntax check
        const data = {
            username: 'test',
            bio: 'test bio',
            college_email: 'test@example.com',
            subjects: JSON.stringify(['test']),
            availability: JSON.stringify('test'),
            is_mentor: 1
        };

        // Test INSERT
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO profiles (user_id, ${keys.join(', ')}) VALUES (?, ${placeholders})`;
        console.log('Testing SQL:', sql);
        await db.query(sql, [userId, ...values]);
        console.log('SQL Test Success');
    } catch (error) {
        console.log('SQL Test Failed:');
        console.log(error);
    }
    process.exit(0);
}

testSQL();
