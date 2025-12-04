import { HiExclamationCircle } from 'react-icons/hi';

const ErrorState = ({ 
    title = 'Error',
    message = 'Something went wrong. Please try again.',
    onRetry = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <HiExclamationCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 text-center max-w-sm mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorState;
