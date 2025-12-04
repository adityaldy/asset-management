import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import api from '../api/axios';
import AssetForm from '../components/assets/AssetForm';
import toast from 'react-hot-toast';

const AddAsset = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/assets', data);
            toast.success('Asset created successfully');
            navigate('/assets');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/assets')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Asset</h1>
                    <p className="text-gray-500">Create a new asset in the inventory</p>
                </div>
            </div>

            {/* Form */}
            <AssetForm
                onSubmit={handleSubmit}
                onCancel={() => navigate('/assets')}
                loading={loading}
            />
        </div>
    );
};

export default AddAsset;
