// Quick database test
import mysql from 'mysql2/promise';

try {
  console.log('🔍 Testing MySQL connection...');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Neha@2001'
  });
  
  console.log('✅ MySQL connected!');
  
  const [databases] = await connection.execute('SHOW DATABASES LIKE "lms_db"');
  
  if (databases.length === 0) {
    console.log('❌ lms_db not found. Creating...');
    await connection.execute('CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database created!');
    
    console.log('📥 Importing schema...');
    // This needs manual import in MySQL Workbench
    console.log('Please import: backend\\database\\lms_schema.sql');
  } else {
    console.log('✅ lms_db exists!');
    
    await connection.execute('USE lms_db');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables`);
    
    if (tables.length >= 15) {
      console.log('🎉 Database ready!');
    } else {
      console.log('⚠️  Need to import schema');
    }
  }
  
  await connection.end();
  
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('🔧 Start MySQL service first');
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.log('🔧 Check password: Neha@2001');
  }
}
