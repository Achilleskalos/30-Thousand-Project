const pool = require('../config/db');

const getAll = async (category) => {
  const { rows } = await pool.query(
    `SELECT * FROM dictionaries ${category ? 'WHERE category = $1' : ''} ORDER BY category, sort_order ASC`,
    category ? [category] : []
  );
  return rows;
};

const getByCategory = async (category) => {
  const { rows } = await pool.query(
    'SELECT * FROM dictionaries WHERE category = $1 AND is_active = TRUE ORDER BY sort_order ASC',
    [category]
  );
  return rows;
};

const create = async (data) => {
  const { category, code, label, sort_order, remark } = data;
  const { rows } = await pool.query(
    'INSERT INTO dictionaries (category, code, label, sort_order, remark) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [category, code, label, sort_order || 0, remark]
  );
  return rows[0];
};

const update = async (id, data) => {
  const { label, sort_order, is_active, remark } = data;
  const { rows } = await pool.query(
    `UPDATE dictionaries SET
       label = COALESCE($1, label), sort_order = COALESCE($2, sort_order),
       is_active = COALESCE($3, is_active), remark = COALESCE($4, remark)
     WHERE id = $5 RETURNING *`,
    [label, sort_order, is_active, remark, id]
  );
  if (!rows.length) { const e = new Error('字典项不存在'); e.status = 404; throw e; }
  return rows[0];
};

const remove = async (id) => {
  await pool.query('DELETE FROM dictionaries WHERE id = $1', [id]);
};

module.exports = { getAll, getByCategory, create, update, remove };
