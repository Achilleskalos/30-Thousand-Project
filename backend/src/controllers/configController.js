const svc = require('../services/configService');

const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getAll() }); } catch (err) { next(err); }
};
const update = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.update(req.params.key, req.body, req.user.id) }); } catch (err) { next(err); }
};

module.exports = { getAll, update };
