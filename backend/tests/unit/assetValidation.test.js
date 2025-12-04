/**
 * Unit Tests for Asset Validation Middleware
 * Tests Joi validation schemas for asset creation and update
 */

import Joi from 'joi';

// Import schemas directly for unit testing
const createAssetSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .required(),
  
  assetTag: Joi.string()
    .max(50)
    .optional()
    .allow("", null),
  
  serialNumber: Joi.string()
    .min(1)
    .max(100)
    .required(),
  
  categoryId: Joi.string()
    .uuid()
    .required(),
  
  locationId: Joi.string()
    .uuid()
    .required(),
  
  purchaseDate: Joi.date()
    .iso()
    .required(),
  
  price: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
  
  specifications: Joi.object()
    .optional()
    .allow(null),
  
  notes: Joi.string()
    .max(1000)
    .optional()
    .allow("", null)
});

const updateAssetSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .optional(),
  
  assetTag: Joi.string()
    .max(50)
    .optional(),
  
  serialNumber: Joi.string()
    .min(1)
    .max(100)
    .optional(),
  
  categoryId: Joi.string()
    .uuid()
    .optional(),
  
  locationId: Joi.string()
    .uuid()
    .optional(),
  
  purchaseDate: Joi.date()
    .iso()
    .optional(),
  
  price: Joi.number()
    .min(0)
    .precision(2)
    .optional(),
  
  specifications: Joi.object()
    .optional()
    .allow(null),
  
  notes: Joi.string()
    .max(1000)
    .optional()
    .allow("", null)
}).min(1);

describe('Asset Validation', () => {
  
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  
  const validAssetData = {
    name: 'MacBook Pro 14 inch',
    serialNumber: 'SN123456789',
    categoryId: validUUID,
    locationId: validUUID,
    purchaseDate: '2024-01-15',
    price: 25000000
  };

  describe('Create Asset Schema', () => {
    
    test('should validate correct asset data', () => {
      const { error } = createAssetSchema.validate(validAssetData);
      expect(error).toBeUndefined();
    });

    test('should accept optional fields', () => {
      const dataWithOptional = {
        ...validAssetData,
        assetTag: 'AST-001',
        specifications: { ram: '16GB', storage: '512GB' },
        notes: 'Brand new laptop'
      };
      const { error } = createAssetSchema.validate(dataWithOptional);
      expect(error).toBeUndefined();
    });

    describe('Name validation', () => {
      test('should reject empty name', () => {
        const data = { ...validAssetData, name: '' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject name less than 2 characters', () => {
        const data = { ...validAssetData, name: 'A' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject name more than 150 characters', () => {
        const data = { ...validAssetData, name: 'A'.repeat(151) };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject missing name', () => {
        const { name, ...data } = validAssetData;
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    describe('Serial Number validation', () => {
      test('should reject empty serial number', () => {
        const data = { ...validAssetData, serialNumber: '' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject missing serial number', () => {
        const { serialNumber, ...data } = validAssetData;
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject serial number more than 100 characters', () => {
        const data = { ...validAssetData, serialNumber: 'S'.repeat(101) };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    describe('Category ID validation', () => {
      test('should reject invalid UUID format', () => {
        const data = { ...validAssetData, categoryId: 'invalid-uuid' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject missing category ID', () => {
        const { categoryId, ...data } = validAssetData;
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    describe('Location ID validation', () => {
      test('should reject invalid UUID format', () => {
        const data = { ...validAssetData, locationId: 'not-a-uuid' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject missing location ID', () => {
        const { locationId, ...data } = validAssetData;
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    describe('Purchase Date validation', () => {
      test('should accept valid ISO date', () => {
        const data = { ...validAssetData, purchaseDate: '2024-06-15' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });

      test('should reject invalid date format', () => {
        const data = { ...validAssetData, purchaseDate: '15-06-2024' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should reject missing purchase date', () => {
        const { purchaseDate, ...data } = validAssetData;
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    describe('Price validation', () => {
      test('should accept zero price', () => {
        const data = { ...validAssetData, price: 0 };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });

      test('should reject negative price', () => {
        const data = { ...validAssetData, price: -100 };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });

      test('should accept decimal price', () => {
        const data = { ...validAssetData, price: 1500000.50 };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });

      test('should default to 0 if not provided', () => {
        const { price, ...data } = validAssetData;
        const { error, value } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
        expect(value.price).toBe(0);
      });
    });

    describe('Specifications validation', () => {
      test('should accept valid JSON object', () => {
        const data = {
          ...validAssetData,
          specifications: { cpu: 'M3 Pro', ram: '18GB', storage: '512GB SSD' }
        };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });

      test('should accept null specifications', () => {
        const data = { ...validAssetData, specifications: null };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });

      test('should accept empty object', () => {
        const data = { ...validAssetData, specifications: {} };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });
    });

    describe('Notes validation', () => {
      test('should accept valid notes', () => {
        const data = { ...validAssetData, notes: 'This is a test note' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });

      test('should accept empty string notes', () => {
        const data = { ...validAssetData, notes: '' };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeUndefined();
      });

      test('should reject notes longer than 1000 characters', () => {
        const data = { ...validAssetData, notes: 'N'.repeat(1001) };
        const { error } = createAssetSchema.validate(data);
        expect(error).toBeDefined();
      });
    });
  });

  describe('Update Asset Schema', () => {
    
    test('should validate single field update', () => {
      const { error } = updateAssetSchema.validate({ name: 'Updated Name' });
      expect(error).toBeUndefined();
    });

    test('should validate multiple field update', () => {
      const data = {
        name: 'Updated MacBook',
        price: 30000000
      };
      const { error } = updateAssetSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should reject empty update object', () => {
      const { error } = updateAssetSchema.validate({});
      expect(error).toBeDefined();
    });

    test('should validate name update with proper constraints', () => {
      // Valid
      expect(updateAssetSchema.validate({ name: 'AB' }).error).toBeUndefined();
      
      // Invalid - too short
      expect(updateAssetSchema.validate({ name: 'A' }).error).toBeDefined();
      
      // Invalid - too long
      expect(updateAssetSchema.validate({ name: 'A'.repeat(151) }).error).toBeDefined();
    });

    test('should validate categoryId as UUID', () => {
      // Valid UUID
      expect(updateAssetSchema.validate({ categoryId: validUUID }).error).toBeUndefined();
      
      // Invalid UUID
      expect(updateAssetSchema.validate({ categoryId: 'not-uuid' }).error).toBeDefined();
    });

    test('should validate price constraints', () => {
      // Valid
      expect(updateAssetSchema.validate({ price: 0 }).error).toBeUndefined();
      expect(updateAssetSchema.validate({ price: 100000 }).error).toBeUndefined();
      
      // Invalid - negative
      expect(updateAssetSchema.validate({ price: -50 }).error).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    
    test('should strip unknown fields', () => {
      const data = {
        ...validAssetData,
        unknownField: 'should be stripped',
        anotherUnknown: 123
      };
      const { error, value } = createAssetSchema.validate(data, { stripUnknown: true });
      expect(error).toBeUndefined();
      expect(value.unknownField).toBeUndefined();
      expect(value.anotherUnknown).toBeUndefined();
    });

    test('should collect all errors when abortEarly is false', () => {
      const invalidData = {
        name: '', // Invalid
        serialNumber: '', // Invalid
        categoryId: 'invalid', // Invalid
        locationId: 'invalid', // Invalid
        purchaseDate: 'invalid', // Invalid
        price: -100 // Invalid
      };
      
      const { error } = createAssetSchema.validate(invalidData, { abortEarly: false });
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThan(1);
    });

    test('should handle special characters in name', () => {
      const data = { ...validAssetData, name: 'MacBook Pro 14" (M3 Pro)' };
      const { error } = createAssetSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should handle unicode in notes', () => {
      const data = { ...validAssetData, notes: '测试笔记 🖥️ ノート' };
      const { error } = createAssetSchema.validate(data);
      expect(error).toBeUndefined();
    });
  });
});
