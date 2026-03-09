const bcrypt = require('bcrypt');

async function testBcrypt() {
    const password = 'password123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Hash produced:', hash);

    const isValid = await bcrypt.compare(password, hash);
    console.log('Comparison result:', isValid);

    const isWrong = await bcrypt.compare('wrongpassword', hash);
    console.log('Wrong password comparison:', isWrong);
}

testBcrypt();
