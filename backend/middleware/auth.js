const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    const error = new Error('Access denied. No authentication token provided.');
    error.status = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    const error = new Error('Access denied. Invalid token format. Use Bearer <token>');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cropmax_super_secret_key_18012005');
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error('Access denied. Invalid or expired token.');
    error.status = 401;
    return next(error);
  }
}

module.exports = {
  requireAuth
};
