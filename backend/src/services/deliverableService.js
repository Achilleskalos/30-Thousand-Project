const pool = require('../config/db');

const getByProject = async (projectId) => {
  const { rows } = await pool.query(
    `SELECT d.*, ep.full_name AS submitted_by_name, u.email AS created_by_email
     FROM deliverables d
     LEFT JOIN expert_profiles ep ON ep.id = d.submitted_by
     LEFT JOIN users u ON u.id = d.created_by
     WHERE d.project_id = $1 ORDER BY d.due_date ASC NULLS LAST, d.created_at ASC`,
    [projectId]
  );
  return rows;
};

const create = async (projectId, userId, data) => {
  const { title, description, due_date } = data;
  const { rows } = await pool.query(
    `INSERT INTO deliverables (project_id, title, description, due_date, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [projectId, title, description, due_date || null, userId]
  );
  return rows[0];
};

const submit = async (id, expertId) => {
  const { rows } = await pool.query(
    `UPDATE deliverables SET status = 'submitted', submitted_by = $1, submitted_at = NOW(), updated_at = NOW()
     WHERE id = $2 AND status = 'pending' RETURNING *`,
    [expertId, id]
  );
  if (!rows.length) { const e = new Error('交付物不存在或状态不可提交'); e.status = 400; throw e; }
  return rows[0];
};

const review = async (id, reviewerId, { status, review_note }) => {
  if (!['approved', 'rejected'].includes(status)) {
    const e = new Error('无效状态'); e.status = 400; throw e;
  }
  const { rows } = await pool.query(
    `UPDATE deliverables SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $4 AND status = 'submitted' RETURNING *`,
    [status, review_note, reviewerId, id]
  );
  if (!rows.length) { const e = new Error('交付物不存在或尚未提交'); e.status = 400; throw e; }
  return rows[0];
};

const remove = async (id) => {
  await pool.query('DELETE FROM deliverables WHERE id = $1', [id]);
};

module.exports = { getByProject, create, submit, review, remove };
