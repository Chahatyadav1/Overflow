const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');
const Order = require('../../src/models/Order');

let token;
let userId;
let product1;
let product2;

beforeEach(async () => {
  // Register user
  const userRes = await request(app)
    .post('/auth/register')
    .send({ email: 'orderuser@test.com', password: 'password123' });
  token = userRes.body.token;
  userId = userRes.body.user.id;

  // Create products
  product1 = await Product.create({ name: 'Product 1', price: 100, stock: 10 });
  product2 = await Product.create({ name: 'Product 2', price: 50, stock: 20 });
});

describe('Orders Endpoints', () => {
  describe('POST /orders', () => {
    it('should create an order', async () => {
      const orderData = {
        items: [
          { product: product1._id.toString(), quantity: 2 },
          { product: product2._id.toString(), quantity: 1 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
          country: 'USA',
        },
        paymentMethod: 'card',
      };
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);
      expect(res.statusCode).toBe(201);
      expect(res.body.totalAmount).toBe(250); // 2*100 + 1*50
      expect(res.body.items).toHaveLength(2);

      // Check stock decreased
      const updatedProduct1 = await Product.findById(product1._id);
      const updatedProduct2 = await Product.findById(product2._id);
      expect(updatedProduct1.stock).toBe(8);
      expect(updatedProduct2.stock).toBe(19);
    });

    it('should validate input', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [] }); // empty items
      expect(res.statusCode).toBe(400);
    });

    it('should reject if product out of stock', async () => {
      await Product.findByIdAndUpdate(product1._id, { stock: 1 });
      const orderData = {
        items: [{ product: product1._id.toString(), quantity: 2 }],
        shippingAddress: { street: '123', city: 'City', state: 'ST', zip: '12345', country: 'USA' },
        paymentMethod: 'card',
      };
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Insufficient stock');
    });
  });

  describe('GET /orders', () => {
    beforeEach(async () => {
      await Order.create([
        { user: userId, items: [{ product: product1._id, quantity: 1, price: 100 }], totalAmount: 100, status: 'pending', shippingAddress: {}, paymentMethod: 'card' },
        { user: userId, items: [{ product: product2._id, quantity: 2, price: 50 }], totalAmount: 100, status: 'completed', shippingAddress: {}, paymentMethod: 'paypal' },
      ]);
    });

    it('should list user orders', async () => {
      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.docs).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/orders?status=completed')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.docs).toHaveLength(1);
      expect(res.body.docs[0].status).toBe('completed');
    });
  });

  describe('GET /orders/:id', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        user: userId,
        items: [{ product: product1._id, quantity: 1, price: 100 }],
        totalAmount: 100,
        status: 'pending',
        shippingAddress: {},
        paymentMethod: 'card',
      });
      orderId = order._id.toString();
    });

    it('should return order', async () => {
      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(orderId);
    });

    it('should return 404 for wrong id', async () => {
      const fakeId = new User()._id.toString();
      const res = await request(app)
        .get(`/orders/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        user: userId,
        items: [{ product: product1._id, quantity: 1, price: 100 }],
        totalAmount: 100,
        status: 'pending',
        shippingAddress: {},
        paymentMethod: 'card',
      });
      orderId = order._id.toString();
    });

    it('should update status', async () => {
      const res = await request(app)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'processing' });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('processing');
    });

    it('should validate status', async () => {
      const res = await request(app)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /orders/:id/cancel', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        user: userId,
        items: [
          { product: product1._id, quantity: 2, price: 100 },
          { product: product2._id, quantity: 1, price: 50 },
        ],
        totalAmount: 250,
        status: 'pending',
        shippingAddress: {},
        paymentMethod: 'card',
      });
      orderId = order._id.toString();
    });

    it('should cancel pending order and restore stock', async () => {
      const res = await request(app)
        .post(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('cancelled');

      const updatedProduct1 = await Product.findById(product1._id);
      const updatedProduct2 = await Product.findById(product2._id);
      expect(updatedProduct1.stock).toBe(12); // 10+2
      expect(updatedProduct2.stock).toBe(21); // 20+1
    });

    it('should not cancel non-pending order', async () => {
      await Order.findByIdAndUpdate(orderId, { status: 'processing' });
      const res = await request(app)
        .post(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
    });
  });
});
