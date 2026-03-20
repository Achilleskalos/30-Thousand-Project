const router = require('express').Router();
const c = require('../controllers/solutionController');
const psSvc = require('../services/projectSolutionService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Expert routes
router.get('/my', authenticate, authorize('expert'), c.getMySolutions);
router.post('/', authenticate, authorize('expert'), c.create);
router.patch('/:id', authenticate, authorize('expert'), c.update);
router.post('/:id/submit', authenticate, authorize('expert'), c.submit);

// Admin routes
router.get('/', authenticate, authorize('admin'), c.getAll);
router.post('/:id/review', authenticate, authorize('admin'), c.review);
router.post('/:id/archive', authenticate, authorize('admin'), c.archive);

// Shared
router.get('/:id', authenticate, c.getById);
router.get('/:id/versions', authenticate, c.getVersions);
router.get('/:id/projects', authenticate, async (req, res, next) => {
  try { res.json({ success: true, data: await psSvc.getProjectsForSolution(req.params.id) }); } catch (err) { next(err); }
});

module.exports = router;
