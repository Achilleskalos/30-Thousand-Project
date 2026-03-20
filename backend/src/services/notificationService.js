const pool = require('../config/db');

const create = async (userId, type, data = {}) => {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, data) VALUES ($1, $2, $3) RETURNING *`,
    [userId, type, JSON.stringify(data)]
  );
  return rows[0];
};

const getByUser = async (userId, { limit = 20, offset = 0 } = {}) => {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

const getUnreadCount = async (userId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(rows[0].count);
};

const markRead = async (id, userId) => {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
};

const markAllRead = async (userId) => {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
};

module.exports = { create, getByUser, getUnreadCount, markRead, markAllRead };
