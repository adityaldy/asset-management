/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
    if (!date) return '-';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };
    
    return new Date(date).toLocaleDateString('id-ID', defaultOptions);
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 */
export const formatDateTime = (date) => {
    if (!date) return '-';
    
    return new Date(date).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 */
export const formatDateForInput = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 */
export const getRelativeTime = (date) => {
    if (!date) return '-';
    
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now - then) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date);
};

/**
 * Alias for getRelativeTime
 */
export const formatRelativeTime = getRelativeTime;

/**
 * Check if a date is expired (in the past)
 * @param {string|Date} date - Date to check
 */
export const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
};

/**
 * Format number to currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: IDR)
 */
export const formatCurrency = (value, currency = 'IDR') => {
    if (value === null || value === undefined) return '-';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};
