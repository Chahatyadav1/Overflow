const Order = require('../models/Order');
const Product = require('../models/Product');

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const createOrder = async (orderData, userId) => {
  // Validate products and fetch current prices
  const itemsWithPrices = [];
  for (const item of orderData.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      const error = new Error(`Product not found: ${item.product}`);
      error.statusCode = 400;
      throw error;
    }
    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for product: ${product.name}`);
      error.statusCode = 400;
      throw error;
    }
    itemsWithPrices.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const totalAmount = calculateTotal(itemsWithPrices);
  const order = await Order.create({
    user: userId,
    items: itemsWithPrices,
    totalAmount,
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod,
  });

  // Decrease stock
  for (const item of itemsWithPrices) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  return order;
};

const getOrders = async (userId, filters = {}, options = {}) => {
  const query = { user: userId, ...filters };
  const orders = await Order.paginate(query, {
    ...options,
    populate: 'items.product',
    sort: options.sort || { createdAt: -1 },
  });
  return orders;
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  return order;
};

const updateOrderStatus = async (orderId, userId, status) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, user: userId },
    { status, updatedAt: Date.now() },
    { new: true, runValidators: true }
  ).populate('items.product');
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  return order;
};

const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  if (order.status !== 'pending') {
    const error = new Error('Only pending orders can be cancelled');
    error.statusCode = 400;
    throw error;
  }
  order.status = 'cancelled';
  order.updatedAt = Date.now();
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  return order;
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder };
