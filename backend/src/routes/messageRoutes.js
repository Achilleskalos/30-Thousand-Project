const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const c = require('../controllers/messageController');

router.use(auth);
router.get('/inbox', c.getInbox);
router.get('/unread-count', c.getUnreadCount);
router.get('/thread/:threadId', c.getThread);
router.post('/send', c.send);

module.exports = router;
