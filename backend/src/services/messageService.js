const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const notificationService = require('./notificationService');

const getInbox = async (userId) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (m.thread_id)
       m.thread_id, m.subject, m.body, m.created_at, m.is_read,
       m.sender_id, m.recipient_id,
       s.email AS sender_email,
       r.email AS recipient_email,
       (SELECT COUNT(*) FROM messages WHERE thread_id = m.thread_id) AS message_count,
       (SELECT COUNT(*) FROM messages WHERE thread_id = m.thread_id AND recipient_id = $1 AND is_read = false) AS unread_count
     FROM messages m
     JOIN users s ON s.id = m.sender_id
     JOIN users r ON r.id = m.recipient_id
     WHERE m.recipient_id = $1 OR m.sender_id = $1
     ORDER BY m.thread_id, m.created_at DESC`,
    [userId]
  );
  return rows;
};

const getThread = async (threadId, userId) => {
  const { rows } = await pool.query(
    `SELECT m.*, s.email AS sender_email FROM messages m
     JOIN users s ON s.id = m.sender_id
     WHERE m.thread_id = $1 ORDER BY m.created_at ASC`,
    [threadId]
  );
  // Mark messages as read for this user
  await pool.query(
    `UPDATE messages SET is_read = true WHERE thread_id = $1 AND recipient_id = $2 AND is_read = false`,
    [threadId, userId]
  );
  return rows;
};

const send = async (senderId, { recipientId, subject, body, threadId }) => {
  const tid = threadId || uuidv4();
  const { rows } = await pool.query(
    `INSERT INTO messages (thread_id, sender_id, recipient_id, subject, body)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [tid, senderId, recipientId, subject || null, body]
  );
  // Trigger notification
  await notificationService.create(recipientId, 'new_message', {
    thread_id: tid,
    sender_id: senderId,
    subject: subject || '新消息',
  });
  return rows[0];
};

const getUnreadCount = async (userId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(rows[0].count);
};

module.exports = { getInbox, getThread, send, getUnreadCount };
