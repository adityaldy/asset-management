import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalItems,
    itemsPerPage,
    onPageChange,
    onLimitChange,
    limitOptions = [10, 25, 50, 100]
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    if (totalPages <= 1 && totalItems <= itemsPerPage) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t">
            {/* Items info */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                </span>
                
                {onLimitChange && (
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        {limitOptions.map(option => (
                            <option key={option} value={option}>
                                {option} per page
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Page navigation */}
            <nav className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <HiChevronLeft className="w-5 h-5" />
                </button>

                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        disabled={page === '...'}
                        className={`px-3 py-1 text-sm rounded-md ${
                            page === currentPage
                                ? 'bg-blue-600 text-white'
                                : page === '...'
                                ? 'text-gray-500 cursor-default'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <HiChevronRight className="w-5 h-5" />
                </button>
            </nav>
        </div>
    );
};

export default Pagination;
