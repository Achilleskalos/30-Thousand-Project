const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const getByEntity = async (entityType, entityId) => {
  const { rows } = await pool.query(
    `SELECT a.*, u.email AS uploaded_by_email FROM attachments a
     LEFT JOIN users u ON u.id = a.uploaded_by
     WHERE a.entity_type = $1 AND a.entity_id = $2 ORDER BY a.created_at DESC`,
    [entityType, entityId]
  );
  return rows;
};

const create = async ({ entityType, entityId, file, userId }) => {
  const { rows } = await pool.query(
    `INSERT INTO attachments (entity_type, entity_id, file_name, file_path, file_size, mime_type, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [entityType, entityId, file.originalname, file.path, file.size, file.mimetype, userId]
  );
  return rows[0];
};

const remove = async (id, userId) => {
  const { rows } = await pool.query('SELECT * FROM attachments WHERE id = $1', [id]);
  if (!rows.length) { const e = new Error('附件不存在'); e.status = 404; throw e; }
  const att = rows[0];
  try { fs.unlinkSync(att.file_path); } catch {}
  await pool.query('DELETE FROM attachments WHERE id = $1', [id]);
};

module.exports = { getByEntity, create, remove };
