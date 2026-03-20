const pool = require('../config/db');
const auditLog = require('../utils/auditLog');
const notificationService = require('./notificationService');

const getAll = async ({ page = 1, limit = 10, status, search }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let i = 1;

  if (status) { conditions.push(`ep.status = $${i++}`); params.push(status); }
  if (search) {
    conditions.push(`(ep.full_name ILIKE $${i} OR ep.organization ILIKE $${i} OR u.email ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT ep.*, u.email, u.is_active FROM expert_profiles ep
     JOIN users u ON u.id = ep.user_id
     ${where} ORDER BY ep.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM expert_profiles ep JOIN users u ON u.id = ep.user_id ${where}`,
    params
  );
  return { data: rows, total: parseInt(countRows[0].count), page, limit };
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT ep.*, u.email, u.is_active FROM expert_profiles ep
     JOIN users u ON u.id = ep.user_id WHERE ep.id = $1`,
    [id]
  );
  if (!rows.length) { const e = new Error('专家不存在'); e.status = 404; throw e; }
  return rows[0];
};

const getByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ep.*, u.email FROM expert_profiles ep
     JOIN users u ON u.id = ep.user_id WHERE ep.user_id = $1`,
    [userId]
  );
  if (!rows.length) { const e = new Error('资料不存在'); e.status = 404; throw e; }
  return rows[0];
};

const update = async (id, data, userId) => {
  const fields = ['full_name', 'title', 'organization', 'phone', 'bio', 'domain_tags', 'skills', 'years_exp', 'linkedin_url', 'avatar_url'];
  const updates = [];
  const params = [];
  let i = 1;
  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${i++}`);
      params.push(data[field]);
    }
  }
  if (!updates.length) return getById(id);
  const oldRecord = await getById(id);
  updates.push(`updated_at = NOW()`);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE expert_profiles SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
    params
  );
  await auditLog.log({ userId, action: 'expert_profile_updated', entityType: 'expert_profile', entityId: id, oldData: oldRecord, newData: rows[0] });
  return rows[0];
};

const updateStatus = async (id, { status, reviewNote }, adminId) => {
  const oldRecord = await getById(id);
  const { rows } = await pool.query(
    `UPDATE expert_profiles SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [status, reviewNote, adminId, id]
  );
  if (!rows.length) { const e = new Error('专家不存在'); e.status = 404; throw e; }
  await auditLog.log({ userId: adminId, action: 'expert_status_changed', entityType: 'expert_profile', entityId: id, oldData: { status: oldRecord.status }, newData: { status, reviewNote } });
  if (status === 'approved' || status === 'rejected') {
    const notifType = status === 'approved' ? 'expert_approved' : 'expert_rejected';
    await notificationService.create(rows[0].user_id, notifType, { review_note: reviewNote }).catch(() => {});
  }
  return rows[0];
};

const getRecommendations = async (projectId, limit = 10) => {
  const { rows: project } = await pool.query('SELECT required_skills, required_domains FROM projects WHERE id = $1', [projectId]);
  if (!project.length) { const e = new Error('项目不存在'); e.status = 404; throw e; }
  const { required_skills, required_domains } = project[0];
  const { rows } = await pool.query(
    `SELECT ep.*, u.email,
      (SELECT COUNT(*) FROM unnest(ep.skills) s WHERE s = ANY($1::text[])) +
      (SELECT COUNT(*) FROM unnest(ep.domain_tags) d WHERE d = ANY($2::text[])) AS match_score
     FROM expert_profiles ep JOIN users u ON u.id = ep.user_id
     WHERE ep.status = 'approved'
     ORDER BY match_score DESC, ep.years_exp DESC NULLS LAST
     LIMIT $3`,
    [required_skills || [], required_domains || [], limit]
  );
  return rows;
};

module.exports = { getAll, getById, getByUserId, update, updateStatus, getRecommendations };
