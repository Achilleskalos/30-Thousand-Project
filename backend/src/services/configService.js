const pool = require('../config/db');

const getAll = async () => {
  const { rows } = await pool.query('SELECT * FROM system_config ORDER BY group_name, config_key');
  return rows;
};

const getByKey = async (key) => {
  const { rows } = await pool.query('SELECT * FROM system_config WHERE config_key = $1', [key]);
  return rows[0] || null;
};

const update = async (key, { config_val }, userId) => {
  const { rows } = await pool.query(
    'UPDATE system_config SET config_val = $1, updated_by = $2, updated_at = NOW() WHERE config_key = $3 RETURNING *',
    [config_val, userId, key]
  );
  if (!rows.length) { const e = new Error('配置项不存在'); e.status = 404; throw e; }
  return rows[0];
};

module.exports = { getAll, getByKey, update };
