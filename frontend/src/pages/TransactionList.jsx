import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiSearch, HiFilter, HiDownload, HiArrowRight, HiArrowLeft, HiRefresh } from 'react-icons/hi';
import api from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { formatDateTime, formatDate } from '../utils/formatDate';
import { ACTION_LABELS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { exportToCSV } from '../utils/export';

const getActionIcon = (action) => {
    if (action === 'checkout') return HiArrowRight;
    if (action === 'checkin') return HiArrowLeft;
    return HiRefresh;
};

const getActionColor = (action) => {
    const colors = {
        checkout: 'text-blue-600 bg-blue-100',
        checkin: 'text-green-600 bg-green-100',
        create: 'text-purple-600 bg-purple-100',
        update: 'text-yellow-600 bg-yellow-100',
        maintenance: 'text-orange-600 bg-orange-100',
        dispose: 'text-red-600 bg-red-100'
    };
    return colors[action] || 'text-gray-600 bg-gray-100';
};

const TransactionList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canCreate = ['admin', 'staff'].includes(user?.role);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const debouncedSearch = useDebounce(search, 500);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', limit);
            
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (action) params.append('action', action);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            
            const res = await api.get(`/transactions?${params.toString()}`);
            const data = res.data.data;
            setTransactions(data?.transactions || []);
            setTotalPages(data?.pagination?.total_pages || 1);
            setTotalItems(data?.pagination?.total_records || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, debouncedSearch, action, dateFrom, dateTo]);

    const handleExport = () => {
        const exportData = transactions.map(tx => ({
            'Date': formatDateTime(tx.transaction_date || tx.created_at),
            'Asset': tx.asset?.name || '-',
            'Asset Tag': tx.asset?.asset_tag || '-',
            'Action': ACTION_LABELS[tx.action_type] || tx.action_type,
            'Employee': tx.employee?.name || '-',
            'Performed By': tx.admin?.name || '-',
            'Notes': tx.notes || '-'
        }));
        exportToCSV(exportData, 'transactions');
    };

    const clearFilters = () => {
        setSearch('');
        setAction('');
        setDateFrom('');
        setDateTo('');
        setCurrentPage(1);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-500">Track all asset movements and activities</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <HiDownload className="w-4 h-4" />
                        Export
                    </button>
                    {canCreate && (
                        <>
                            <Link
                                to="/transactions/checkout"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <HiArrowRight className="w-4 h-4" />
                                Checkout
                            </Link>
                            <Link
                                to="/transactions/checkin"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                Check In
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search assets..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Action Filter */}
                    <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Actions</option>
                        <option value="checkout">Checkout</option>
                        <option value="checkin">Check In</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="dispose">Dispose</option>
                    </select>

                    {/* Date From */}
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="From Date"
                    />

                    {/* Date To */}
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="To Date"
                    />

                    {/* Clear Button */}
                    <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiRefresh className="w-4 h-4" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <ErrorState
                    title="Failed to load transactions"
                    message={error}
                    onRetry={fetchTransactions}
                />
            )}

            {/* Loading */}
            {loading && <TableSkeleton rows={5} columns={7} />}

            {/* Table */}
            {!loading && !error && (
                <>
                    {transactions.length === 0 ? (
                        <EmptyState
                            title="No transactions found"
                            description="There are no transactions matching your criteria."
                        />
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Asset
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                From
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                To
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Performed By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Notes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((tx) => {
                                            const Icon = getActionIcon(tx.action_type);
                                            const colorClass = getActionColor(tx.action_type);
                                            
                                            return (
                                                <tr key={tx.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">
                                                            {formatDateTime(tx.transaction_date || tx.created_at)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {tx.asset ? (
                                                            <Link
                                                                to={`/assets/${tx.asset.uuid}`}
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                <div className="font-medium">{tx.asset.name}</div>
                                                                <div className="text-gray-500">{tx.asset.asset_tag}</div>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${colorClass}`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {ACTION_LABELS[tx.action_type] || tx.action_type}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">
                                                            {tx.employee?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">
                                                            {tx.employee?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">
                                                            {tx.admin?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-500 line-clamp-2">
                                                            {tx.notes || '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={totalItems}
                                itemsPerPage={limit}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TransactionList;
