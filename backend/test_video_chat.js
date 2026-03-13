const { executeQuery } = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function testVideoChat() {
  try {
    console.log('Testing video chat message insertion...\n');

    // First, check if tables exist
    console.log('1. Checking if video_chat_messages table exists:');
    const tables = await executeQuery(
      "SHOW TABLES LIKE 'video_chat_messages'"
    );
    console.log('Table exists:', tables.length > 0);

    if (tables.length === 0) {
      console.log('ERROR: video_chat_messages table does not exist!');
      console.log('Please run the migration script: backend/database/fix_video_chat_id.sql');
      process.exit(1);
    }

    // Check table structure
    console.log('\n2. Checking video_chat_messages table structure:');
    const structure = await executeQuery('DESCRIBE video_chat_messages');
    console.log(structure);

    // Check users table structure
    console.log('\n3. Checking users table structure:');
    const usersStructure = await executeQuery('DESCRIBE users');
    console.log(usersStructure);

    // Get a test user
    console.log('\n4. Getting a test user:');
    const users = await executeQuery('SELECT id, full_name, email FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('ERROR: No users found in database!');
      process.exit(1);
    }
    const testUser = users[0];
    console.log('Test user:', testUser);
    console.log('User ID type:', typeof testUser.id);

    // Try to insert a test message
    console.log('\n5. Attempting to insert test video chat message:');
    const messageId = uuidv4();
    const roomId = 'test-room-1';
    const message = 'Test message';
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log('Message ID:', messageId);
    console.log('Room ID:', roomId);
    console.log('User ID:', testUser.id);
    console.log('Message:', message);
    console.log('Created at:', createdAt);

    await executeQuery(
      'INSERT INTO video_chat_messages (id, room_id, user_id, message, created_at) VALUES (?, ?, ?, ?, ?)',
      [messageId, roomId, testUser.id, message, createdAt]
    );

    console.log('\n✓ SUCCESS: Message inserted successfully!');

    // Retrieve the message
    console.log('\n6. Retrieving the inserted message:');
    const messages = await executeQuery(
      'SELECT vcm.*, u.full_name as user_name FROM video_chat_messages vcm LEFT JOIN users u ON vcm.user_id = u.id WHERE vcm.id = ?',
      [messageId]
    );
    console.log('Retrieved message:', messages[0]);

    // Clean up
    console.log('\n7. Cleaning up test data:');
    await executeQuery('DELETE FROM video_chat_messages WHERE id = ?', [messageId]);
    console.log('✓ Test data cleaned up');

    console.log('\n✓ ALL TESTS PASSED!');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testVideoChat();
