const router = require('express').Router();
const c = require('../controllers/configController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, authorize('admin'), c.getAll);
router.patch('/:key', authenticate, authorize('admin'), c.update);

module.exports = router;
