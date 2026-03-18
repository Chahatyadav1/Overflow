const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      const error = new Error('Admin access required');
      error.statusCode = 403;
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = adminMiddleware;
