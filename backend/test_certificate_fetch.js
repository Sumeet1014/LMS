const { executeQuery } = require('./config/db');

async function testCertificateFetch() {
  try {
    console.log('Testing certificate fetch...\n');

    // First, check if there are any certificates
    console.log('1. Checking existing certificates...');
    const allCerts = await executeQuery('SELECT * FROM certificates ORDER BY created_at DESC LIMIT 5');
    console.log('Recent certificates:', allCerts);

    if (allCerts.length === 0) {
      console.log('\nNo certificates found. Please complete a quiz first.');
      process.exit(0);
    }

    const testCert = allCerts[0];
    console.log('\n2. Testing with certificate:');
    console.log('   ID:', testCert.id);
    console.log('   Share Token:', testCert.share_token);
    console.log('   Title:', testCert.title);

    // Test the fetch by share token
    console.log('\n3. Fetching certificate by share token...');
    const certs = await executeQuery(
      'SELECT * FROM certificates WHERE share_token = ?',
      [testCert.share_token]
    );

    if (certs.length === 0) {
      console.log('✗ Certificate not found by share token!');
      process.exit(1);
    }

    console.log('✓ Certificate found:', certs[0]);

    // Get user profile
    console.log('\n4. Getting user profile...');
    const profiles = await executeQuery(
      'SELECT username FROM profiles WHERE user_id = ?',
      [certs[0].user_id]
    );

    console.log('Profile:', profiles.length > 0 ? profiles[0] : 'Not found');

    console.log('\n✓ ALL TESTS PASSED!');
    console.log(`\nTest URL: http://localhost:5173/certificate/${testCert.share_token}`);
    process.exit(0);

  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testCertificateFetch();
