/**
 * Unit Tests for Response Helper
 * Tests all response formatting utilities
 */

import {
    successResponse,
    errorResponse,
    paginationMeta,
    paginatedResponse,
    ErrorCodes
} from '../../utils/responseHelper.js';

// Mock Express response object
const createMockResponse = () => {
    const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.jsonData = data;
            return this;
        }
    };
    return res;
};

describe('Response Helper', () => {
    
    describe('successResponse', () => {
        test('should return success response with default values', () => {
            const res = createMockResponse();
            const data = { id: 1, name: 'Test' };
            
            successResponse(res, data);
            
            expect(res.statusCode).toBe(200);
            expect(res.jsonData.success).toBe(true);
            expect(res.jsonData.message).toBe('Success');
            expect(res.jsonData.data).toEqual(data);
        });

        test('should return success response with custom message', () => {
            const res = createMockResponse();
            const data = { id: 1 };
            
            successResponse(res, data, 'Asset created successfully');
            
            expect(res.jsonData.message).toBe('Asset created successfully');
        });

        test('should return success response with custom status code', () => {
            const res = createMockResponse();
            const data = { id: 1 };
            
            successResponse(res, data, 'Created', 201);
            
            expect(res.statusCode).toBe(201);
        });

        test('should include meta when provided', () => {
            const res = createMockResponse();
            const data = [{ id: 1 }];
            const meta = { page: 1, total: 10 };
            
            successResponse(res, data, 'Success', 200, meta);
            
            expect(res.jsonData.meta).toEqual(meta);
        });

        test('should not include data when null', () => {
            const res = createMockResponse();
            
            successResponse(res, null, 'Deleted successfully');
            
            expect(res.jsonData).not.toHaveProperty('data');
        });

        test('should not include meta when null', () => {
            const res = createMockResponse();
            
            successResponse(res, { id: 1 }, 'Success', 200, null);
            
            expect(res.jsonData).not.toHaveProperty('meta');
        });
    });

    describe('errorResponse', () => {
        test('should return error response with default values', () => {
            const res = createMockResponse();
            
            errorResponse(res, 'Something went wrong');
            
            expect(res.statusCode).toBe(400);
            expect(res.jsonData.success).toBe(false);
            expect(res.jsonData.message).toBe('Something went wrong');
        });

        test('should return error response with custom status code', () => {
            const res = createMockResponse();
            
            errorResponse(res, 'Not found', 404);
            
            expect(res.statusCode).toBe(404);
        });

        test('should include error code when provided', () => {
            const res = createMockResponse();
            
            errorResponse(res, 'Invalid credentials', 401, ErrorCodes.INVALID_CREDENTIALS);
            
            expect(res.jsonData.error_code).toBe('AUTH_ERR_001');
        });

        test('should include validation errors when provided', () => {
            const res = createMockResponse();
            const errors = [
                { field: 'email', message: 'Email is required' },
                { field: 'password', message: 'Password is too short' }
            ];
            
            errorResponse(res, 'Validation failed', 400, ErrorCodes.VALIDATION_ERROR, errors);
            
            expect(res.jsonData.errors).toEqual(errors);
        });

        test('should not include errors when empty array', () => {
            const res = createMockResponse();
            
            errorResponse(res, 'Error', 400, null, []);
            
            expect(res.jsonData).not.toHaveProperty('errors');
        });

        test('should not include error_code when null', () => {
            const res = createMockResponse();
            
            errorResponse(res, 'Error', 400, null);
            
            expect(res.jsonData).not.toHaveProperty('error_code');
        });
    });

    describe('paginationMeta', () => {
        test('should calculate pagination correctly', () => {
            const meta = paginationMeta(1, 10, 95);
            
            expect(meta.page).toBe(1);
            expect(meta.limit).toBe(10);
            expect(meta.total_records).toBe(95);
            expect(meta.total_pages).toBe(10);
            expect(meta.has_next).toBe(true);
            expect(meta.has_prev).toBe(false);
        });

        test('should handle first page correctly', () => {
            const meta = paginationMeta(1, 10, 50);
            
            expect(meta.has_prev).toBe(false);
            expect(meta.has_next).toBe(true);
        });

        test('should handle last page correctly', () => {
            const meta = paginationMeta(5, 10, 50);
            
            expect(meta.has_next).toBe(false);
            expect(meta.has_prev).toBe(true);
        });

        test('should handle middle page correctly', () => {
            const meta = paginationMeta(3, 10, 50);
            
            expect(meta.has_next).toBe(true);
            expect(meta.has_prev).toBe(true);
        });

        test('should handle single page correctly', () => {
            const meta = paginationMeta(1, 10, 5);
            
            expect(meta.total_pages).toBe(1);
            expect(meta.has_next).toBe(false);
            expect(meta.has_prev).toBe(false);
        });

        test('should handle zero records', () => {
            const meta = paginationMeta(1, 10, 0);
            
            expect(meta.total_pages).toBe(0);
            expect(meta.has_next).toBe(false);
            expect(meta.has_prev).toBe(false);
        });

        test('should handle string inputs (common from query params)', () => {
            const meta = paginationMeta('2', '20', 100);
            
            expect(meta.page).toBe(2);
            expect(meta.limit).toBe(20);
        });
    });

    describe('paginatedResponse', () => {
        test('should return paginated response with all fields', () => {
            const res = createMockResponse();
            const data = [{ id: 1 }, { id: 2 }];
            
            paginatedResponse(res, data, 1, 10, 25);
            
            expect(res.statusCode).toBe(200);
            expect(res.jsonData.success).toBe(true);
            expect(res.jsonData.message).toBe('Success');
            expect(res.jsonData.data).toEqual(data);
            expect(res.jsonData.meta).toBeDefined();
            expect(res.jsonData.meta.total_records).toBe(25);
            expect(res.jsonData.meta.total_pages).toBe(3);
        });

        test('should allow custom message', () => {
            const res = createMockResponse();
            
            paginatedResponse(res, [], 1, 10, 0, 'Assets retrieved');
            
            expect(res.jsonData.message).toBe('Assets retrieved');
        });

        test('should allow custom status code', () => {
            const res = createMockResponse();
            
            paginatedResponse(res, [], 1, 10, 0, 'Success', 201);
            
            expect(res.statusCode).toBe(201);
        });
    });

    describe('ErrorCodes', () => {
        test('should have validation error codes', () => {
            expect(ErrorCodes.VALIDATION_ERROR).toBe('VAL_ERR_001');
            expect(ErrorCodes.INVALID_INPUT).toBe('VAL_ERR_002');
            expect(ErrorCodes.MISSING_FIELD).toBe('VAL_ERR_003');
            expect(ErrorCodes.DUPLICATE_ENTRY).toBe('VAL_ERR_004');
        });

        test('should have authentication error codes', () => {
            expect(ErrorCodes.INVALID_CREDENTIALS).toBe('AUTH_ERR_001');
            expect(ErrorCodes.TOKEN_EXPIRED).toBe('AUTH_ERR_002');
            expect(ErrorCodes.TOKEN_INVALID).toBe('AUTH_ERR_003');
            expect(ErrorCodes.NO_TOKEN).toBe('AUTH_ERR_004');
            expect(ErrorCodes.REFRESH_TOKEN_INVALID).toBe('AUTH_ERR_005');
        });

        test('should have authorization error codes', () => {
            expect(ErrorCodes.FORBIDDEN).toBe('AUTHZ_ERR_001');
            expect(ErrorCodes.INSUFFICIENT_ROLE).toBe('AUTHZ_ERR_002');
        });

        test('should have resource error codes', () => {
            expect(ErrorCodes.NOT_FOUND).toBe('RES_ERR_001');
            expect(ErrorCodes.ALREADY_EXISTS).toBe('RES_ERR_002');
        });

        test('should have transaction error codes', () => {
            expect(ErrorCodes.INVALID_STATUS_TRANSITION).toBe('TRX_ERR_001');
            expect(ErrorCodes.ASSET_NOT_AVAILABLE).toBe('TRX_ERR_002');
            expect(ErrorCodes.ASSET_NOT_ASSIGNED).toBe('TRX_ERR_003');
        });

        test('should have server error codes', () => {
            expect(ErrorCodes.INTERNAL_ERROR).toBe('SRV_ERR_001');
            expect(ErrorCodes.DATABASE_ERROR).toBe('SRV_ERR_002');
        });
    });
});
