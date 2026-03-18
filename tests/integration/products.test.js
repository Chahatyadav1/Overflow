const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');

let adminToken;
let userToken;

beforeEach(async () => {
  // Create admin user
  const adminRes = await request(app)
    .post('/auth/register')
    .send({ email: 'admin@test.com', password: 'admin123', role: 'admin' });
  adminToken = adminRes.body.token;

  // Create regular user
  const userRes = await request(app)
    .post('/auth/register')
    .send({ email: 'user@test.com', password: 'user123' });
  userToken = userRes.body.token;
});

describe('Products Endpoints', () => {
  describe('GET /products', () => {
    it('should list products publicly', async () => {
      await Product.create({ name: 'Test Product', price: 10, stock: 5 });
      const res = await request(app).get('/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.docs).toHaveLength(1);
    });
  });

  describe('POST /products', () => {
    it('should allow admin to create product', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Product', price: 20, stock: 100 });
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('New Product');
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Product', price: 20, stock: 100 });
      expect(res.statusCode).toBe(403);
    });

    it('should validate input', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New' }); // missing price
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({ name: 'Old Name', price: 10, stock: 5 });
      productId = product._id.toString();
    });

    it('should allow admin to update', async () => {
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated' });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({ name: 'ToDelete', price: 10, stock: 5 });
      productId = product._id.toString();
    });

    it('should allow admin to soft delete', async () => {
      const res = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(204);
      const deleted = await Product.findById(productId);
      expect(deleted).toBeNull(); // soft-deleted
    });
  });
});
