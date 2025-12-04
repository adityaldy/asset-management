import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import { HiEye, HiPencil, HiTrash } from 'react-icons/hi';
import { 
    HiChevronUp, 
    HiChevronDown,
    HiChevronLeft,
    HiChevronRight,
    HiAdjustments
} from 'react-icons/hi';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi2';
import StatusBadge from '../common/StatusBadge';
import TableSkeleton from '../common/TableSkeleton';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AssetDataTable = ({ 
    assets = [], 
    loading = false, 
    onDelete,
    // Server-side pagination props
    serverPagination = null, // { page, limit, totalItems, totalPages, onPageChange, onLimitChange }
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canEdit = ['admin', 'staff'].includes(user?.role);
    const canDelete = user?.role === 'admin';

    const [deleteModal, setDeleteModal] = useState({ open: false, asset: null });
    const [deleting, setDeleting] = useState(false);
    const [sorting, setSorting] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    // Column definitions
    const columns = useMemo(() => [
        {
            accessorKey: 'asset_tag',
            header: 'Asset Tag',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-gray-900">{row.original.asset_tag}</p>
                    <p className="text-xs text-gray-500">{row.original.serial_number}</p>
                </div>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ getValue }) => (
                <span className="font-medium text-gray-900">{getValue()}</span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'category.name',
            header: 'Category',
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {row.original.category?.name || '-'}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'location.name',
            header: 'Location',
            cell: ({ row }) => row.original.location?.name || '-',
            enableSorting: true,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ getValue }) => <StatusBadge status={getValue()} type="asset" />,
            enableSorting: true,
        },
        {
            accessorKey: 'currentHolder.name',
            header: 'Current Holder',
            cell: ({ row }) => row.original.currentHolder?.name || '-',
            enableSorting: true,
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ getValue }) => formatCurrency(getValue()),
            enableSorting: true,
        },
        {
            accessorKey: 'purchase_date',
            header: 'Purchase Date',
            cell: ({ getValue }) => formatDate(getValue()),
            enableSorting: true,
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => navigate(`/assets/${row.original.uuid}`)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                    >
                        <HiEye className="w-4 h-4" />
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => navigate(`/assets/${row.original.uuid}/edit`)}
                            className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <HiPencil className="w-4 h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDeleteClick(row.original)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <HiTrash className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            enableSorting: false,
        },
    ], [canEdit, canDelete, navigate]);

    // Table instance
    const table = useReactTable({
        data: assets,
        columns,
        state: {
            sorting,
            columnVisibility,
            ...(serverPagination ? {} : {}),
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // Use client-side pagination if no server pagination provided
        ...(serverPagination ? {
            manualPagination: true,
            pageCount: serverPagination.totalPages,
        } : {
            getPaginationRowModel: getPaginationRowModel(),
        }),
    });

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

    // Pagination info
    const paginationInfo = serverPagination || {
        page: table.getState().pagination.pageIndex + 1,
        limit: table.getState().pagination.pageSize,
        totalItems: assets.length,
        totalPages: table.getPageCount(),
        onPageChange: (newPage) => table.setPageIndex(newPage - 1),
        onLimitChange: (newLimit) => table.setPageSize(newLimit),
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Table Toolbar */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1} to{' '}
                        {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.totalItems)} of{' '}
                        {paginationInfo.totalItems} assets
                    </div>
                    
                    {/* Column Visibility Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnMenu(!showColumnMenu)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <HiAdjustments className="w-4 h-4" />
                            Columns
                        </button>
                        
                        {showColumnMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="p-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase px-2 py-1">
                                        Toggle columns
                                    </p>
                                    {table.getAllLeafColumns().filter(col => col.id !== 'actions').map((column) => (
                                        <label
                                            key={column.id}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={column.getIsVisible()}
                                                onChange={column.getToggleVisibilityHandler()}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {typeof column.columnDef.header === 'string' 
                                                    ? column.columnDef.header 
                                                    : column.id}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`flex items-center gap-1 ${
                                                        header.column.getCanSort() 
                                                            ? 'cursor-pointer select-none hover:text-gray-700' 
                                                            : ''
                                                    }`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {header.column.getCanSort() && (
                                                        <span className="ml-1">
                                                            {{
                                                                asc: <HiChevronUp className="w-4 h-4" />,
                                                                desc: <HiChevronDown className="w-4 h-4" />,
                                                            }[header.column.getIsSorted()] ?? (
                                                                <HiChevronDown className="w-4 h-4 text-gray-300" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row) => (
                                <tr 
                                    key={row.id} 
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 text-sm text-gray-600">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={paginationInfo.limit}
                            onChange={(e) => {
                                const newLimit = Number(e.target.value);
                                paginationInfo.onLimitChange(newLimit);
                            }}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {[5, 10, 20, 30, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => paginationInfo.onPageChange(1)}
                            disabled={paginationInfo.page <= 1}
                            className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            title="First page"
                        >
                            <HiChevronDoubleLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => paginationInfo.onPageChange(paginationInfo.page - 1)}
                            disabled={paginationInfo.page <= 1}
                            className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            title="Previous page"
                        >
                            <HiChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {generatePageNumbers(paginationInfo.page, paginationInfo.totalPages).map((pageNum, idx) => (
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginationInfo.onPageChange(pageNum)}
                                        className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                                            paginationInfo.page === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => paginationInfo.onPageChange(paginationInfo.page + 1)}
                            disabled={paginationInfo.page >= paginationInfo.totalPages}
                            className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            title="Next page"
                        >
                            <HiChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => paginationInfo.onPageChange(paginationInfo.totalPages)}
                            disabled={paginationInfo.page >= paginationInfo.totalPages}
                            className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            title="Last page"
                        >
                            <HiChevronDoubleRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Page Info */}
                    <div className="text-sm text-gray-600">
                        Page {paginationInfo.page} of {paginationInfo.totalPages}
                    </div>
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

// Helper function to generate page numbers with ellipsis
const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const showPages = 5; // Number of page buttons to show
    
    if (totalPages <= showPages + 2) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Always show first page
        pages.push(1);
        
        if (currentPage > 3) {
            pages.push('...');
        }
        
        // Show pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        if (currentPage < totalPages - 2) {
            pages.push('...');
        }
        
        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }
    }
    
    return pages;
};

export default AssetDataTable;
