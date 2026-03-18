const orderService = require('../services/orderService');
const { orderSchema, orderStatusSchema, orderQuerySchema } = require('../utils/validation');

const createOrder = async (req, res, next) => {
  try {
    const { error } = orderSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const userId = req.user.id;
    const order = await orderService.createOrder(req.body, userId);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { error, value } = orderQuerySchema.validate(req.query);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const userId = req.user.id;
    const { page = 1, limit = 10, ...filters } = value;
    const options = { page, limit };
    const orders = await orderService.getOrders(userId, filters, options);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const order = await orderService.getOrderById(id, userId);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { error } = orderStatusSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(id, userId, status);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const order = await orderService.cancelOrder(id, userId);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, cancelOrder };
