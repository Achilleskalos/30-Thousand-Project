const { verify } = require('../config/jwt');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'No token provided' } });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = verify(token);
    next();
  } catch {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};

module.exports = authenticate;
