import request from 'supertest';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock auth middleware before importing the app so routes use the mocked protect/authorize
jest.unstable_mockModule?.('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => next(),
  authorize: () => (req, res, next) => next()
}));

// For older Jest versions without unstable_mockModule, also mock via require cache
try {
  jest.mock('../middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => next(),
    authorize: () => (req, res, next) => next()
  }));
} catch (e) {
  // ignore if already mocked
}

// Mock error middleware so thrown errors preserve the status set on the response
try {
  jest.mock('../utils/errorHandler.js', () => ({
    errorMiddleware: (err, req, res, next) => {
      const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);
      res.status(status).json({ success: false, message: err.message });
    },
    asyncHandler: (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
  }));
} catch (e) {
  // ignore
}

import app from '../server.js';
import Logistics from '../models/logistics.js';
import whatsappService from '../services/whatsappService.js';


describe('Logistics API', () => {
  const adminToken = jwt.sign({ id: 'user1', role: 'admin' }, 'test-secret');
  const authHeader = `Bearer ${adminToken}`;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    // reset mocks and provide chainable query mocks for Mongoose-like API
    Logistics.create = jest.fn();
    Logistics.countDocuments = jest.fn().mockResolvedValue(0);

    const findChain = {
      populate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    };

    Logistics.find = jest.fn().mockReturnValue(findChain);

    const findOneChain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(null),
    };

    Logistics.findOne = jest.fn().mockReturnValue(findOneChain);
    Logistics.findById = jest.fn();

    whatsappService.sendMessage = jest.fn();
    whatsappService.sendTemplateMessage = jest.fn();
  });

  it('creates a logistics record (POST /api/logistics)', async () => {
    const payload = {
      orderId: 'order1',
      deliveryPartner: 'FastEx',
      pickupLocation: 'Store',
      deliveryLocation: 'Addr',
      customerPhone: '+100'
    };

    Logistics.create.mockResolvedValue({ _id: 'log1', ...payload, status: 'Scheduled' });
    whatsappService.sendMessage.mockResolvedValue({ sid: 'S1', to: '+100', status: 'sent' });

    const res = await request(app)
      .post('/api/logistics')
      .set('Authorization', authHeader)
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe('log1');
    expect(Logistics.create).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order1' }));
  });

  it('gets logistics list (GET /api/logistics)', async () => {
    Logistics.countDocuments.mockResolvedValue(2);
    // override find chain to resolve with two records
    const findChain = {
      populate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ _id: 'l1' }, { _id: 'l2' }])
    };
    Logistics.find.mockReturnValue(findChain);

    const res = await request(app)
      .get('/api/logistics')
      .set('Authorization', authHeader)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(Logistics.countDocuments).toHaveBeenCalled();
  });

  it('returns error for invalid order id (GET /api/logistics/order/:orderId)', async () => {
    const res = await request(app)
      .get('/api/logistics/order/invalid-id')
      .set('Authorization', authHeader)
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid Order ID/i);
  });

  it('updates logistics status (PUT /api/logistics/:id)', async () => {
    const mockDoc = { _id: 'l1', status: 'Scheduled', save: jest.fn() };
    const updatedDoc = { _id: 'l1', status: 'Picked Up' };
    mockDoc.save.mockResolvedValue(updatedDoc);
    Logistics.findById.mockResolvedValue(mockDoc);
    whatsappService.sendMessage.mockResolvedValue({ sid: 'S2', to: '+100', status: 'sent' });

    const res = await request(app)
      .put('/api/logistics/l1')
      .set('Authorization', authHeader)
      .send({ status: 'Picked Up', notify: true })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Picked Up');
    expect(Logistics.findById).toHaveBeenCalledWith('l1');
  });

  it('deletes logistics record (DELETE /api/logistics/:id)', async () => {
    const mockDoc = { _id: 'l2', status: 'Scheduled', deleteOne: jest.fn().mockResolvedValue({}) };
    Logistics.findById.mockResolvedValue(mockDoc);
    whatsappService.sendMessage.mockResolvedValue({ sid: 'S3', to: '+100', status: 'sent' });

    const res = await request(app)
      .delete('/api/logistics/l2')
      .set('Authorization', authHeader)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.deletedId).toBe('l2');
    expect(mockDoc.deleteOne).toHaveBeenCalled();
  });
});
