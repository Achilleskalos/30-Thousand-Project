const router = require('express').Router();
const c = require('../controllers/projectController');
const psSvc = require('../services/projectSolutionService');
const milestoneSvc = require('../services/milestoneService');
const deliverableSvc = require('../services/deliverableService');
const expertSvc = require('../services/expertService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/my', authenticate, authorize('expert'), c.getMyProjects);
router.patch('/:id/progress', authenticate, authorize('expert'), c.updateProgress);

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getById);
router.post('/', authenticate, authorize('admin'), c.create);
router.patch('/:id', authenticate, authorize('admin'), c.update);
router.post('/:id/experts', authenticate, authorize('admin'), c.addExpert);
router.delete('/:id/experts/:expertId', authenticate, authorize('admin'), c.removeExpert);

// Solution linking
router.get('/:id/solutions', authenticate, async (req, res, next) => {
  try { res.json({ success: true, data: await psSvc.getSolutionsForProject(req.params.id) }); } catch (err) { next(err); }
});
router.post('/:id/solutions', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { solutionId, note } = req.body;
    res.json({ success: true, data: await psSvc.linkSolution(req.params.id, solutionId, req.user.id, note) });
  } catch (err) { next(err); }
});
router.delete('/:id/solutions/:solutionId', authenticate, authorize('admin'), async (req, res, next) => {
  try { await psSvc.unlinkSolution(req.params.id, req.params.solutionId); res.json({ success: true }); } catch (err) { next(err); }
});

// Milestones
router.get('/:id/milestones', authenticate, async (req, res, next) => {
  try { res.json({ success: true, data: await milestoneSvc.getByProject(req.params.id) }); } catch (err) { next(err); }
});
router.post('/:id/milestones', authenticate, authorize('admin'), async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await milestoneSvc.create(req.params.id, req.user.id, req.body) }); } catch (err) { next(err); }
});
router.patch('/:id/milestones/:mid', authenticate, authorize('admin'), async (req, res, next) => {
  try { res.json({ success: true, data: await milestoneSvc.update(req.params.mid, req.body) }); } catch (err) { next(err); }
});
router.delete('/:id/milestones/:mid', authenticate, authorize('admin'), async (req, res, next) => {
  try { await milestoneSvc.remove(req.params.mid); res.json({ success: true }); } catch (err) { next(err); }
});

// Deliverables
router.get('/:id/deliverables', authenticate, async (req, res, next) => {
  try { res.json({ success: true, data: await deliverableSvc.getByProject(req.params.id) }); } catch (err) { next(err); }
});
router.post('/:id/deliverables', authenticate, authorize('admin'), async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await deliverableSvc.create(req.params.id, req.user.id, req.body) }); } catch (err) { next(err); }
});
router.post('/:id/deliverables/:did/submit', authenticate, authorize('expert'), async (req, res, next) => {
  try {
    const profile = await expertSvc.getByUserId(req.user.id);
    res.json({ success: true, data: await deliverableSvc.submit(req.params.did, profile.id) });
  } catch (err) { next(err); }
});
router.post('/:id/deliverables/:did/review', authenticate, authorize('admin'), async (req, res, next) => {
  try { res.json({ success: true, data: await deliverableSvc.review(req.params.did, req.user.id, req.body) }); } catch (err) { next(err); }
});
router.delete('/:id/deliverables/:did', authenticate, authorize('admin'), async (req, res, next) => {
  try { await deliverableSvc.remove(req.params.did); res.json({ success: true }); } catch (err) { next(err); }
});

// Expert recommendations
router.get('/:id/recommendations', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const data = await expertSvc.getRecommendations(req.params.id, req.query.limit || 10);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
