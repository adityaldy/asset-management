/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename (without extension)
 */
export const exportToCSV = (data, filename = 'export') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from first object keys
    const headers = Object.keys(data[0]);
    
    // Create header row
    const headerRow = headers.map(h => `"${h}"`).join(',');
    
    // Create data rows
    const dataRows = data.map(row => {
        return headers.map(key => {
            let value = row[key];
            
            // Handle null/undefined
            if (value === null || value === undefined) {
                value = '';
            }
            
            // Escape quotes and wrap in quotes
            value = String(value).replace(/"/g, '""');
            return `"${value}"`;
        }).join(',');
    });
    
    // Combine header and data
    const csvContent = [headerRow, ...dataRows].join('\n');
    
    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Add timestamp to filename
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

/**
 * Format number with thousand separators
 * @param {number} value - Number to format
 */
export const formatNumber = (value) => {
    if (value === null || value === undefined) return '-';
    
    return new Intl.NumberFormat('id-ID').format(value);
};
