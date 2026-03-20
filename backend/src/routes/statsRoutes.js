const router = require('express').Router();
const c = require('../controllers/statsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/overview', authenticate, authorize('admin'), c.getOverview);
router.get('/charts', authenticate, authorize('admin'), c.getCharts);

module.exports = router;
