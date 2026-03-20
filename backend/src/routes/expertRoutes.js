const router = require('express').Router();
const expertController = require('../controllers/expertController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/recommendations', authenticate, authorize('admin'), expertController.getRecommendations);
router.get('/me', authenticate, authorize('expert'), expertController.getMyProfile);
router.patch('/me', authenticate, authorize('expert'), expertController.updateMyProfile);
router.get('/', authenticate, authorize('admin'), expertController.getAll);
router.get('/:id', authenticate, expertController.getById);
router.patch('/:id/status', authenticate, authorize('admin'), expertController.updateStatus);
router.patch('/:id', authenticate, authorize('admin'), expertController.update);

module.exports = router;
