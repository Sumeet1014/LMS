// Simple database connection test
import mysql from 'mysql2/promise';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Neha@2001',
    database: 'lms_db'
  };

  try {
    // Test connection without database first
    console.log('1. Testing MySQL connection...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Neha@2001'
    });
    
    console.log('✅ MySQL connection successful!');
    console.log('');

    // Test database existence
    console.log('2. Checking if lms_db exists...');
    const [databases] = await connection.execute('SHOW DATABASES LIKE "lms_db"');
    
    if (databases.length === 0) {
      console.log('❌ Database lms_db does not exist');
      console.log('   Please create it in MySQL Workbench:');
      console.log('   CREATE DATABASE IF NOT EXISTS lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
      await connection.end();
      return;
    }
    
    console.log('✅ Database lms_db exists!');
    console.log('');

    // Test database connection
    console.log('3. Testing connection to lms_db...');
    await connection.execute('USE lms_db');
    console.log('✅ Connected to lms_db!');
    console.log('');

    // Test tables
    console.log('4. Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    
    const tableNames = tables.map(table => Object.values(table)[0]);
    console.log('   Tables:', tableNames.join(', '));
    console.log('');

    if (tables.length === 0) {
      console.log('❌ No tables found. Please import the schema:');
      console.log('   File → Run SQL Script → backend\\database\\lms_schema.sql');
    } else if (tables.length < 15) {
      console.log('⚠️  Expected 15 tables, found ' + tables.length);
      console.log('   Please ensure complete schema import');
    } else {
      console.log('✅ All tables imported successfully!');
    }

    // Test basic query
    console.log('5. Testing basic query...');
    try {
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Query successful: ${result[0].count} users in database`);
    } catch (error) {
      console.log('❌ Query failed:', error.message);
    }

    await connection.end();
    console.log('');
    console.log('🎉 Database connection test complete!');
    
    if (tables.length >= 15) {
      console.log('✅ Database is ready for the backend!');
      console.log('   Now test the API: node test_lms_api.js');
    } else {
      console.log('❌ Database setup incomplete');
      console.log('   Please complete MySQL Workbench setup first');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   Check MySQL credentials:');
      console.log('   Host: localhost');
      console.log('   User: root');
      console.log('   Password: Neha@2001');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Make sure MySQL service is running');
    }
  }
}

testDatabaseConnection();
