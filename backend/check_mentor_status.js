import mysql from 'mysql2/promise';

async function checkMentorStatus() {
  try {
   const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Neha@2001',
      database: 'lms_db'
    });

   console.log('🔍 Checking Mentor Status...\n');

    // Query to get user with profile info
   const query = `
      SELECT u.id, u.email, u.full_name, u.role, 
             p.username, p.is_mentor, p.bio, p.subjects, p.college_email
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.role = 'mentor' OR p.is_mentor = true
      ORDER BY u.created_at DESC
    `;

   const [mentors] = await connection.query(query);

    if (mentors.length === 0) {
     console.log('❌ No mentors found in database');
    } else {
     console.log(`✅ Found ${mentors.length} mentor(s):\n`);
      mentors.forEach((mentor, index) => {
       console.log(`${index + 1}. User ID: ${mentor.id}`);
       console.log(`   Name: ${mentor.full_name}`);
       console.log(`   Email: ${mentor.email}`);
       console.log(`   Role: ${mentor.role}`);
       console.log(`   Is Mentor: ${mentor.is_mentor}`);
       console.log(`   Username: ${mentor.username}`);
       console.log(`   College Email: ${mentor.college_email || 'Not set'}`);
       console.log(`   Bio: ${mentor.bio ? mentor.bio.substring(0, 50) + '...' : 'Not set'}`);
       console.log(`   Subjects: ${mentor.subjects || 'Not set'}`);
       console.log('');
      });
    }

    await connection.end();
  } catch (error) {
   console.error('❌ Error:', error.message);
  }
}

checkMentorStatus();
