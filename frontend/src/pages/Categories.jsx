import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TableSkeleton from '../components/common/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const Categories = () => {
    const { user } = useAuth();
    const canEdit = ['admin', 'staff'].includes(user?.role);
    const canDelete = user?.role === 'admin';

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search & Pagination
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);
    
    // Delete states
    const [deleteModal, setDeleteModal] = useState({ open: false, category: null });
    const [deleting, setDeleting] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', limit);
            if (debouncedSearch) params.append('search', debouncedSearch);
            
            const res = await api.get(`/categories?${params.toString()}`);
            setCategories(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
            setTotalItems(res.data.pagination?.total || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [currentPage, debouncedSearch]);

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSaving(true);
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData);
                toast.success('Category updated successfully');
            } else {
                await api.post('/categories', formData);
                toast.success('Category created successfully');
            }
            setModalOpen(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;
        
        setDeleting(true);
        try {
            await api.delete(`/categories/${deleteModal.category.id}`);
            toast.success('Category deleted successfully');
            setDeleteModal({ open: false, category: null });
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete category');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500">Manage asset categories</p>
                </div>
                {canEdit && (
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <HiPlus className="w-4 h-4" />
                        Add Category
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="relative max-w-md">
                    <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Error */}
            {error && <ErrorState title="Error" message={error} onRetry={fetchCategories} />}

            {/* Loading */}
            {loading && <TableSkeleton rows={5} columns={4} />}

            {/* Table */}
            {!loading && !error && (
                <>
                    {categories.length === 0 ? (
                        <EmptyState
                            title="No categories found"
                            description="Start by adding a new category."
                            action={canEdit && (
                                <button
                                    onClick={openAddModal}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <HiPlus className="w-4 h-4" />
                                    Add Category
                                </button>
                            )}
                        />
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assets Count
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">
                                                    {category.description || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">
                                                    {category._count?.assets || category.assets?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => openEditModal(category)}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <HiPencil className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, category })}
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
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={totalItems}
                                itemsPerPage={limit}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Laptop"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Category description..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, category: null })}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={deleting}
            />
        </div>
    );
};

export default Categories;
