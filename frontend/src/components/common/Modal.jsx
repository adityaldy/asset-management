import { Fragment } from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    showCloseButton = true 
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    return (
        <Fragment>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div 
                        className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                {title && (
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {title}
                                    </h3>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <HiX className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Content */}
                        <div className="px-6 py-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Modal;
