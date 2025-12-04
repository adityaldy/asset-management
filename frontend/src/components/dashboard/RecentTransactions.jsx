import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';
import EmptyState from '../common/EmptyState';
import { HiSwitchHorizontal } from 'react-icons/hi';

const RecentTransactions = ({ transactions = [], loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                </div>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                </div>
                <EmptyState 
                    title="No transactions yet"
                    description="Transactions will appear here once assets are checked out or checked in."
                    icon={HiSwitchHorizontal}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                <Link 
                    to="/transactions"
                    className="text-sm text-blue-600 hover:text-blue-700"
                >
                    View All
                </Link>
            </div>
            <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <HiSwitchHorizontal className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {transaction.asset?.name || 'Unknown Asset'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {transaction.asset?.asset_tag} • {transaction.performedBy?.name || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <StatusBadge status={transaction.action_type} type="action" />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(transaction.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentTransactions;
