require('dotenv').config();
const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'src/migrations');

const run = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
      if (rows.length) {
        console.log(`  [skip] ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      console.log(`  [done] ${file}`);
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

run();
