const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { sign } = require('../config/jwt');

const register = async ({ email, password, fullName, role = 'expert' }) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const hash = await hashPassword(password);
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, hash, role]
  );
  const user = rows[0];
  if (role === 'expert') {
    await pool.query(
      'INSERT INTO expert_profiles (user_id, full_name) VALUES ($1, $2)',
      [user.id, fullName]
    );
  }
  const token = sign({ id: user.id, email: user.email, role: user.role });
  return { token, user };
};

const login = async ({ email, password }) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, password_hash, is_active FROM users WHERE email = $1',
    [email]
  );
  if (rows.length === 0) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const user = rows[0];
  if (!user.is_active) {
    const err = new Error('Account is inactive');
    err.status = 403;
    throw err;
  }
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = sign({ id: user.id, email: user.email, role: user.role });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
};

const getMe = async (userId) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.role, u.created_at,
            ep.id as profile_id, ep.full_name, ep.status as profile_status, ep.avatar_url
     FROM users u
     LEFT JOIN expert_profiles ep ON ep.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  return rows[0];
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  const valid = await comparePassword(currentPassword, rows[0].password_hash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }
  const hash = await hashPassword(newPassword);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, userId]);
};

const setupAdmin = async ({ email, password, fullName }) => {
  const existing = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (existing.rows.length > 0) {
    const err = new Error('管理员账号已存在，此接口已关闭');
    err.status = 403;
    throw err;
  }
  const hash = await hashPassword(password);
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, hash, 'admin']
  );
  const user = rows[0];
  const token = sign({ id: user.id, email: user.email, role: user.role });
  return { token, user };
};

module.exports = { register, login, getMe, changePassword, setupAdmin };
