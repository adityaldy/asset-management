import { useState, useEffect } from 'react';
import { HiDownload, HiDocumentReport, HiChartBar, HiCube, HiUsers, HiLocationMarker } from 'react-icons/hi';
import api from '../api/axios';
import { exportToCSV } from '../utils/export';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [reportType, setReportType] = useState('assets');

    // Fetch dashboard stats for report overview
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/summary');
                setStats(res.data.data);
            } catch (err) {
                console.error('Failed to load stats');
            }
        };
        fetchStats();
    }, []);

    const generateReport = async (type) => {
        setLoading(true);
        try {
            let endpoint = '';
            let filename = '';
            
            switch (type) {
                case 'assets':
                    endpoint = '/reports/assets';
                    filename = 'assets-report';
                    break;
                case 'assets-by-category':
                    endpoint = '/reports/assets-by-category';
                    filename = 'assets-by-category';
                    break;
                case 'assets-by-location':
                    endpoint = '/reports/assets-by-location';
                    filename = 'assets-by-location';
                    break;
                case 'assets-by-status':
                    endpoint = '/reports/assets-by-status';
                    filename = 'assets-by-status';
                    break;
                case 'transactions':
                    endpoint = '/reports/transactions';
                    filename = 'transactions-report';
                    break;
                case 'users':
                    endpoint = '/reports/users';
                    filename = 'users-report';
                    break;
                case 'warranty-expiring':
                    endpoint = '/reports/warranty-expiring';
                    filename = 'warranty-expiring';
                    break;
                default:
                    endpoint = '/reports/assets';
                    filename = 'report';
            }

            const params = new URLSearchParams();
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            
            const res = await api.get(`${endpoint}?${params.toString()}`);
            const data = res.data.data || [];
            
            if (data.length === 0) {
                toast.error('No data to export');
                return;
            }

            exportToCSV(data, filename);
            toast.success('Report downloaded successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const reportCards = [
        {
            id: 'assets',
            title: 'All Assets Report',
            description: 'Complete list of all assets with details',
            icon: HiCube,
            color: 'blue'
        },
        {
            id: 'assets-by-category',
            title: 'Assets by Category',
            description: 'Assets grouped by category',
            icon: HiChartBar,
            color: 'purple'
        },
        {
            id: 'assets-by-location',
            title: 'Assets by Location',
            description: 'Assets grouped by location',
            icon: HiLocationMarker,
            color: 'green'
        },
        {
            id: 'assets-by-status',
            title: 'Assets by Status',
            description: 'Assets grouped by status',
            icon: HiDocumentReport,
            color: 'yellow'
        },
        {
            id: 'transactions',
            title: 'Transaction History',
            description: 'All asset transactions and movements',
            icon: HiChartBar,
            color: 'indigo'
        },
        {
            id: 'users',
            title: 'Users Report',
            description: 'All users and their assigned assets',
            icon: HiUsers,
            color: 'pink'
        },
        {
            id: 'warranty-expiring',
            title: 'Warranty Expiring',
            description: 'Assets with warranty expiring soon',
            icon: HiDocumentReport,
            color: 'red'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        pink: 'bg-pink-100 text-pink-600',
        red: 'bg-red-100 text-red-600'
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-500">Generate and export various reports</p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <HiCube className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Assets</p>
                                <p className="text-2xl font-bold">{stats.totalAssets || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <HiCube className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Available</p>
                                <p className="text-2xl font-bold">{stats.availableAssets || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <HiCube className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Checked Out</p>
                                <p className="text-2xl font-bold">{stats.checkedOutAssets || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <HiUsers className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Users</p>
                                <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Date Range (Optional)</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {(dateFrom || dateTo) && (
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Clear Dates
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportCards.map((report) => {
                    const Icon = report.icon;
                    const colorClass = colorClasses[report.color];
                    
                    return (
                        <div
                            key={report.id}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-lg ${colorClass}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mt-4">
                                {report.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {report.description}
                            </p>
                            <button
                                onClick={() => generateReport(report.id)}
                                disabled={loading}
                                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <HiDownload className="w-4 h-4" />
                                {loading ? 'Generating...' : 'Download CSV'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Quick Export All */}
            <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-white">
                        <h3 className="text-lg font-semibold">Need a complete export?</h3>
                        <p className="text-blue-100">Download all assets data in one click</p>
                    </div>
                    <button
                        onClick={() => generateReport('assets')}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                        <HiDownload className="w-5 h-5" />
                        Export All Assets
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
