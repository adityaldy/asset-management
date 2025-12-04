import { Link } from 'react-router-dom';
import { HiHome } from 'react-icons/hi';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
                <p className="text-gray-600 mt-2">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <HiHome className="w-5 h-5" />
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
