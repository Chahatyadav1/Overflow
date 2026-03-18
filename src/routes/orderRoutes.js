const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // All order routes require authentication

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
