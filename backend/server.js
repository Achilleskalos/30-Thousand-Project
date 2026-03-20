require('dotenv').config();
const app = require('./src/config/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
};

start();
