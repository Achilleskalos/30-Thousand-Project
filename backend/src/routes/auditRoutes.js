const router = require('express').Router();
const pool = require('../config/db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { entityType, entityId, action, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let i = 1;
    if (entityType) { conditions.push(`al.entity_type = $${i++}`); params.push(entityType); }
    if (entityId) { conditions.push(`al.entity_id = $${i++}`); params.push(entityId); }
    if (action) { conditions.push(`al.action ILIKE $${i++}`); params.push(`%${action}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT al.*, u.email AS user_email FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${where} ORDER BY al.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, parseInt(limit), offset]
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM audit_logs al ${where}`, params
    );
    res.json({ success: true, data: { data: rows, total: parseInt(countRows[0].count), page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
});

module.exports = router;
