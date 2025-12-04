import { useState, useEffect } from 'react';
import { 
    HiDesktopComputer, 
    HiCheckCircle, 
    HiUserGroup, 
    HiCog, 
    HiArchive,
    HiExclamation,
    HiCurrencyDollar,
    HiCalendar
} from 'react-icons/hi';
import api from '../api/axios';
import SummaryCard from '../components/dashboard/SummaryCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import Spinner from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import { formatCurrencyShort } from '../utils/export';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [summaryRes, transactionsRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/dashboard/recent-transactions?limit=5')
            ]);
            
            setSummary(summaryRes.data.data);
            setTransactions(transactionsRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState 
                message={error}
                onRetry={fetchDashboardData}
            />
        );
    }

    const assetsByStatus = summary?.assetsByStatus || {};

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of your IT assets</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Assets"
                    value={summary?.totalAssets || 0}
                    icon={HiDesktopComputer}
                    color="blue"
                />
                <SummaryCard
                    title="Available"
                    value={assetsByStatus.available || 0}
                    icon={HiCheckCircle}
                    color="green"
                />
                <SummaryCard
                    title="Assigned"
                    value={assetsByStatus.assigned || 0}
                    icon={HiUserGroup}
                    color="blue"
                />
                <SummaryCard
                    title="In Repair"
                    value={assetsByStatus.repair || 0}
                    icon={HiCog}
                    color="yellow"
                />
            </div>

            {/* Second row of cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Retired"
                    value={assetsByStatus.retired || 0}
                    icon={HiArchive}
                    color="gray"
                />
                <SummaryCard
                    title="Missing"
                    value={assetsByStatus.missing || 0}
                    icon={HiExclamation}
                    color="red"
                />
                <SummaryCard
                    title="Total Value"
                    value={formatCurrencyShort(summary?.totalValue || 0)}
                    icon={HiCurrencyDollar}
                    color="purple"
                />
                <SummaryCard
                    title="Added This Month"
                    value={summary?.assetsThisMonth || 0}
                    icon={HiCalendar}
                    color="teal"
                />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-500">Categories</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalCategories || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-500">Locations</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalLocations || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-500">Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalUsers || 0}</p>
                </div>
            </div>

            {/* Recent Transactions */}
            <RecentTransactions transactions={transactions} />
        </div>
    );
};

export default Dashboard;
