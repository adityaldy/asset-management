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
 * Format number with abbreviation (Ribu, Juta, Milyar, Triliun)
 * @param {number} value - Number to format
 * @returns {string} Formatted number with abbreviation
 */
export const formatNumberShort = (value) => {
    if (value === null || value === undefined) return '-';
    
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    
    if (absValue >= 1_000_000_000_000) {
        // Triliun (1,000,000,000,000+)
        const formatted = (absValue / 1_000_000_000_000).toFixed(absValue % 1_000_000_000_000 === 0 ? 0 : 1);
        return `${sign}${formatted.replace('.', ',')} T`;
    } else if (absValue >= 1_000_000_000) {
        // Milyar (1,000,000,000+)
        const formatted = (absValue / 1_000_000_000).toFixed(absValue % 1_000_000_000 === 0 ? 0 : 1);
        return `${sign}${formatted.replace('.', ',')} M`;
    } else if (absValue >= 1_000_000) {
        // Juta (1,000,000+)
        const formatted = (absValue / 1_000_000).toFixed(absValue % 1_000_000 === 0 ? 0 : 1);
        return `${sign}${formatted.replace('.', ',')} Jt`;
    } else if (absValue >= 1_000) {
        // Ribu (1,000+)
        const formatted = (absValue / 1_000).toFixed(absValue % 1_000 === 0 ? 0 : 1);
        return `${sign}${formatted.replace('.', ',')} Rb`;
    }
    
    return new Intl.NumberFormat('id-ID').format(value);
};

/**
 * Format currency with abbreviation (Ribu, Juta, Milyar, Triliun)
 * @param {number} value - Number to format
 * @param {string} prefix - Currency prefix (default: Rp)
 * @returns {string} Formatted currency with abbreviation
 */
export const formatCurrencyShort = (value, prefix = 'Rp') => {
    if (value === null || value === undefined) return '-';
    
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    
    if (absValue >= 1_000_000_000_000) {
        // Triliun (1,000,000,000,000+)
        const formatted = (absValue / 1_000_000_000_000).toFixed(absValue % 1_000_000_000_000 === 0 ? 0 : 1);
        return `${sign}${prefix} ${formatted.replace('.', ',')} T`;
    } else if (absValue >= 1_000_000_000) {
        // Milyar (1,000,000,000+)
        const formatted = (absValue / 1_000_000_000).toFixed(absValue % 1_000_000_000 === 0 ? 0 : 1);
        return `${sign}${prefix} ${formatted.replace('.', ',')} M`;
    } else if (absValue >= 1_000_000) {
        // Juta (1,000,000+)
        const formatted = (absValue / 1_000_000).toFixed(absValue % 1_000_000 === 0 ? 0 : 1);
        return `${sign}${prefix} ${formatted.replace('.', ',')} Jt`;
    } else if (absValue >= 1_000) {
        // Ribu (1,000+)
        const formatted = (absValue / 1_000).toFixed(absValue % 1_000 === 0 ? 0 : 1);
        return `${sign}${prefix} ${formatted.replace('.', ',')} Rb`;
    }
    
    return `${prefix} ${new Intl.NumberFormat('id-ID').format(value)}`;
};

/**
 * Format number with thousand separators
 * @param {number} value - Number to format
 */
export const formatNumber = (value) => {
    if (value === null || value === undefined) return '-';
    
    return new Intl.NumberFormat('id-ID').format(value);
};
