const router = require('express').Router();
const c = require('../controllers/dictionaryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, c.getAll);
router.get('/:category', authenticate, c.getByCategory);
router.post('/', authenticate, authorize('admin'), c.create);
router.patch('/:id', authenticate, authorize('admin'), c.update);
router.delete('/:id', authenticate, authorize('admin'), c.remove);

module.exports = router;
