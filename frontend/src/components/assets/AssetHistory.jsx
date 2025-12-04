import { Link } from 'react-router-dom';
import { HiArrowRight, HiArrowLeft, HiCube, HiRefresh, HiExclamation, HiCheckCircle } from 'react-icons/hi';
import { formatDateTime, formatRelativeTime } from '../../utils/formatDate';
import { ACTION_LABELS } from '../../utils/constants';

const getActionIcon = (action) => {
    const icons = {
        checkout: HiArrowRight,
        checkin: HiArrowLeft,
        create: HiCube,
        update: HiRefresh,
        maintenance: HiExclamation,
        dispose: HiCheckCircle
    };
    const Icon = icons[action] || HiCube;
    return Icon;
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

const AssetHistory = ({ transactions = [], loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                <p className="text-gray-500 text-sm text-center py-8">
                    No transaction history yet
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
            
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                    {transactions.map((transaction, index) => {
                        const Icon = getActionIcon(transaction.action);
                        const colorClass = getActionColor(transaction.action);

                        return (
                            <div key={transaction.id || index} className="relative flex items-start gap-4">
                                {/* Icon */}
                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {ACTION_LABELS[transaction.action] || transaction.action}
                                            </p>
                                            
                                            {/* User info */}
                                            {(transaction.from_user || transaction.to_user) && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {transaction.action === 'checkout' && transaction.to_user && (
                                                        <>Assigned to <span className="font-medium">{transaction.to_user.name}</span></>
                                                    )}
                                                    {transaction.action === 'checkin' && transaction.from_user && (
                                                        <>Returned from <span className="font-medium">{transaction.from_user.name}</span></>
                                                    )}
                                                </p>
                                            )}

                                            {/* Notes */}
                                            {transaction.notes && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {transaction.notes}
                                                </p>
                                            )}

                                            {/* Performed by */}
                                            {transaction.performed_by && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    By {transaction.performed_by.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Time */}
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-gray-500">
                                                {formatRelativeTime(transaction.createdAt)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatDateTime(transaction.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AssetHistory;
