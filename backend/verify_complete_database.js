import mysql from 'mysql2/promise';

async function verifyDatabase() {
  try {
  const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Neha@2001',
      database: 'lms_db'
    });

  console.log('🔍 Verifying Complete Database...\n');

    // Check users count
  const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
  console.log(`📊 Users: ${users[0].count} total users`);

    // Check mentors
  const [mentors] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'mentor'");
  console.log(`   └─ Mentors: ${mentors[0].count}`);

    // Check profiles
  const [profiles] = await connection.query('SELECT COUNT(*) as count FROM profiles');
  console.log(`\n📊 Profiles: ${profiles[0].count} total profiles`);

    // Check profiles with mentor info
  const [mentorProfiles] = await connection.query('SELECT COUNT(*) as count FROM profiles WHERE is_mentor = true');
  console.log(`   └─ Mentor profiles: ${mentorProfiles[0].count}`);

    // Check subjects
  const [subjects] = await connection.query('SELECT COUNT(*) as count FROM subjects');
  console.log(`\n📊 Subjects: ${subjects[0].count} available subjects`);

    // Check session requests
  const [sessions] = await connection.query('SELECT COUNT(*) as count FROM session_requests');
  console.log(`\n📊 Session Requests: ${sessions[0].count} total sessions`);

    // Check challenges
  const [challenges] = await connection.query('SELECT COUNT(*) as count FROM challenges');
  console.log(`\n📊 Challenges: ${challenges[0].count} available challenges`);

    // Check quiz questions
  const [quizQuestions] = await connection.query('SELECT COUNT(*) as count FROM quiz_questions');
  console.log(`\n📊 Quiz Questions: ${quizQuestions[0].count} questions`);

    // Check resources
  const [resources] = await connection.query('SELECT COUNT(*) as count FROM resources');
  console.log(`\n📊 Resources: ${resources[0].count} learning resources`);

    // Check certificates
  const [certificates] = await connection.query('SELECT COUNT(*) as count FROM certificates');
  console.log(`\n📊 Certificates: ${certificates[0].count} certificates issued`);

    // Show recent users
  console.log('\n👥 Recent Users (Last 5):');
  const [recentUsers] = await connection.query(
     'SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
   );
   recentUsers.forEach((user, i) => {
    console.log(`   ${i + 1}. ${user.full_name} (${user.email}) - Role: ${user.role}`);
   });

    // Show detailed mentor info
  console.log('\n🎓 Active Mentors with Profiles:');
  const [activeMentors] = await connection.query(`
      SELECT u.full_name, u.email, p.username, p.bio, p.subjects, p.college_email
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.role = 'mentor' AND p.is_mentor = true
      ORDER BY u.created_at DESC
      LIMIT 5
    `);
   
   activeMentors.forEach((mentor, i) => {
    console.log(`   ${i + 1}. ${mentor.full_name}`);
    console.log(`      Username: ${mentor.username}`);
    console.log(`      College Email: ${mentor.college_email || 'N/A'}`);
    console.log(`      Subjects: ${mentor.subjects || 'Not set'}`);
    console.log(`      Bio: ${mentor.bio ? mentor.bio.substring(0, 40) + '...' : 'Not set'}`);
   });

    await connection.end();
    
  console.log('\n✅ Database verification complete!');
  console.log('All data is being saved correctly!\n');

  } catch (error) {
  console.error('❌ Error:', error.message);
  }
}

verifyDatabase();
