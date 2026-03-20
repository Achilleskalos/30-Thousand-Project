const projectService = require('../services/projectService');
const expertService = require('../services/expertService');

const getAll = async (req, res, next) => {
  try {
    const result = await projectService.getAll(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await projectService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMyProjects = async (req, res, next) => {
  try {
    const profile = await expertService.getByUserId(req.user.id);
    const result = await projectService.getByExpert(profile.id, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await projectService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await projectService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const addExpert = async (req, res, next) => {
  try {
    const { expertId, role } = req.body;
    const data = await projectService.addExpert(req.params.id, expertId, role);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const removeExpert = async (req, res, next) => {
  try {
    const data = await projectService.removeExpert(req.params.id, req.params.expertId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const updateProgress = async (req, res, next) => {
  try {
    const profile = await expertService.getByUserId(req.user.id);
    const data = await projectService.updateProgress(req.params.id, profile.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getMyProjects, create, update, addExpert, removeExpert, updateProgress };
