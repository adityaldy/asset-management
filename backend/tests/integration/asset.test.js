/**
 * Integration Tests for Asset API
 * Tests CRUD operations and validation
 */

import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Create a mock app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock data
  const mockAssets = [
    {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      name: 'MacBook Pro 14',
      assetTag: 'AST-001',
      serialNumber: 'SN001',
      status: 'available',
      categoryId: 1,
      locationId: 1,
      purchaseDate: '2024-01-15',
      price: 25000000
    },
    {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Dell Monitor 27',
      assetTag: 'AST-002',
      serialNumber: 'SN002',
      status: 'assigned',
      categoryId: 2,
      locationId: 1,
      currentHolderId: 2,
      purchaseDate: '2024-02-20',
      price: 5000000
    }
  ];

  let nextId = 3;

  // Auth middleware mock
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, 'test-secret');
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };

  // Get all assets
  app.get('/api/assets', authMiddleware, (req, res) => {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    let filtered = [...mockAssets];
    
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.assetTag.toLowerCase().includes(searchLower) ||
        a.serialNumber.toLowerCase().includes(searchLower)
      );
    }

    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginatedData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    });
  });

  // Get asset by ID
  app.get('/api/assets/:id', authMiddleware, (req, res) => {
    const asset = mockAssets.find(a => a.uuid === req.params.id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  });

  // Create asset
  app.post('/api/assets', authMiddleware, (req, res) => {
    const { name, serialNumber, categoryId, locationId, purchaseDate, price } = req.body;
    
    // Validation
    if (!name || !serialNumber || !categoryId || !locationId || !purchaseDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check duplicate serial number
    if (mockAssets.find(a => a.serialNumber === serialNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Serial number already exists'
      });
    }

    const newAsset = {
      id: nextId++,
      uuid: `test-uuid-${nextId}`,
      name,
      assetTag: `AST-${String(nextId).padStart(3, '0')}`,
      serialNumber,
      status: 'available',
      categoryId,
      locationId,
      purchaseDate,
      price: price || 0
    };

    mockAssets.push(newAsset);

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: newAsset
    });
  });

  // Update asset
  app.put('/api/assets/:id', authMiddleware, (req, res) => {
    const assetIndex = mockAssets.findIndex(a => a.uuid === req.params.id);
    
    if (assetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const updateData = req.body;
    
    // Check duplicate serial number
    if (updateData.serialNumber) {
      const duplicate = mockAssets.find(
        a => a.serialNumber === updateData.serialNumber && a.uuid !== req.params.id
      );
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Serial number already exists'
        });
      }
    }

    mockAssets[assetIndex] = {
      ...mockAssets[assetIndex],
      ...updateData
    };

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: mockAssets[assetIndex]
    });
  });

  // Delete asset
  app.delete('/api/assets/:id', authMiddleware, (req, res) => {
    const assetIndex = mockAssets.findIndex(a => a.uuid === req.params.id);
    
    if (assetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if asset is assigned
    if (mockAssets[assetIndex].status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assigned asset'
      });
    }

    mockAssets.splice(assetIndex, 1);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  });

  // Search assets
  app.get('/api/assets/search', authMiddleware, (req, res) => {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchLower = q.toLowerCase();
    const results = mockAssets.filter(a =>
      a.name.toLowerCase().includes(searchLower) ||
      a.assetTag.toLowerCase().includes(searchLower) ||
      a.serialNumber.toLowerCase().includes(searchLower)
    );

    res.json({
      success: true,
      data: results
    });
  });

  return app;
};

describe('Asset API', () => {
  let app;
  let authToken;

  beforeAll(() => {
    app = createTestApp();
    // Generate valid auth token
    authToken = jwt.sign(
      { userId: 1, uuid: 'test-admin-uuid', role: 'admin' },
      'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/assets', () => {
    
    test('should return all assets with pagination', async () => {
      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
    });

    test('should filter assets by status', async () => {
      const response = await request(app)
        .get('/api/assets?status=available')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(asset => {
        expect(asset.status).toBe('available');
      });
    });

    test('should search assets', async () => {
      const response = await request(app)
        .get('/api/assets?search=MacBook')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('MacBook');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/assets');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/assets/:id', () => {
    
    test('should return asset by UUID', async () => {
      const response = await request(app)
        .get('/api/assets/550e8400-e29b-41d4-a716-446655440001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('MacBook Pro 14');
    });

    test('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .get('/api/assets/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/assets', () => {
    
    test('should create asset with valid data', async () => {
      const newAsset = {
        name: 'New Test Asset',
        serialNumber: 'SN-NEW-001',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        locationId: '550e8400-e29b-41d4-a716-446655440000',
        purchaseDate: '2024-06-15',
        price: 10000000
      };

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newAsset);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Test Asset');
      expect(response.body.data.status).toBe('available');
    });

    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Incomplete Asset' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail with duplicate serial number', async () => {
      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Duplicate Serial',
          serialNumber: 'SN001', // Existing serial number
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          locationId: '550e8400-e29b-41d4-a716-446655440000',
          purchaseDate: '2024-06-15'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Serial number');
    });
  });

  describe('PUT /api/assets/:id', () => {
    
    test('should update asset', async () => {
      const response = await request(app)
        .put('/api/assets/550e8400-e29b-41d4-a716-446655440001')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated MacBook Pro' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated MacBook Pro');
    });

    test('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .put('/api/assets/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });

    test('should fail with duplicate serial number on update', async () => {
      const response = await request(app)
        .put('/api/assets/550e8400-e29b-41d4-a716-446655440001')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ serialNumber: 'SN002' }); // Belongs to another asset

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/assets/:id', () => {
    
    test('should delete available asset', async () => {
      const response = await request(app)
        .delete('/api/assets/550e8400-e29b-41d4-a716-446655440001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail to delete assigned asset', async () => {
      const response = await request(app)
        .delete('/api/assets/550e8400-e29b-41d4-a716-446655440002')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('assigned');
    });

    test('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .delete('/api/assets/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Authentication Tests', () => {
    
    test('should fail all endpoints without token', async () => {
      const endpoints = [
        { method: 'get', path: '/api/assets' },
        { method: 'get', path: '/api/assets/550e8400-e29b-41d4-a716-446655440001' },
        { method: 'post', path: '/api/assets' },
        { method: 'put', path: '/api/assets/550e8400-e29b-41d4-a716-446655440001' },
        { method: 'delete', path: '/api/assets/550e8400-e29b-41d4-a716-446655440001' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
      }
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
