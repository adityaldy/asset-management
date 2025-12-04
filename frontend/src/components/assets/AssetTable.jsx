import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiEye, HiPencil, HiTrash } from 'react-icons/hi';
import StatusBadge from '../common/StatusBadge';
import TableSkeleton from '../common/TableSkeleton';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AssetTable = ({ assets = [], loading = false, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canEdit = ['admin', 'staff'].includes(user?.role);
    const canDelete = user?.role === 'admin';

    const [deleteModal, setDeleteModal] = useState({ open: false, asset: null });
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (asset) => {
        setDeleteModal({ open: true, asset });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.asset) return;
        
        setDeleting(true);
        try {
            await onDelete(deleteModal.asset.uuid);
            toast.success('Asset deleted successfully');
            setDeleteModal({ open: false, asset: null });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete asset');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <TableSkeleton rows={5} columns={7} />;
    }

    if (!assets || assets.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm">
                <EmptyState
                    title="No assets found"
                    description="Start by adding your first asset to the inventory."
                    action={
                        canEdit && (
                            <Link
                                to="/assets/add"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Asset
                            </Link>
                        )
                    }
                />
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Asset
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Holder
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Purchase Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {asset.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {asset.asset_tag}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">
                                            {asset.category?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">
                                            {asset.location?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={asset.status} type="asset" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">
                                            {asset.currentHolder?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500">
                                            {formatDate(asset.purchase_date)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/assets/${asset.uuid}`)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <HiEye className="w-5 h-5" />
                                            </button>
                                            {canEdit && (
                                                <button
                                                    onClick={() => navigate(`/assets/${asset.uuid}/edit`)}
                                                    className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <HiPencil className="w-5 h-5" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteClick(asset)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <HiTrash className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, asset: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Asset"
                message={`Are you sure you want to delete "${deleteModal.asset?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={deleting}
            />
        </>
    );
};

export default AssetTable;
