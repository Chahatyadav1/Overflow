const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../utils/validation');

const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const { email, password, role } = req.body;
    const result = await authService.registerUser(email, password, role);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
