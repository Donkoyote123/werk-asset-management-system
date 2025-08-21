const bcrypt = require('bcryptjs');

async function generateHashes() {
  try {
    const passwords = ['werk@321', 'temp123', 'temp456', 'temp789'];
    const names = ['Admin (werk@321)', 'DK (temp123)', 'JS (temp456)', 'MJ (temp789)'];
    
    for (let i = 0; i < passwords.length; i++) {
      const hash = await bcrypt.hash(passwords[i], 10);
      console.log(`Hash for ${names[i]}:`, hash);
      
      // Test the hash
      const isValid = await bcrypt.compare(passwords[i], hash);
      console.log(`Hash validation for ${names[i]}:`, isValid);
      console.log('---');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHashes();
