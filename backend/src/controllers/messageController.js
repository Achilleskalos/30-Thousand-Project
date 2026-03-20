const messageService = require('../services/messageService');

const getInbox = async (req, res) => {
  try {
    const data = await messageService.getInbox(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getThread = async (req, res) => {
  try {
    const data = await messageService.getThread(req.params.threadId, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const send = async (req, res) => {
  try {
    const msg = await messageService.send(req.user.id, req.body);
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await messageService.getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getInbox, getThread, send, getUnreadCount };
