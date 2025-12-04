import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Generic fetch hook for API calls
 * @param {string} url - API endpoint
 * @param {object} options - { immediate: boolean, params: object }
 */
const useFetch = (url, options = {}) => {
    const { immediate = true, params = {} } = options;
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (fetchParams = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get(url, { 
                params: { ...params, ...fetchParams } 
            });
            setData(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch data';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(params)]);

    const refetch = useCallback((newParams = {}) => {
        return fetchData(newParams);
    }, [fetchData]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [immediate, fetchData]);

    return { data, loading, error, refetch, setData };
};

export default useFetch;
