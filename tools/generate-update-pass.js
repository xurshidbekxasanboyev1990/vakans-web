const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const outputPath = path.resolve(__dirname, '..', 'update-pass.sql');

const employerHash = bcrypt.hashSync('employer123', 10);
const workerHash = bcrypt.hashSync('worker123', 10);
const adminHash = bcrypt.hashSync('XOJISAID.13.13', 10);

const sql = [
  `UPDATE users SET password_hash = '${employerHash}' WHERE phone = '+998901234567';`,
  `UPDATE users SET password_hash = '${workerHash}' WHERE phone = '+998907654321';`,
  `UPDATE users SET password_hash = '${adminHash}' WHERE phone = '+998996983806';`,
  '',
].join('\n');

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Wrote', outputPath);
