const notificationService = require('../services/notificationService');

const getMyNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const data = await notificationService.getByUser(req.user.id, { limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const markRead = async (req, res) => {
  try {
    await notificationService.markRead(req.params.id, req.user.id);
    res.json({ success: true, data: null });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ success: true, data: null });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getMyNotifications, getUnreadCount, markRead, markAllRead };
