const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const c = require('../controllers/notificationController');

router.use(auth);
router.get('/', c.getMyNotifications);
router.get('/unread-count', c.getUnreadCount);
router.patch('/:id/read', c.markRead);
router.patch('/mark-all-read', c.markAllRead);

module.exports = router;
