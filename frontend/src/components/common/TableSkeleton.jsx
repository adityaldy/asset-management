const TableSkeleton = ({ rows = 5, columns = 5 }) => {
    return (
        <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-3 border-b">
                    <div className="flex gap-4">
                        {Array.from({ length: columns }).map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
                        ))}
                    </div>
                </div>
                
                {/* Rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="px-6 py-4 border-b last:border-b-0">
                        <div className="flex gap-4">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <div 
                                    key={colIndex} 
                                    className="h-4 bg-gray-200 rounded flex-1"
                                    style={{ width: `${Math.random() * 40 + 60}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;
