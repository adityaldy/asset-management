/**
 * Integration Tests for Authentication API
 * Tests login, logout, refresh token, and protected routes
 */

import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

// Create a mock app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  
  // Mock user database
  const mockUsers = [
    {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@company.com',
      password: '$2b$10$test', // bcrypt hash placeholder
      name: 'Admin User',
      role: 'admin'
    }
  ];

  // Mock login endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Simple validation for test
    if (email === 'admin@company.com' && password === 'admin123') {
      const accessToken = jwt.sign(
        { userId: 1, uuid: mockUsers[0].uuid, role: 'admin' },
        'test-secret',
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { userId: 1, uuid: mockUsers[0].uuid },
        'test-refresh-secret',
        { expiresIn: '7d' }
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            uuid: mockUsers[0].uuid,
            name: mockUsers[0].name,
            email: mockUsers[0].email,
            role: mockUsers[0].role
          },
          accessToken
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  });

  // Mock logout endpoint
  app.delete('/api/auth/logout', (req, res) => {
    res.clearCookie('refreshToken');
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  // Mock refresh token endpoint
  app.get('/api/auth/token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, 'test-refresh-secret');
      const accessToken = jwt.sign(
        { userId: decoded.userId, uuid: decoded.uuid, role: 'admin' },
        'test-secret',
        { expiresIn: '15m' }
      );

      return res.json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  });

  // Mock me endpoint
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, 'test-secret');
      return res.json({
        success: true,
        data: {
          uuid: decoded.uuid,
          name: 'Admin User',
          email: 'admin@company.com',
          role: decoded.role
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  return app;
};

describe('Authentication API', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/login', () => {
    
    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@company.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('admin@company.com');
      expect(response.body.data.user.role).toBe('admin');
      
      // Should set refresh token cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@company.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'admin123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@company.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@company.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/auth/logout', () => {
    
    test('should logout successfully', async () => {
      const response = await request(app)
        .delete('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/token', () => {
    
    test('should refresh access token with valid refresh token', async () => {
      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@company.com',
          password: 'admin123'
        });

      const cookies = loginResponse.headers['set-cookie'];
      
      // Use refresh token to get new access token
      const response = await request(app)
        .get('/api/auth/token')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    test('should fail without refresh token', async () => {
      const response = await request(app)
        .get('/api/auth/token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .get('/api/auth/token')
        .set('Cookie', ['refreshToken=invalid-token']);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    
    test('should return user info with valid token', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@company.com',
          password: 'admin123'
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@company.com');
      expect(response.body.data.role).toBe('admin');
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

describe('JWT Token Validation', () => {
  
  test('should generate valid JWT token', () => {
    const payload = { userId: 1, uuid: 'test-uuid', role: 'admin' };
    const token = jwt.sign(payload, 'test-secret', { expiresIn: '15m' });
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT has 3 parts
  });

  test('should verify valid token', () => {
    const payload = { userId: 1, uuid: 'test-uuid', role: 'admin' };
    const token = jwt.sign(payload, 'test-secret', { expiresIn: '15m' });
    
    const decoded = jwt.verify(token, 'test-secret');
    
    expect(decoded.userId).toBe(1);
    expect(decoded.uuid).toBe('test-uuid');
    expect(decoded.role).toBe('admin');
  });

  test('should reject expired token', () => {
    const payload = { userId: 1 };
    const token = jwt.sign(payload, 'test-secret', { expiresIn: '-1s' }); // Already expired
    
    expect(() => {
      jwt.verify(token, 'test-secret');
    }).toThrow();
  });

  test('should reject token with wrong secret', () => {
    const payload = { userId: 1 };
    const token = jwt.sign(payload, 'correct-secret');
    
    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });
});
