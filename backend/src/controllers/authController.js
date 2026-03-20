const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

const setupAdmin = async (req, res, next) => {
  try {
    const result = await authService.setupAdmin(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, changePassword, setupAdmin };
