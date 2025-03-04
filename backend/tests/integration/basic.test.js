const request = require('supertest');
const express = require('express');

// Create a simple Express app for testing
const app = express();
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Integration test endpoint' });
});

describe('Basic Integration Test', () => {
  it('should return 200 OK for test endpoint', async () => {
    const res = await request(app).get('/api/test');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Integration test endpoint');
  });
});