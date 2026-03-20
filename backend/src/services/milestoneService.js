const pool = require('../config/db');

const getByProject = async (projectId) => {
  const { rows } = await pool.query(
    `SELECT m.*, u.email AS created_by_email FROM milestones m
     LEFT JOIN users u ON u.id = m.created_by
     WHERE m.project_id = $1 ORDER BY m.due_date ASC NULLS LAST, m.created_at ASC`,
    [projectId]
  );
  return rows;
};

const create = async (projectId, userId, data) => {
  const { title, description, due_date } = data;
  const { rows } = await pool.query(
    `INSERT INTO milestones (project_id, title, description, due_date, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [projectId, title, description, due_date || null, userId]
  );
  return rows[0];
};

const update = async (id, data) => {
  const fields = ['title', 'description', 'due_date', 'status'];
  const updates = []; const params = []; let i = 1;
  for (const f of fields) {
    if (data[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(data[f]); }
  }
  if (data.status === 'completed') { updates.push(`completed_at = NOW()`); }
  if (!updates.length) { const e = new Error('无更新内容'); e.status = 400; throw e; }
  updates.push(`updated_at = NOW()`);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE milestones SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, params
  );
  if (!rows.length) { const e = new Error('里程碑不存在'); e.status = 404; throw e; }
  return rows[0];
};

const remove = async (id) => {
  await pool.query('DELETE FROM milestones WHERE id = $1', [id]);
};

module.exports = { getByProject, create, update, remove };
