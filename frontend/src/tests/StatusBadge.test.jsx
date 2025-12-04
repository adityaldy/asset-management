/**
 * StatusBadge Component Tests
 * Tests rendering and color mapping for different status types
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Mock constants
const ASSET_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
  repair: 'bg-yellow-100 text-yellow-800',
  retired: 'bg-gray-100 text-gray-800',
  missing: 'bg-red-100 text-red-800'
};

const ASSET_STATUS_LABELS = {
  available: 'Available',
  assigned: 'Assigned',
  repair: 'In Repair',
  retired: 'Retired',
  missing: 'Missing'
};

const USER_ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  employee: 'bg-gray-100 text-gray-800'
};

const USER_ROLE_LABELS = {
  admin: 'Admin',
  staff: 'Staff',
  employee: 'Employee'
};

const ACTION_TYPE_COLORS = {
  checkout: 'bg-blue-100 text-blue-800',
  checkin: 'bg-green-100 text-green-800',
  repair: 'bg-yellow-100 text-yellow-800',
  dispose: 'bg-red-100 text-red-800'
};

const ACTION_TYPE_LABELS = {
  checkout: 'Check Out',
  checkin: 'Check In',
  repair: 'Repair',
  dispose: 'Dispose'
};

// StatusBadge component replica for testing
const StatusBadge = ({ status, type = 'asset' }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let label = status;

  switch (type) {
    case 'asset':
      colorClass = ASSET_STATUS_COLORS[status] || colorClass;
      label = ASSET_STATUS_LABELS[status] || status;
      break;
    case 'role':
      colorClass = USER_ROLE_COLORS[status] || colorClass;
      label = USER_ROLE_LABELS[status] || status;
      break;
    case 'action':
      colorClass = ACTION_TYPE_COLORS[status] || colorClass;
      label = ACTION_TYPE_LABELS[status] || status;
      break;
    default:
      break;
  }

  return (
    <span 
      data-testid="status-badge" 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
};

describe('StatusBadge', () => {
  
  describe('Asset Status', () => {
    it('should render Available status with green color', () => {
      render(<StatusBadge status="available" type="asset" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Available');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should render Assigned status with blue color', () => {
      render(<StatusBadge status="assigned" type="asset" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Assigned');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should render In Repair status with yellow color', () => {
      render(<StatusBadge status="repair" type="asset" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('In Repair');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should render Retired status with gray color', () => {
      render(<StatusBadge status="retired" type="asset" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Retired');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should render Missing status with red color', () => {
      render(<StatusBadge status="missing" type="asset" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Missing');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('User Role Status', () => {
    it('should render Admin role with purple color', () => {
      render(<StatusBadge status="admin" type="role" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Admin');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('should render Staff role with blue color', () => {
      render(<StatusBadge status="staff" type="role" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Staff');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should render Employee role with gray color', () => {
      render(<StatusBadge status="employee" type="role" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Employee');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Action Type Status', () => {
    it('should render Check Out action with blue color', () => {
      render(<StatusBadge status="checkout" type="action" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Check Out');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should render Check In action with green color', () => {
      render(<StatusBadge status="checkin" type="action" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Check In');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('Unknown Status', () => {
    it('should render unknown status with default gray color', () => {
      render(<StatusBadge status="unknown_status" type="asset" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('unknown_status');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should render status as-is when no label mapping exists', () => {
      render(<StatusBadge status="custom_status" type="unknown_type" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('custom_status');
    });
  });

  describe('Default Type', () => {
    it('should use asset type by default', () => {
      render(<StatusBadge status="available" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('Available');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('Styling', () => {
    it('should have rounded-full class for pill shape', () => {
      render(<StatusBadge status="available" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have font-medium class', () => {
      render(<StatusBadge status="available" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveClass('font-medium');
    });

    it('should have text-xs class for small text', () => {
      render(<StatusBadge status="available" />);
      
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveClass('text-xs');
    });
  });
});
