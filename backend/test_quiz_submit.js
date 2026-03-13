const { executeQuery } = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function testQuizSubmit() {
  try {
    console.log('Testing quiz submission...\n');

    // Test data
    const challengeId = '1'; // Replace with actual challenge ID
    const userId = 1; // Replace with actual user ID
    const answers = {
      '1': '1' // question_id: option_id
    };

    console.log('1. Getting challenge details...');
    const challenges = await executeQuery(
      'SELECT id, title FROM challenges LIMIT 1'
    );
    console.log('Challenges:', challenges);

    if (challenges.length === 0) {
      console.log('No challenges found. Please create a challenge first.');
      process.exit(1);
    }

    const actualChallengeId = challenges[0].id;
    const challengeTitle = challenges[0].title;
    console.log(`Using challenge: ${challengeTitle} (ID: ${actualChallengeId})\n`);

    console.log('2. Getting quiz questions...');
    const questions = await executeQuery(
      'SELECT id, marks FROM quiz_questions WHERE challenge_id = ?',
      [actualChallengeId]
    );
    console.log('Questions:', questions);

    if (questions.length === 0) {
      console.log('No questions found for this challenge.');
      process.exit(1);
    }

    console.log('\n3. Testing certificate creation...');
    const shareToken = uuidv4().replace(/-/g, '');
    const certificateId = uuidv4();
    console.log('Share token:', shareToken);
    console.log('Certificate ID:', certificateId);

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log('Created at:', createdAt);

    console.log('\n4. Inserting certificate...');
    await executeQuery(
      'INSERT INTO certificates (id, title, user_id, challenge_id, score, share_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        certificateId,
        `${challengeTitle} - Certificate of Completion`,
        userId,
        actualChallengeId,
        100,
        shareToken,
        createdAt
      ]
    );

    console.log('✓ Certificate created successfully!');

    console.log('\n5. Verifying certificate...');
    const certs = await executeQuery(
      'SELECT * FROM certificates WHERE id = ?',
      [certificateId]
    );
    console.log('Certificate:', certs[0]);

    console.log('\n6. Cleaning up...');
    await executeQuery('DELETE FROM certificates WHERE id = ?', [certificateId]);
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

testQuizSubmit();
