const bcrypt = require('bcryptjs');

async function generateHashes() {
  const passwords = {
    admin: 'XOJISAID.13.13',
    employer: 'employer123',
    worker: 'worker123'
  };

  console.log('-- Password Hashes for Database Update:\n');
  
  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`-- ${role}: ${password}`);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE user_type = '${role}';`);
    console.log('');
  }
}

generateHashes().catch(console.error);
