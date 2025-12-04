import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiSearch } from 'react-icons/hi';
import api from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';
import { CONDITION_OPTIONS } from '../utils/constants';
import toast from 'react-hot-toast';

const Checkin = () => {
    const navigate = useNavigate();
    
    const [assets, setAssets] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        asset_id: '',
        condition: 'good',
        notes: ''
    });
    
    const [assetSearch, setAssetSearch] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(null);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                // Fetch checked out assets
                const res = await api.get('/assets?status=checked_out&limit=100');
                setAssets(res.data.data || []);
            } catch (err) {
                toast.error('Failed to load assets');
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchAssets();
    }, []);

    const filteredAssets = assets.filter(asset => 
        asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        asset.asset_tag.toLowerCase().includes(assetSearch.toLowerCase()) ||
        (asset.currentHolder?.name || '').toLowerCase().includes(assetSearch.toLowerCase())
    );

    const handleAssetSelect = (asset) => {
        setSelectedAsset(asset);
        setFormData(prev => ({ ...prev, asset_id: asset.id }));
        setAssetSearch('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.asset_id) {
            toast.error('Please select an asset');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/transactions/checkin', {
                asset_id: formData.asset_id,
                condition: formData.condition,
                notes: formData.notes
            });
            toast.success('Asset checked in successfully');
            navigate('/transactions');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to check in asset');
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
                    <h1 className="text-2xl font-bold text-gray-900">Check In Asset</h1>
                    <p className="text-gray-500">Return an asset from a user</p>
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
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
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
                                {selectedAsset.currentHolder && (
                                    <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-green-200">
                                        <span className="font-medium">Currently held by: </span>
                                        {selectedAsset.currentHolder.name}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={assetSearch}
                                    onChange={(e) => setAssetSearch(e.target.value)}
                                    placeholder="Search checked out assets..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                
                                {assetSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {filteredAssets.length === 0 ? (
                                            <div className="p-4 text-gray-500 text-center">
                                                No checked out assets found
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
                                                            {asset.currentHolder && (
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    Held by: {asset.currentHolder.name}
                                                                </p>
                                                            )}
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
                        
                        {assets.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                No assets are currently checked out.
                            </p>
                        )}
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asset Condition
                        </label>
                        <select
                            value={formData.condition}
                            onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {CONDITION_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            Select the current condition of the asset upon return.
                        </p>
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
                            placeholder="Add any notes about this check-in (e.g., damages, missing parts)..."
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
                            disabled={submitting || !formData.asset_id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Processing...' : 'Check In Asset'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkin;
