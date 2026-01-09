const bcrypt = require('bcryptjs');
const hash = '$2b$10$D/MxrVe1jo.TJ4ByPFKppu34/qDYh1ipAA8nx7/HaiyWa1UIwBl7e';
bcrypt.compare('employer123', hash).then(result => {
  console.log('Compare result:', result);
  
  // Also test creating new hash and comparing
  const newHash = bcrypt.hashSync('employer123', 10);
  console.log('New hash:', newHash);
  console.log('New compare:', bcrypt.compareSync('employer123', newHash));
});
