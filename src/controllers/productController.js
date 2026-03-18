const productService = require('../services/productService');
const { productSchema, productUpdateSchema, productQuerySchema } = require('../utils/validation');

const createProduct = async (req, res, next) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { error, value } = productQuerySchema.validate(req.query);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const { page = 1, limit = 10, ...filters } = value;
    const options = { page, limit };
    const result = await productService.getProducts(filters, options);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { error } = productUpdateSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct };
