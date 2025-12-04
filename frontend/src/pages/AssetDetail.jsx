import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiPencil, HiTrash, HiOutlineQrcode, HiCube, HiLocationMarker, HiCalendar, HiCurrencyDollar, HiShieldCheck, HiUser } from 'react-icons/hi';
import api from '../api/axios';
import PageLoader from '../components/common/PageLoader';
import ErrorState from '../components/common/ErrorState';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AssetHistory from '../components/assets/AssetHistory';
import { formatDate, formatCurrency, isExpired } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AssetDetail = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const canEdit = ['admin', 'staff'].includes(user?.role);
    const canDelete = user?.role === 'admin';

    const [asset, setAsset] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchAsset = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/assets/${uuid}`);
            setAsset(res.data.data);
            
            // Fetch transactions
            try {
                const txRes = await api.get(`/transactions?asset_id=${res.data.data.id}`);
                setTransactions(txRes.data.data || []);
            } catch {
                // Transactions might not be available
                setTransactions([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load asset');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAsset();
    }, [uuid]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/assets/${uuid}`);
            toast.success('Asset deleted successfully');
            navigate('/assets');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete asset');
        } finally {
            setDeleting(false);
            setDeleteModal(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="p-6">
                <ErrorState
                    title="Asset not found"
                    message={error}
                    onRetry={fetchAsset}
                />
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="p-6">
                <ErrorState
                    title="Asset not found"
                    message="The requested asset could not be found."
                />
            </div>
        );
    }

    const warrantyExpired = isExpired(asset.warranty_expiry);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/assets')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
                        <p className="text-gray-500">{asset.asset_tag}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Link
                            to={`/assets/${uuid}/edit`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <HiPencil className="w-4 h-4" />
                            Edit
                        </Link>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => setDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <HiTrash className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status and Basic Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <StatusBadge status={asset.status} type="asset" />
                            <StatusBadge status={asset.condition} type="condition" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <HiCube className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{asset.category?.name || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <HiLocationMarker className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{asset.location?.name || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <HiOutlineQrcode className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Serial Number</p>
                                    <p className="font-medium">{asset.serial_number || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <HiUser className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Current Holder</p>
                                    <p className="font-medium">{asset.currentHolder?.name || 'Not assigned'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Brand</p>
                                <p className="font-medium">{asset.brand || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Model</p>
                                <p className="font-medium">{asset.model || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Details</p>
                                <p className="font-medium whitespace-pre-wrap">{asset.specifications || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <AssetHistory transactions={transactions} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Purchase Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <HiCalendar className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Purchase Date</p>
                                    <p className="font-medium">{formatDate(asset.purchase_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <HiCurrencyDollar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Purchase Price</p>
                                    <p className="font-medium">
                                        {asset.purchase_price ? `Rp ${parseInt(asset.purchase_price).toLocaleString('id-ID')}` : '-'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Vendor</p>
                                <p className="font-medium">{asset.vendor || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Warranty Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty</h3>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${warrantyExpired ? 'bg-red-100' : 'bg-green-100'}`}>
                                <HiShieldCheck className={`w-5 h-5 ${warrantyExpired ? 'text-red-600' : 'text-green-600'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Expiry Date</p>
                                <p className={`font-medium ${warrantyExpired ? 'text-red-600' : ''}`}>
                                    {formatDate(asset.warranty_expiry) || 'Not specified'}
                                </p>
                                {warrantyExpired && (
                                    <span className="text-xs text-red-500">Warranty expired</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {asset.notes && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{asset.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Asset"
                message={`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={deleting}
            />
        </div>
    );
};

export default AssetDetail;
