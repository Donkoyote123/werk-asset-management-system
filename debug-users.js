// Debug script to check user creation and hashing
const bcrypt = require('bcryptjs');

async function testPasswordHash() {
  const plainPassword = '@cu5H41dXZuI';
  const username = 'M.assets@werk';
  
  // Test hashing
  const hash1 = await bcrypt.hash(plainPassword, 10);
  const hash2 = await bcrypt.hash(plainPassword, 10);
  
  console.log('Plain password:', plainPassword);
  console.log('Username:', username);
  console.log('Hash 1:', hash1);
  console.log('Hash 2:', hash2);
  
  // Test comparison
  const isMatch1 = await bcrypt.compare(plainPassword, hash1);
  const isMatch2 = await bcrypt.compare(plainPassword, hash2);
  
  console.log('Password matches hash 1:', isMatch1);
  console.log('Password matches hash 2:', isMatch2);
  
  // Test wrong password
  const wrongMatch = await bcrypt.compare('wrongpassword', hash1);
  console.log('Wrong password matches:', wrongMatch);
}

testPasswordHash().catch(console.error);
