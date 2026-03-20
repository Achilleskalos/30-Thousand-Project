const pool = require('../config/db');
const auditLog = require('../utils/auditLog');
const notificationService = require('./notificationService');

const getAll = async ({ page = 1, limit = 10, status, search, category }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let i = 1;

  if (status) { conditions.push(`s.status = $${i++}`); params.push(status); }
  if (category) { conditions.push(`s.category = $${i++}`); params.push(category); }
  if (search) {
    conditions.push(`(s.title ILIKE $${i} OR ep.full_name ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT s.*, ep.full_name AS expert_name, ep.organization
     FROM solutions s JOIN expert_profiles ep ON ep.id = s.expert_id
     ${where} ORDER BY s.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM solutions s JOIN expert_profiles ep ON ep.id = s.expert_id ${where}`,
    params
  );
  return { data: rows, total: parseInt(countRows[0].count), page, limit };
};

const getByExpert = async (expertId, { page = 1, limit = 10, status }) => {
  const offset = (page - 1) * limit;
  const conditions = [`s.expert_id = $1`];
  const params = [expertId];
  let i = 2;

  if (status) { conditions.push(`s.status = $${i++}`); params.push(status); }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const { rows } = await pool.query(
    `SELECT s.* FROM solutions s ${where} ORDER BY s.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM solutions s ${where}`, params
  );
  return { data: rows, total: parseInt(countRows[0].count), page, limit };
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT s.*, ep.full_name AS expert_name, ep.organization, u.email AS expert_email
     FROM solutions s
     JOIN expert_profiles ep ON ep.id = s.expert_id
     JOIN users u ON u.id = ep.user_id
     WHERE s.id = $1`,
    [id]
  );
  if (!rows.length) { const e = new Error('方案不存在'); e.status = 404; throw e; }
  const solution = rows[0];
  const { rows: reviews } = await pool.query(
    `SELECT sr.*, u.email AS reviewer_email FROM solution_reviews sr
     LEFT JOIN users u ON u.id = sr.reviewer_id
     WHERE sr.solution_id = $1 ORDER BY sr.stage ASC`,
    [id]
  );
  solution.reviews = reviews;
  return solution;
};

const create = async (expertId, data) => {
  const { title, abstract, content, category, tags } = data;
  const { rows } = await pool.query(
    `INSERT INTO solutions (expert_id, title, abstract, content, category, tags)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [expertId, title, abstract, content, category, tags || []]
  );
  return rows[0];
};

const update = async (id, expertId, data, userId) => {
  const { rows: current } = await pool.query('SELECT * FROM solutions WHERE id = $1', [id]);
  if (!current.length) { const e = new Error('方案不存在'); e.status = 404; throw e; }
  if (current[0].expert_id !== expertId) { const e = new Error('无权操作'); e.status = 403; throw e; }
  if (!['draft', 'revision_required'].includes(current[0].status)) {
    const e = new Error('当前状态不可编辑'); e.status = 400; throw e;
  }

  // Save current version before overwriting
  const { rows: versionRows } = await pool.query(
    'SELECT COALESCE(MAX(version), 0) AS max_ver FROM solution_versions WHERE solution_id = $1', [id]
  );
  const nextVer = parseInt(versionRows[0].max_ver) + 1;
  const old = current[0];
  await pool.query(
    `INSERT INTO solution_versions (solution_id, version, title, abstract, content, category, tags, saved_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, nextVer, old.title, old.abstract, old.content, old.category, old.tags, userId]
  );

  const fields = ['title', 'abstract', 'content', 'category', 'tags'];
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
    `UPDATE solutions SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, params
  );
  await auditLog.log({ userId, action: 'solution_updated', entityType: 'solution', entityId: id });
  return rows[0];
};

const submit = async (id, expertId) => {
  const { rows } = await pool.query('SELECT status, expert_id FROM solutions WHERE id = $1', [id]);
  if (!rows.length) { const e = new Error('方案不存在'); e.status = 404; throw e; }
  if (rows[0].expert_id !== expertId) { const e = new Error('无权操作'); e.status = 403; throw e; }
  if (!['draft', 'revision_required'].includes(rows[0].status)) {
    const e = new Error('当前状态不可提交'); e.status = 400; throw e;
  }
  const { rows: updated } = await pool.query(
    `UPDATE solutions SET status = 'submitted', updated_at = NOW() WHERE id = $1 RETURNING *`, [id]
  );
  return updated[0];
};

const review = async (id, reviewerId, { verdict, comments }) => {
  const { rows } = await pool.query('SELECT * FROM solutions WHERE id = $1', [id]);
  if (!rows.length) { const e = new Error('方案不存在'); e.status = 404; throw e; }
  if (!['submitted', 'under_review'].includes(rows[0].status)) {
    const e = new Error('当前状态不可审核'); e.status = 400; throw e;
  }

  const statusMap = {
    approved: 'approved',
    rejected: 'rejected',
    revision_required: 'revision_required',
  };
  const newStatus = statusMap[verdict];
  if (!newStatus) { const e = new Error('无效的审核结果'); e.status = 400; throw e; }

  const stage = (rows[0].current_stage || 0) + 1;
  await pool.query(
    `INSERT INTO solution_reviews (solution_id, stage, reviewer_id, verdict, comments) VALUES ($1,$2,$3,$4,$5)`,
    [id, stage, reviewerId, verdict, comments]
  );
  const { rows: updated } = await pool.query(
    `UPDATE solutions SET status = $1, current_stage = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
    [newStatus, stage, id]
  );
  // Notify expert
  const { rows: expert } = await pool.query(
    `SELECT ep.user_id FROM expert_profiles ep WHERE ep.id = $1`, [rows[0].expert_id]
  );
  if (expert.length && (verdict === 'approved' || verdict === 'rejected')) {
    const notifType = verdict === 'approved' ? 'solution_approved' : 'solution_rejected';
    await notificationService.create(expert[0].user_id, notifType, { solution_id: id, title: rows[0].title }).catch(() => {});
  }
  return updated[0];
};

const archive = async (id) => {
  const { rows } = await pool.query(
    `UPDATE solutions SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *`, [id]
  );
  if (!rows.length) { const e = new Error('方案不存在'); e.status = 404; throw e; }
  return rows[0];
};

const getVersions = async (solutionId) => {
  const { rows } = await pool.query(
    `SELECT sv.*, u.email AS saved_by_email FROM solution_versions sv
     LEFT JOIN users u ON u.id = sv.saved_by
     WHERE sv.solution_id = $1 ORDER BY sv.version DESC`,
    [solutionId]
  );
  return rows;
};

module.exports = { getAll, getByExpert, getById, create, update, submit, review, archive, getVersions };
