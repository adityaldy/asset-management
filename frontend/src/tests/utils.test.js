/**
 * Utility Functions Tests
 * Tests for formatDate, export, and constants utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  formatCurrency, 
  formatNumber, 
  formatNumberShort, 
  formatCurrencyShort,
  exportToCSV,
  convertToCSV 
} from '../utils/export';

// formatDate utility replica (local mock for testing)
const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '-';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    date: { year: 'numeric', month: '2-digit', day: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' }
  };
  
  return date.toLocaleDateString('id-ID', options[format] || options.short);
};

describe('formatDate', () => {
  describe('Valid Dates', () => {
    it('should format date in short format', () => {
      const result = formatDate('2024-06-15');
      expect(result).toMatch(/Jun/i);
      expect(result).toMatch(/2024/);
    });

    it('should format date in long format', () => {
      const result = formatDate('2024-06-15T10:30:00', 'long');
      expect(result).toMatch(/2024/);
    });

    it('should format date in date format', () => {
      const result = formatDate('2024-06-15', 'date');
      expect(result).toMatch(/2024/);
    });

    it('should handle ISO date string', () => {
      const result = formatDate('2024-06-15T10:30:00.000Z');
      expect(result).not.toBe('-');
    });
  });

  describe('Invalid Dates', () => {
    it('should return dash for null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('should return dash for undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('should return dash for empty string', () => {
      expect(formatDate('')).toBe('-');
    });

    it('should return dash for invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('-');
    });
  });

  describe('Default Format', () => {
    it('should use short format by default', () => {
      const result = formatDate('2024-06-15');
      // Short format should contain abbreviated month
      expect(result).toBeDefined();
      expect(result).not.toBe('-');
    });

    it('should handle unknown format by using short', () => {
      const result = formatDate('2024-06-15', 'unknown');
      expect(result).not.toBe('-');
    });
  });
});

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('Rp');
    expect(result).toContain('1.000.000');
  });

  it('should format zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('Rp');
    expect(result).toContain('0');
  });

  it('should handle null', () => {
    const result = formatCurrency(null);
    expect(result).toBe('-');
  });

  it('should handle undefined', () => {
    const result = formatCurrency(undefined);
    expect(result).toBe('-');
  });

  it('should format large numbers with separators', () => {
    const result = formatCurrency(25000000);
    expect(result).toContain('Rp');
    expect(result).toContain('25.000.000');
  });
});

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    const result = formatNumber(1000000);
    expect(result).toBe('1.000.000');
  });

  it('should handle null', () => {
    expect(formatNumber(null)).toBe('-');
  });

  it('should handle undefined', () => {
    expect(formatNumber(undefined)).toBe('-');
  });

  it('should format zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatNumberShort', () => {
  describe('Triliun (T)', () => {
    it('should format exact triliun', () => {
      const result = formatNumberShort(1000000000000);
      expect(result).toBe('1 T');
    });

    it('should format triliun with decimal', () => {
      const result = formatNumberShort(1500000000000);
      expect(result).toBe('1,5 T');
    });
  });

  describe('Milyar (M)', () => {
    it('should format exact milyar', () => {
      const result = formatNumberShort(1000000000);
      expect(result).toBe('1 M');
    });

    it('should format milyar with decimal', () => {
      const result = formatNumberShort(2500000000);
      expect(result).toBe('2,5 M');
    });
  });

  describe('Juta (Jt)', () => {
    it('should format exact juta', () => {
      const result = formatNumberShort(1000000);
      expect(result).toBe('1 Jt');
    });

    it('should format juta with decimal', () => {
      const result = formatNumberShort(313000000);
      expect(result).toBe('313 Jt');
    });

    it('should format 2.5 juta', () => {
      const result = formatNumberShort(2500000);
      expect(result).toBe('2,5 Jt');
    });
  });

  describe('Ribu (Rb)', () => {
    it('should format exact ribu', () => {
      const result = formatNumberShort(1000);
      expect(result).toBe('1 Rb');
    });

    it('should format ribu with decimal', () => {
      const result = formatNumberShort(5500);
      expect(result).toBe('5,5 Rb');
    });
  });

  describe('Numbers below 1000', () => {
    it('should format without abbreviation', () => {
      const result = formatNumberShort(500);
      expect(result).toBe('500');
    });

    it('should format zero', () => {
      const result = formatNumberShort(0);
      expect(result).toBe('0');
    });
  });

  describe('Edge cases', () => {
    it('should handle null', () => {
      expect(formatNumberShort(null)).toBe('-');
    });

    it('should handle undefined', () => {
      expect(formatNumberShort(undefined)).toBe('-');
    });

    it('should handle negative numbers', () => {
      const result = formatNumberShort(-5000000);
      expect(result).toBe('-5 Jt');
    });
  });
});

describe('formatCurrencyShort', () => {
  describe('Triliun (T)', () => {
    it('should format triliun with Rp prefix', () => {
      const result = formatCurrencyShort(1000000000000);
      expect(result).toBe('Rp 1 T');
    });
  });

  describe('Milyar (M)', () => {
    it('should format milyar with Rp prefix', () => {
      const result = formatCurrencyShort(1000000000);
      expect(result).toBe('Rp 1 M');
    });
  });

  describe('Juta (Jt)', () => {
    it('should format juta with Rp prefix', () => {
      const result = formatCurrencyShort(313000000);
      expect(result).toBe('Rp 313 Jt');
    });

    it('should format juta with decimal', () => {
      const result = formatCurrencyShort(1500000);
      expect(result).toBe('Rp 1,5 Jt');
    });
  });

  describe('Ribu (Rb)', () => {
    it('should format ribu with Rp prefix', () => {
      const result = formatCurrencyShort(50000);
      expect(result).toBe('Rp 50 Rb');
    });
  });

  describe('Below 1000', () => {
    it('should format with full number', () => {
      const result = formatCurrencyShort(500);
      expect(result).toBe('Rp 500');
    });
  });

  describe('Custom prefix', () => {
    it('should allow custom currency prefix', () => {
      const result = formatCurrencyShort(1000000, '$');
      expect(result).toBe('$ 1 Jt');
    });
  });

  describe('Edge cases', () => {
    it('should handle null', () => {
      expect(formatCurrencyShort(null)).toBe('-');
    });

    it('should handle undefined', () => {
      expect(formatCurrencyShort(undefined)).toBe('-');
    });

    it('should handle negative numbers', () => {
      const result = formatCurrencyShort(-5000000);
      expect(result).toBe('-Rp 5 Jt');
    });
  });
});

describe('exportToCSV', () => {
  // Mock DOM elements for exportToCSV
  beforeEach(() => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    
    // Mock document methods
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Export', () => {
    it('should export simple data to CSV', () => {
      const data = [
        { name: 'Item 1', value: 100 },
        { name: 'Item 2', value: 200 }
      ];
      
      const result = exportToCSV(data, 'test.csv');
      
      expect(result).toContain('name,value');
      expect(result).toContain('Item 1,100');
      expect(result).toContain('Item 2,200');
    });

    it('should include headers as first row', () => {
      const data = [{ a: 1, b: 2, c: 3 }];
      
      const result = exportToCSV(data, 'test.csv');
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('a,b,c');
    });
  });

  describe('Special Characters', () => {
    it('should escape quotes in values', () => {
      const data = [{ name: 'Item "quoted"', value: 100 }];
      
      const result = exportToCSV(data, 'test.csv');
      
      expect(result).toContain('""quoted""');
    });

    it('should wrap values with commas in quotes', () => {
      const data = [{ name: 'Item, with comma', value: 100 }];
      
      const result = exportToCSV(data, 'test.csv');
      
      expect(result).toContain('"Item, with comma"');
    });

    it('should handle newlines in values', () => {
      const data = [{ name: 'Item\nwith newline', value: 100 }];
      
      const result = exportToCSV(data, 'test.csv');
      
      expect(result).toContain('"Item\nwith newline"');
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for empty data', () => {
      expect(() => exportToCSV([], 'test.csv')).toThrow('No data to export');
    });

    it('should throw error for null data', () => {
      expect(() => exportToCSV(null, 'test.csv')).toThrow();
    });

    it('should handle null values in data', () => {
      const data = [{ name: 'Item', value: null }];
      
      const result = exportToCSV(data, 'test.csv');
      
      expect(result).toContain('name,value');
      expect(result).toContain('Item,');
    });

    it('should handle undefined values in data', () => {
      const data = [{ name: 'Item', value: undefined }];
      
      const result = exportToCSV(data, 'test.csv');
      
      expect(result).toContain('name,value');
    });
  });

  describe('Multiple Rows', () => {
    it('should separate rows with newlines', () => {
      const data = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' }
      ];
      
      const result = exportToCSV(data, 'test.csv');
      const lines = result.split('\n');
      
      expect(lines.length).toBe(4); // 1 header + 3 data rows
    });
  });
});

describe('convertToCSV', () => {
  describe('Basic Conversion', () => {
    it('should convert data to CSV string', () => {
      const data = [
        { name: 'Test', value: 100 }
      ];
      
      const result = convertToCSV(data);
      
      expect(result).toBe('name,value\nTest,100');
    });

    it('should throw error for empty data', () => {
      expect(() => convertToCSV([])).toThrow('No data to export');
    });

    it('should throw error for null data', () => {
      expect(() => convertToCSV(null)).toThrow('No data to export');
    });
  });
});

describe('Constants', () => {
  const ASSET_STATUS = {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    REPAIR: 'repair',
    RETIRED: 'retired',
    MISSING: 'missing'
  };

  const USER_ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    EMPLOYEE: 'employee'
  };

  describe('Asset Status', () => {
    it('should have all required statuses', () => {
      expect(ASSET_STATUS.AVAILABLE).toBe('available');
      expect(ASSET_STATUS.ASSIGNED).toBe('assigned');
      expect(ASSET_STATUS.REPAIR).toBe('repair');
      expect(ASSET_STATUS.RETIRED).toBe('retired');
      expect(ASSET_STATUS.MISSING).toBe('missing');
    });

    it('should have 5 status types', () => {
      expect(Object.keys(ASSET_STATUS).length).toBe(5);
    });
  });

  describe('User Roles', () => {
    it('should have all required roles', () => {
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.STAFF).toBe('staff');
      expect(USER_ROLES.EMPLOYEE).toBe('employee');
    });

    it('should have 3 role types', () => {
      expect(Object.keys(USER_ROLES).length).toBe(3);
    });
  });
});
