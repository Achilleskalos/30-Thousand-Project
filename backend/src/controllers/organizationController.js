const svc = require('../services/organizationService');

const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getAllOrganizations(req.query) }); } catch (err) { next(err); }
};
const getById = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getOrganizationById(req.params.id) }); } catch (err) { next(err); }
};
const create = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.createOrganization(req.body) }); } catch (err) { next(err); }
};
const update = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateOrganization(req.params.id, req.body) }); } catch (err) { next(err); }
};
const createDept = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.createDepartment(req.params.id, req.body) }); } catch (err) { next(err); }
};
const updateDept = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateDepartment(req.params.deptId, req.body) }); } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, createDept, updateDept };
