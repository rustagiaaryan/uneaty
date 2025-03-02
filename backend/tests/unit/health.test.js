const request = require('supertest');
const express = require('express');

// Create a simple Express app for testing
const app = express();
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

describe('Health Check Endpoint', () => {
  it('should return 200 OK with correct status message', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toEqual('UP');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Server is healthy');
  });
});