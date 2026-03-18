const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpire });
};

const registerUser = async (email, password, role = 'customer') => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 400;
    throw error;
  }
  const user = await User.create({ email, password, role });
  const token = generateToken(user._id);
  return { user: { id: user._id, email: user.email, role: user.role }, token };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  const token = generateToken(user._id);
  return { user: { id: user._id, email: user.email, role: user.role }, token };
};

module.exports = { registerUser, loginUser };
