const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import your models
const User = require('../../src/models/User');
const DeliveryService = require('../../src/models/DeliveryService');
const Order = require('../../src/models/Order');

// Import your Express app
const app = require('../../src/server'); // Adjust path as needed

let mongoServer;
let delivererToken;
let customerToken;
let deliveryServiceId;

// Setup test database and users
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  
  await mongoose.connect(uri, mongooseOpts);
  
  // Create test users
  const deliverer = await User.create({
    name: 'Test Deliverer',
    email: 'deliverer@test.com',
    password: 'password123',
    phone: '1234567890',
    role: 'deliverer'
  });
  
  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    phone: '0987654321',
    role: 'customer'
  });
  
  // Generate tokens
  delivererToken = jwt.sign(
    { id: deliverer._id, role: deliverer.role },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
  
  customerToken = jwt.sign(
    { id: customer._id, role: customer.role },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Delivery Service and Order Flow', () => {
  test('Deliverer can create a delivery service', async () => {
    const response = await request(app)
      .post('/api/delivery-services')
      .set('Authorization', `Bearer ${delivererToken}`)
      .send({
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
        maxOrders: 5,
        deliveryFee: 3.99,
        foodTrucks: [
          {
            name: 'Test Food Truck',
            location: 'Test Location'
          }
        ]
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    
    deliveryServiceId = response.body.data._id;
  });
  
  test('Customer can place an order from a delivery service', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        deliveryService: deliveryServiceId,
        items: [
          {
            foodTruck: 'Test Food Truck',
            itemName: 'Test Item',
            quantity: 2,
            price: 9.99
          }
        ],
        deliveryLocation: {
          dorm: 'Test Dorm',
          floor: '3',
          roomNumber: '301'
        },
        customerPhone: '5551234567',
        deliveryFee: 3.99,
        totalAmount: 23.97 // (9.99 * 2) + 3.99
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
  });
  
  test('Deliverer can view and update order status', async () => {
    // First get all orders for the deliverer
    const getResponse = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${delivererToken}`);
    
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.data.length).toBeGreaterThan(0);
    
    const orderId = getResponse.body.data[0]._id;
    
    // Update order status
    const updateResponse = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${delivererToken}`)
      .send({
        status: 'accepted'
      });
    
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.data.status).toBe('accepted');
  });
});