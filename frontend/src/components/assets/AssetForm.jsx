import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import api from '../../api/axios';
import { ASSET_STATUS_OPTIONS, CONDITION_OPTIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const AssetForm = ({ asset = null, onSubmit, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        asset_tag: '',
        serial_number: '',
        category_id: '',
        location_id: '',
        brand: '',
        model: '',
        specifications: '',
        purchase_date: '',
        purchase_price: '',
        vendor: '',
        warranty_expiry: '',
        status: 'available',
        condition: 'good',
        notes: ''
    });

    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [errors, setErrors] = useState({});

    // Fetch categories and locations
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [catRes, locRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/locations')
                ]);
                setCategories(catRes.data.data || []);
                setLocations(locRes.data.data || []);
            } catch (err) {
                toast.error('Failed to load categories and locations');
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    // Populate form if editing
    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                asset_tag: asset.asset_tag || '',
                serial_number: asset.serial_number || '',
                category_id: asset.category_id || '',
                location_id: asset.location_id || '',
                brand: asset.brand || '',
                model: asset.model || '',
                specifications: asset.specifications || '',
                purchase_date: asset.purchase_date ? asset.purchase_date.split('T')[0] : '',
                purchase_price: asset.purchase_price || '',
                vendor: asset.vendor || '',
                warranty_expiry: asset.warranty_expiry ? asset.warranty_expiry.split('T')[0] : '',
                status: asset.status || 'available',
                condition: asset.condition || 'good',
                notes: asset.notes || ''
            });
        }
    }, [asset]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Asset name is required';
        }

        if (!formData.asset_tag.trim()) {
            newErrors.asset_tag = 'Asset tag is required';
        }

        if (!formData.category_id) {
            newErrors.category_id = 'Category is required';
        }

        if (formData.purchase_price && isNaN(parseFloat(formData.purchase_price))) {
            newErrors.purchase_price = 'Purchase price must be a number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        // Prepare data
        const submitData = {
            ...formData,
            category_id: parseInt(formData.category_id) || null,
            location_id: parseInt(formData.location_id) || null,
            purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
            purchase_date: formData.purchase_date || null,
            warranty_expiry: formData.warranty_expiry || null
        };

        onSubmit(submitData);
    };

    if (loadingOptions) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asset Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., MacBook Pro 14"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Asset Tag */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Tag <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="asset_tag"
                        value={formData.asset_tag}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.asset_tag ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., AST-001"
                        disabled={!!asset}
                    />
                    {errors.asset_tag && <p className="text-red-500 text-sm mt-1">{errors.asset_tag}</p>}
                </div>

                {/* Serial Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Serial Number
                    </label>
                    <input
                        type="text"
                        name="serial_number"
                        value={formData.serial_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., SN123456789"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                    </label>
                    <select
                        name="location_id"
                        value={formData.location_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select Location</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>

                {/* Brand */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                    </label>
                    <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Apple"
                    />
                </div>

                {/* Model */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                    </label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., MacBook Pro 14 M3"
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {ASSET_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Condition */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                    </label>
                    <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {CONDITION_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Purchase Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Date
                    </label>
                    <input
                        type="date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Purchase Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Price
                    </label>
                    <input
                        type="number"
                        name="purchase_price"
                        value={formData.purchase_price}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.purchase_price ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., 25000000"
                        min="0"
                        step="1000"
                    />
                    {errors.purchase_price && <p className="text-red-500 text-sm mt-1">{errors.purchase_price}</p>}
                </div>

                {/* Vendor */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor
                    </label>
                    <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., PT Supplier IT"
                    />
                </div>

                {/* Warranty Expiry */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warranty Expiry
                    </label>
                    <input
                        type="date"
                        name="warranty_expiry"
                        value={formData.warranty_expiry}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Specifications - Full Width */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specifications
                    </label>
                    <textarea
                        name="specifications"
                        value={formData.specifications}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., RAM 16GB, SSD 512GB, M3 Pro Chip"
                    />
                </div>

                {/* Notes - Full Width */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional notes..."
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (asset ? 'Update Asset' : 'Create Asset')}
                </button>
            </div>
        </form>
    );
};

export default AssetForm;
