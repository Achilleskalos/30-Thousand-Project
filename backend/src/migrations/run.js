require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const run = async () => {
  const files = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf-8');
    console.log(`Running ${file}...`);
    await pool.query(sql);
    console.log(`  Done.`);
  }

  console.log('All migrations completed.');
  await pool.end();
};

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
