import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiSearch, HiFilter, HiRefresh } from 'react-icons/hi';
import api from '../api/axios';
import useDebounce from '../hooks/useDebounce';
import AssetTable from '../components/assets/AssetTable';
import Pagination from '../components/common/Pagination';
import Spinner from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import { ASSET_STATUS, ASSET_STATUS_LABELS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const AssetList = () => {
    const { user } = useAuth();
    const canCreate = ['admin', 'staff'].includes(user?.role);

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Dropdown options
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);

    const debouncedSearch = useDebounce(search, 500);

    // Fetch categories and locations for filters
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [catRes, locRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/locations')
                ]);
                setCategories(catRes.data.data?.categories || []);
                setLocations(locRes.data.data?.locations || []);
            } catch (err) {
                console.error('Failed to fetch filter options:', err);
            }
        };
        fetchOptions();
    }, []);

    // Fetch assets
    const fetchAssets = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                page,
                limit,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(status && { status }),
                ...(categoryId && { category_id: categoryId }),
                ...(locationId && { location_id: locationId })
            };

            const response = await api.get('/assets', { params });
            const data = response.data.data;
            setAssets(data?.assets || []);
            setTotalItems(data?.pagination?.total_records || 0);
            setTotalPages(data?.pagination?.total_pages || 1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch assets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [page, limit, debouncedSearch, status, categoryId, locationId]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, status, categoryId, locationId]);

    const handleDelete = async (uuid) => {
        try {
            await api.delete(`/assets/${uuid}`);
            fetchAssets();
            return true;
        } catch (err) {
            throw err;
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setCategoryId('');
        setLocationId('');
        setPage(1);
    };

    const hasActiveFilters = search || status || categoryId || locationId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
                    <p className="text-gray-600 mt-1">Manage your IT assets inventory</p>
                </div>
                {canCreate && (
                    <Link
                        to="/assets/add"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <HiPlus className="w-5 h-5" />
                        Add Asset
                    </Link>
                )}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, asset tag, or serial number..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                            hasActiveFilters 
                                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <HiFilter className="w-5 h-5" />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={fetchAssets}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <select
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Locations</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            {error ? (
                <ErrorState message={error} onRetry={fetchAssets} />
            ) : (
                <>
                    <AssetTable 
                        assets={assets} 
                        loading={loading} 
                        onDelete={handleDelete}
                    />
                    
                    {!loading && assets.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={limit}
                            onPageChange={setPage}
                            onLimitChange={(newLimit) => {
                                setLimit(newLimit);
                                setPage(1);
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default AssetList;
