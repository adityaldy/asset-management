import Spinner from './Spinner';

const PageLoader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <Spinner size="xl" />
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </div>
    );
};

export default PageLoader;
