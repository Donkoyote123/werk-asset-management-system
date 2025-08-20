const bcrypt = require('bcryptjs');

// Test the admin password
const storedHash = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
const testPassword = "werk@321";

console.log('Testing admin password...');
console.log('Password matches:', bcrypt.compareSync(testPassword, storedHash));

// Generate fresh hash for verification
console.log('Fresh hash for werk@321:', bcrypt.hashSync('werk@321', 10));
