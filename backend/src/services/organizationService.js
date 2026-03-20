const pool = require('../config/db');

const getAllOrganizations = async ({ search, is_active } = {}) => {
  const conditions = [];
  const params = [];
  let i = 1;
  if (search) { conditions.push(`o.name ILIKE $${i++}`); params.push(`%${search}%`); }
  if (is_active !== undefined) { conditions.push(`o.is_active = $${i++}`); params.push(is_active); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT o.*, (SELECT COUNT(*) FROM departments d WHERE d.organization_id = o.id) AS dept_count
     FROM organizations o ${where} ORDER BY o.name ASC`, params
  );
  return rows;
};

const getOrganizationById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
  if (!rows.length) { const e = new Error('机构不存在'); e.status = 404; throw e; }
  const org = rows[0];
  const { rows: depts } = await pool.query(
    'SELECT * FROM departments WHERE organization_id = $1 ORDER BY name ASC', [id]
  );
  org.departments = depts;
  return org;
};

const createOrganization = async (data) => {
  const { name, short_name, type, description } = data;
  const { rows } = await pool.query(
    'INSERT INTO organizations (name, short_name, type, description) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, short_name, type, description]
  );
  return rows[0];
};

const updateOrganization = async (id, data) => {
  const fields = ['name', 'short_name', 'type', 'description', 'is_active'];
  const updates = []; const params = []; let i = 1;
  for (const f of fields) {
    if (data[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(data[f]); }
  }
  if (!updates.length) return getOrganizationById(id);
  updates.push('updated_at = NOW()');
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, params
  );
  return rows[0];
};

const createDepartment = async (organizationId, data) => {
  const { name, parent_id } = data;
  const { rows } = await pool.query(
    'INSERT INTO departments (organization_id, name, parent_id) VALUES ($1,$2,$3) RETURNING *',
    [organizationId, name, parent_id || null]
  );
  return rows[0];
};

const updateDepartment = async (id, data) => {
  const { name, is_active } = data;
  const { rows } = await pool.query(
    'UPDATE departments SET name = COALESCE($1, name), is_active = COALESCE($2, is_active), updated_at = NOW() WHERE id = $3 RETURNING *',
    [name, is_active, id]
  );
  if (!rows.length) { const e = new Error('部门不存在'); e.status = 404; throw e; }
  return rows[0];
};

module.exports = { getAllOrganizations, getOrganizationById, createOrganization, updateOrganization, createDepartment, updateDepartment };
