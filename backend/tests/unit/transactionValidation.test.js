/**
 * Unit Tests for Transaction Validation
 * Tests Joi validation schemas for all transaction types
 */

import Joi from 'joi';

// Condition status constants
const ConditionStatus = {
  GOOD: 'good',
  DAMAGED: 'damaged',
  LOST: 'lost'
};

// Recreate schemas for testing
const checkoutSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  transactionDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).optional().allow('', null)
});

const checkinSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  conditionStatus: Joi.string()
    .valid(ConditionStatus.GOOD, ConditionStatus.DAMAGED, ConditionStatus.LOST)
    .required(),
  transactionDate: Joi.date().iso().optional(),
  notes: Joi.string()
    .max(1000)
    .when('conditionStatus', {
      is: Joi.valid(ConditionStatus.DAMAGED, ConditionStatus.LOST),
      then: Joi.required(),
      otherwise: Joi.optional().allow('', null)
    })
});

const repairSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  transactionDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).required()
});

const disposeSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  transactionDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).required()
});

const reportLostSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  transactionDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).required()
});

const reportFoundSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  transactionDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).optional().allow('', null)
});

describe('Transaction Validation', () => {
  
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  const validUUID2 = '660e8400-e29b-41d4-a716-446655440001';

  describe('Checkout Schema', () => {
    
    test('should validate correct checkout data', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should accept optional notes', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2,
        notes: 'Checkout for project work'
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should accept optional transactionDate', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2,
        transactionDate: '2024-06-15T10:30:00.000Z'
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should reject missing assetId', () => {
      const data = { userId: validUUID2 };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should reject missing userId', () => {
      const data = { assetId: validUUID };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should reject invalid assetId UUID', () => {
      const data = {
        assetId: 'not-a-uuid',
        userId: validUUID2
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should reject invalid userId UUID', () => {
      const data = {
        assetId: validUUID,
        userId: 'invalid'
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should reject notes longer than 1000 characters', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2,
        notes: 'N'.repeat(1001)
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Checkin Schema', () => {
    
    test('should validate correct checkin with good condition', () => {
      const data = {
        assetId: validUUID,
        conditionStatus: ConditionStatus.GOOD
      };
      const { error } = checkinSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require notes when condition is damaged', () => {
      const dataWithoutNotes = {
        assetId: validUUID,
        conditionStatus: ConditionStatus.DAMAGED
      };
      const { error: error1 } = checkinSchema.validate(dataWithoutNotes);
      expect(error1).toBeDefined();

      const dataWithNotes = {
        assetId: validUUID,
        conditionStatus: ConditionStatus.DAMAGED,
        notes: 'Screen cracked'
      };
      const { error: error2 } = checkinSchema.validate(dataWithNotes);
      expect(error2).toBeUndefined();
    });

    test('should require notes when condition is lost', () => {
      const dataWithoutNotes = {
        assetId: validUUID,
        conditionStatus: ConditionStatus.LOST
      };
      const { error: error1 } = checkinSchema.validate(dataWithoutNotes);
      expect(error1).toBeDefined();

      const dataWithNotes = {
        assetId: validUUID,
        conditionStatus: ConditionStatus.LOST,
        notes: 'Lost during business trip'
      };
      const { error: error2 } = checkinSchema.validate(dataWithNotes);
      expect(error2).toBeUndefined();
    });

    test('should reject invalid condition status', () => {
      const data = {
        assetId: validUUID,
        conditionStatus: 'invalid_status'
      };
      const { error } = checkinSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should reject missing conditionStatus', () => {
      const data = { assetId: validUUID };
      const { error } = checkinSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should accept all valid condition statuses', () => {
      const conditions = [ConditionStatus.GOOD, ConditionStatus.DAMAGED, ConditionStatus.LOST];
      
      conditions.forEach(condition => {
        const data = {
          assetId: validUUID,
          conditionStatus: condition,
          notes: condition !== ConditionStatus.GOOD ? 'Required note' : undefined
        };
        const { error } = checkinSchema.validate(data);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Repair Schema', () => {
    
    test('should validate correct repair data', () => {
      const data = {
        assetId: validUUID,
        notes: 'Battery replacement needed'
      };
      const { error } = repairSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require notes', () => {
      const data = { assetId: validUUID };
      const { error } = repairSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should reject empty notes', () => {
      const data = {
        assetId: validUUID,
        notes: ''
      };
      const { error } = repairSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Dispose Schema', () => {
    
    test('should validate correct dispose data', () => {
      const data = {
        assetId: validUUID,
        notes: 'Beyond economical repair'
      };
      const { error } = disposeSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require notes', () => {
      const data = { assetId: validUUID };
      const { error } = disposeSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Report Lost Schema', () => {
    
    test('should validate correct report lost data', () => {
      const data = {
        assetId: validUUID,
        notes: 'Last seen in conference room A'
      };
      const { error } = reportLostSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require notes', () => {
      const data = { assetId: validUUID };
      const { error } = reportLostSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Report Found Schema', () => {
    
    test('should validate correct report found data', () => {
      const data = {
        assetId: validUUID,
        notes: 'Found in storage room'
      };
      const { error } = reportFoundSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should not require notes', () => {
      const data = { assetId: validUUID };
      const { error } = reportFoundSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should accept empty notes', () => {
      const data = {
        assetId: validUUID,
        notes: ''
      };
      const { error } = reportFoundSchema.validate(data);
      expect(error).toBeUndefined();
    });
  });

  describe('Common Validation Rules', () => {
    
    test('should strip unknown fields', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2,
        unknownField: 'should be removed'
      };
      const { error, value } = checkoutSchema.validate(data, { stripUnknown: true });
      expect(error).toBeUndefined();
      expect(value.unknownField).toBeUndefined();
    });

    test('should validate ISO date format', () => {
      const validDate = {
        assetId: validUUID,
        userId: validUUID2,
        transactionDate: '2024-12-04T10:30:00.000Z'
      };
      expect(checkoutSchema.validate(validDate).error).toBeUndefined();

      const invalidDate = {
        assetId: validUUID,
        userId: validUUID2,
        transactionDate: '04-12-2024'
      };
      expect(checkoutSchema.validate(invalidDate).error).toBeDefined();
    });

    test('should collect all errors when abortEarly is false', () => {
      const invalidData = {
        assetId: 'invalid',
        userId: 'also-invalid'
      };
      const { error } = checkoutSchema.validate(invalidData, { abortEarly: false });
      expect(error).toBeDefined();
      expect(error.details.length).toBe(2);
    });
  });

  describe('Transaction Date Handling', () => {
    
    test('should accept Date object', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2,
        transactionDate: new Date()
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should accept ISO string', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2,
        transactionDate: new Date().toISOString()
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should accept date-only string', () => {
      const data = {
        assetId: validUUID,
        userId: validUUID2,
        transactionDate: '2024-06-15'
      };
      const { error } = checkoutSchema.validate(data);
      expect(error).toBeUndefined();
    });
  });
});
