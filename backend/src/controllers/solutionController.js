const solutionService = require('../services/solutionService');
const expertService = require('../services/expertService');

const getAll = async (req, res, next) => {
  try {
    const result = await solutionService.getAll(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getMySolutions = async (req, res, next) => {
  try {
    const profile = await expertService.getByUserId(req.user.id);
    const result = await solutionService.getByExpert(profile.id, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await solutionService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const profile = await expertService.getByUserId(req.user.id);
    const data = await solutionService.create(profile.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const profile = await expertService.getByUserId(req.user.id);
    const data = await solutionService.update(req.params.id, profile.id, req.body, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const submit = async (req, res, next) => {
  try {
    const profile = await expertService.getByUserId(req.user.id);
    const data = await solutionService.submit(req.params.id, profile.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const review = async (req, res, next) => {
  try {
    const data = await solutionService.review(req.params.id, req.user.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const archive = async (req, res, next) => {
  try {
    const data = await solutionService.archive(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getVersions = async (req, res, next) => {
  try {
    const data = await solutionService.getVersions(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAll, getMySolutions, getById, create, update, submit, review, archive, getVersions };
