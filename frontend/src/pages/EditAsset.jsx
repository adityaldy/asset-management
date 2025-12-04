import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import api from '../api/axios';
import AssetForm from '../components/assets/AssetForm';
import PageLoader from '../components/common/PageLoader';
import ErrorState from '../components/common/ErrorState';
import toast from 'react-hot-toast';

const EditAsset = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const res = await api.get(`/assets/${uuid}`);
                setAsset(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load asset');
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, [uuid]);

    const handleSubmit = async (data) => {
        setSaving(true);
        try {
            await api.put(`/assets/${uuid}`, data);
            toast.success('Asset updated successfully');
            navigate(`/assets/${uuid}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update asset');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="p-6">
                <ErrorState
                    title="Failed to load asset"
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(`/assets/${uuid}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Asset</h1>
                    <p className="text-gray-500">{asset?.name} - {asset?.asset_tag}</p>
                </div>
            </div>

            {/* Form */}
            <AssetForm
                asset={asset}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/assets/${uuid}`)}
                loading={saving}
            />
        </div>
    );
};

export default EditAsset;
