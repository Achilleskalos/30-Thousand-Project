const svc = require('../services/dictionaryService');

const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getAll(req.query.category) }); } catch (err) { next(err); }
};
const getByCategory = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getByCategory(req.params.category) }); } catch (err) { next(err); }
};
const create = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.create(req.body) }); } catch (err) { next(err); }
};
const update = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.update(req.params.id, req.body) }); } catch (err) { next(err); }
};
const remove = async (req, res, next) => {
  try { await svc.remove(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
};

module.exports = { getAll, getByCategory, create, update, remove };
