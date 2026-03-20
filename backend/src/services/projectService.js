const pool = require('../config/db');
const notificationService = require('./notificationService');

const getAll = async ({ page = 1, limit = 10, status, search }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let i = 1;

  if (status) { conditions.push(`p.status = $${i++}`); params.push(status); }
  if (search) {
    conditions.push(`(p.title ILIKE $${i} OR p.description ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT p.*, u.email AS created_by_email,
      (SELECT COUNT(*) FROM project_experts pe WHERE pe.project_id = p.id AND pe.status != 'removed') AS expert_count
     FROM projects p LEFT JOIN users u ON u.id = p.created_by
     ${where} ORDER BY p.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM projects p ${where}`, params
  );
  return { data: rows, total: parseInt(countRows[0].count), page, limit };
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.email AS created_by_email FROM projects p
     LEFT JOIN users u ON u.id = p.created_by WHERE p.id = $1`,
    [id]
  );
  if (!rows.length) { const e = new Error('项目不存在'); e.status = 404; throw e; }
  const project = rows[0];
  const { rows: experts } = await pool.query(
    `SELECT pe.*, ep.full_name, ep.title AS expert_title, ep.organization, ep.avatar_url, ep.user_id, u.email
     FROM project_experts pe
     JOIN expert_profiles ep ON ep.id = pe.expert_id
     JOIN users u ON u.id = ep.user_id
     WHERE pe.project_id = $1 ORDER BY pe.joined_at ASC`,
    [id]
  );
  project.experts = experts;
  return project;
};

const getByExpert = async (expertId, { page = 1, limit = 10, status }) => {
  const offset = (page - 1) * limit;
  const conditions = [`pe.expert_id = $1`];
  const params = [expertId];
  let i = 2;

  if (status) { conditions.push(`p.status = $${i++}`); params.push(status); }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const { rows } = await pool.query(
    `SELECT p.*, pe.role, pe.progress_pct, pe.progress_notes, pe.status AS member_status
     FROM projects p JOIN project_experts pe ON pe.project_id = p.id
     ${where} ORDER BY p.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM projects p JOIN project_experts pe ON pe.project_id = p.id ${where}`, params
  );
  return { data: rows, total: parseInt(countRows[0].count), page, limit };
};

const create = async (userId, data) => {
  const { title, description, required_skills, required_domains, start_date, end_date } = data;
  const { rows } = await pool.query(
    `INSERT INTO projects (title, description, required_skills, required_domains, start_date, end_date, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [title, description, required_skills || [], required_domains || [], start_date, end_date, userId]
  );
  return rows[0];
};

const update = async (id, data) => {
  const fields = ['title', 'description', 'required_skills', 'required_domains', 'start_date', 'end_date', 'status'];
  const updates = [];
  const params = [];
  let i = 1;
  for (const f of fields) {
    if (data[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(data[f]); }
  }
  if (!updates.length) return getById(id);
  updates.push(`updated_at = NOW()`);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, params
  );
  if (!rows.length) { const e = new Error('项目不存在'); e.status = 404; throw e; }
  return rows[0];
};

const addExpert = async (projectId, expertId, role) => {
  const { rows } = await pool.query(
    `INSERT INTO project_experts (project_id, expert_id, role, status)
     VALUES ($1,$2,$3,'active')
     ON CONFLICT (project_id, expert_id) DO UPDATE SET status = 'active', role = $3
     RETURNING *`,
    [projectId, expertId, role || null]
  );
  // Notify expert
  const { rows: proj } = await pool.query('SELECT title FROM projects WHERE id = $1', [projectId]);
  const { rows: ep } = await pool.query('SELECT user_id FROM expert_profiles WHERE id = $1', [expertId]);
  if (ep.length) {
    await notificationService.create(ep[0].user_id, 'project_joined', { project_id: projectId, title: proj[0]?.title }).catch(() => {});
  }
  return rows[0];
};

const removeExpert = async (projectId, expertId) => {
  const { rows } = await pool.query(
    `UPDATE project_experts SET status = 'removed' WHERE project_id = $1 AND expert_id = $2 RETURNING *`,
    [projectId, expertId]
  );
  if (!rows.length) { const e = new Error('成员不存在'); e.status = 404; throw e; }
  return rows[0];
};

const updateProgress = async (projectId, expertId, { progress_pct, progress_notes }) => {
  const { rows } = await pool.query(
    `UPDATE project_experts SET progress_pct = $1, progress_notes = $2
     WHERE project_id = $3 AND expert_id = $4 AND status = 'active' RETURNING *`,
    [progress_pct, progress_notes, projectId, expertId]
  );
  if (!rows.length) { const e = new Error('成员不存在'); e.status = 404; throw e; }
  return rows[0];
};

module.exports = { getAll, getById, getByExpert, create, update, addExpert, removeExpert, updateProgress };
