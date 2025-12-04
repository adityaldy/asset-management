import { useState, useEffect } from 'react';

/**
 * Debounce hook for search inputs
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
