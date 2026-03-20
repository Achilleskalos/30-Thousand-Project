const svc = require('../services/attachmentService');

const getByEntity = async (req, res, next) => {
  try {
    const data = await svc.getByEntity(req.params.entityType, req.params.entityId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const upload = async (req, res, next) => {
  try {
    if (!req.file) { const e = new Error('未上传文件'); e.status = 400; throw e; }
    const data = await svc.create({
      entityType: req.params.entityType,
      entityId: req.params.entityId,
      file: req.file,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await svc.remove(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { getByEntity, upload, remove };
