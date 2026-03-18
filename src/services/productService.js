const Product = require('../models/Product');

const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

const getProducts = async (filters = {}, options = {}) => {
  const query = { ...filters };
  // Remove soft-deleted products automatically
  const products = await Product.paginate(query, {
    ...options,
    sort: options.sort || { createdAt: -1 },
  });
  return products;
};

const getProductById = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

const updateProduct = async (productId, updates) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    updates,
    { new: true, runValidators: true }
  );
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

const deleteProduct = async (productId) => {
  const product = await Product.deleteById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
