/**
 * Pagination Component Tests
 * Tests page navigation and controls
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Pagination component replica for testing
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange
}) => {
  const pages = [];
  
  // Calculate page range to display
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  // Adjust if we're near the beginning or end
  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages);
  }
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between" data-testid="pagination">
      <div className="flex items-center gap-2" data-testid="items-per-page">
        <span>Show</span>
        <select 
          value={itemsPerPage} 
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          data-testid="items-per-page-select"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span>of {totalItems} items</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          data-testid="prev-button"
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-500 text-white' : ''}`}
            data-testid={`page-${page}`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          data-testid="next-button"
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
    onItemsPerPageChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination when totalPages > 1', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should not render when totalPages is 1', () => {
      render(<Pagination {...defaultProps} totalPages={1} />);
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should render previous and next buttons', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByTestId('prev-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });

    it('should display total items count', () => {
      render(<Pagination {...defaultProps} totalItems={50} />);
      expect(screen.getByText(/of 50 items/)).toBeInTheDocument();
    });
  });

  describe('Page Navigation', () => {
    it('should disable previous button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      expect(screen.getByTestId('prev-button')).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} />);
      expect(screen.getByTestId('next-button')).toBeDisabled();
    });

    it('should call onPageChange with previous page when clicking Previous', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByTestId('prev-button'));
      
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange with next page when clicking Next', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it('should call onPageChange when clicking page number', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByTestId('page-3'));
      
      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Page Numbers Display', () => {
    it('should highlight current page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);
      
      const currentPageButton = screen.getByTestId('page-3');
      expect(currentPageButton).toHaveClass('bg-blue-500', 'text-white');
    });

    it('should show correct page range at the beginning', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      
      expect(screen.getByTestId('page-1')).toBeInTheDocument();
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
    });

    it('should show correct page range in the middle', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
      expect(screen.getByTestId('page-4')).toBeInTheDocument();
      expect(screen.getByTestId('page-5')).toBeInTheDocument();
      expect(screen.getByTestId('page-6')).toBeInTheDocument();
      expect(screen.getByTestId('page-7')).toBeInTheDocument();
    });

    it('should show correct page range at the end', () => {
      render(<Pagination {...defaultProps} currentPage={10} />);
      
      expect(screen.getByTestId('page-10')).toBeInTheDocument();
    });
  });

  describe('Items Per Page', () => {
    it('should render items per page selector', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByTestId('items-per-page-select')).toBeInTheDocument();
    });

    it('should call onItemsPerPageChange when selecting new value', () => {
      const onItemsPerPageChange = vi.fn();
      render(<Pagination {...defaultProps} onItemsPerPageChange={onItemsPerPageChange} />);
      
      const select = screen.getByTestId('items-per-page-select');
      fireEvent.change(select, { target: { value: '25' } });
      
      expect(onItemsPerPageChange).toHaveBeenCalledWith(25);
    });

    it('should display current items per page', () => {
      render(<Pagination {...defaultProps} itemsPerPage={25} />);
      
      const select = screen.getByTestId('items-per-page-select');
      expect(select).toHaveValue('25');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single digit total pages', () => {
      render(<Pagination {...defaultProps} totalPages={3} />);
      
      expect(screen.getByTestId('page-1')).toBeInTheDocument();
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
    });

    it('should not call onPageChange when clicking Previous on first page', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByTestId('prev-button'));
      
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('should not call onPageChange when clicking Next on last page', () => {
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} currentPage={10} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });
});
