const expertService = require('../services/expertService');

const getAll = async (req, res, next) => {
  try {
    const result = await expertService.getAll(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await expertService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const data = await expertService.getByUserId(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await expertService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await expertService.getByUserId(req.user.id);
    const data = await expertService.update(profile.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const data = await expertService.updateStatus(req.params.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getRecommendations = async (req, res, next) => {
  try {
    const data = await expertService.getRecommendations(req.query.project_id, req.query.limit);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getMyProfile, update, updateMyProfile, updateStatus, getRecommendations };
