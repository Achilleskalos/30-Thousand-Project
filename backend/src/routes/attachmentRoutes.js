const router = require('express').Router();
const path = require('path');
const pool = require('../config/db');
const c = require('../controllers/attachmentController');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

router.get('/:entityType/:entityId', authenticate, c.getByEntity);
router.post('/:entityType/:entityId', authenticate, upload.single('file'), c.upload);
router.delete('/:id', authenticate, c.remove);

router.get('/file/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM attachments WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: { message: '文件不存在' } });
    res.download(rows[0].file_path, rows[0].file_name);
  } catch (err) { next(err); }
});

module.exports = router;
