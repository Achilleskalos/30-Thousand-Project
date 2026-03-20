const router = require('express').Router();
const c = require('../controllers/organizationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getById);
router.post('/', authenticate, authorize('admin'), c.create);
router.patch('/:id', authenticate, authorize('admin'), c.update);
router.post('/:id/departments', authenticate, authorize('admin'), c.createDept);
router.patch('/:id/departments/:deptId', authenticate, authorize('admin'), c.updateDept);

module.exports = router;
