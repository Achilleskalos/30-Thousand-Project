const router = require('express').Router();
const authRoutes = require('./authRoutes');
const expertRoutes = require('./expertRoutes');
const solutionRoutes = require('./solutionRoutes');
const projectRoutes = require('./projectRoutes');
const statsRoutes = require('./statsRoutes');
const organizationRoutes = require('./organizationRoutes');
const dictionaryRoutes = require('./dictionaryRoutes');
const configRoutes = require('./configRoutes');
const attachmentRoutes = require('./attachmentRoutes');
const auditRoutes = require('./auditRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/auth', authRoutes);
router.use('/experts', expertRoutes);
router.use('/solutions', solutionRoutes);
router.use('/projects', projectRoutes);
router.use('/stats', statsRoutes);
router.use('/organizations', organizationRoutes);
router.use('/dictionaries', dictionaryRoutes);
router.use('/config', configRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

router.get('/health', (req, res) => res.json({ success: true, message: 'API is running' }));

module.exports = router;
