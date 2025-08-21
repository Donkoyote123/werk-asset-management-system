// Test script to verify bcrypt hashing with known credentials
const bcrypt = require('bcryptjs');

async function testKnownCredentials() {
  // Test with admin credentials that should work
  const adminPassword = 'werk@321';
  const adminHash = '$2b$10$CwTwOuLq7BVBX7GgLzfgGOxIjPUNjGpKS4gJ3l2sHV8z4y5h7nZRG';
  
  console.log('Testing admin credentials:');
  console.log('Password:', adminPassword);
  console.log('Hash:', adminHash);
  
  const isValidAdmin = await bcrypt.compare(adminPassword, adminHash);
  console.log('Admin password valid:', isValidAdmin);
  
  // Test with the new user credentials
  const markoPassword = '@cu5H41dXZuI';
  console.log('\nTesting Marko credentials:');
  console.log('Password:', markoPassword);
  
  // Create a new hash for Marko's password
  const markoHash = await bcrypt.hash(markoPassword, 10);
  console.log('New hash for Marko:', markoHash);
  
  const isValidMarko = await bcrypt.compare(markoPassword, markoHash);
  console.log('Marko password valid with new hash:', isValidMarko);
}

testKnownCredentials().catch(console.error);
