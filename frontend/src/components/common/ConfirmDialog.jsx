import { HiExclamation, HiTrash, HiCheck } from 'react-icons/hi';
import Modal from './Modal';

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // danger, warning, success
    isLoading = false
}) => {
    const variantConfig = {
        danger: {
            icon: HiTrash,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: HiExclamation,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
        },
        success: {
            icon: HiCheck,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            buttonBg: 'bg-green-600 hover:bg-green-700'
        }
    };

    const config = variantConfig[variant] || variantConfig.danger;
    const Icon = config.icon;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="text-center">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg} mb-4`}>
                    <Icon className={`h-6 w-6 ${config.iconColor}`} />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {title}
                </h3>
                
                <p className="text-sm text-gray-500 mb-6">
                    {message}
                </p>
                
                <div className="flex gap-3 justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${config.buttonBg}`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
