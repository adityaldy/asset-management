import dotenv from 'dotenv';

// Load test environment variables
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  // Generate random email for testing
  randomEmail: () => `test_${Date.now()}@test.com`,
  
  // Generate random string
  randomString: (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Clean up after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});
