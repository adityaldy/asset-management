import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiSearch } from 'react-icons/hi';
import api from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    
    const [assets, setAssets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        asset_id: '',
        to_user_id: '',
        notes: '',
        checkout_date: new Date().toISOString().split('T')[0]
    });
    
    const [assetSearch, setAssetSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [assetRes, userRes] = await Promise.all([
                    api.get('/assets?status=available&limit=100'),
                    api.get('/users?limit=100')
                ]);
                setAssets(assetRes.data.data?.assets || []);
                setUsers(userRes.data.data?.users || []);
            } catch (err) {
                toast.error('Failed to load options');
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    const filteredAssets = assets.filter(asset => 
        asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        asset.asset_tag.toLowerCase().includes(assetSearch.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleAssetSelect = (asset) => {
        setSelectedAsset(asset);
        setFormData(prev => ({ ...prev, asset_id: asset.uuid }));
        setAssetSearch('');
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({ ...prev, to_user_id: user.uuid }));
        setUserSearch('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.asset_id) {
            toast.error('Please select an asset');
            return;
        }
        
        if (!formData.to_user_id) {
            toast.error('Please select a user');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/transactions/checkout', {
                assetId: formData.asset_id,
                userId: formData.to_user_id,
                notes: formData.notes
            });
            toast.success('Asset checked out successfully');
            navigate('/transactions');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to checkout asset');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingOptions) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/transactions')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Checkout Asset</h1>
                    <p className="text-gray-500">Assign an asset to a user</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    {/* Asset Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Asset <span className="text-red-500">*</span>
                        </label>
                        
                        {selectedAsset ? (
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{selectedAsset.name}</p>
                                    <p className="text-sm text-gray-500">{selectedAsset.asset_tag}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedAsset(null);
                                        setFormData(prev => ({ ...prev, asset_id: '' }));
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={assetSearch}
                                    onChange={(e) => setAssetSearch(e.target.value)}
                                    placeholder="Search available assets..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                
                                {assetSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {filteredAssets.length === 0 ? (
                                            <div className="p-4 text-gray-500 text-center">
                                                No available assets found
                                            </div>
                                        ) : (
                                            filteredAssets.map(asset => (
                                                <button
                                                    key={asset.id}
                                                    type="button"
                                                    onClick={() => handleAssetSelect(asset)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{asset.name}</p>
                                                            <p className="text-sm text-gray-500">{asset.asset_tag}</p>
                                                        </div>
                                                        <StatusBadge status={asset.status} type="asset" />
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign To <span className="text-red-500">*</span>
                        </label>
                        
                        {selectedUser ? (
                            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setFormData(prev => ({ ...prev, to_user_id: '' }));
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                
                                {userSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {filteredUsers.length === 0 ? (
                                            <div className="p-4 text-gray-500 text-center">
                                                No users found
                                            </div>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => handleUserSelect(user)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                                                >
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any notes about this checkout..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/transactions')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Processing...' : 'Checkout Asset'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
