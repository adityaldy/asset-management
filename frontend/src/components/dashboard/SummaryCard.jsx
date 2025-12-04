const SummaryCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500',
        purple: 'bg-purple-500',
        teal: 'bg-teal-500'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-10`}>
                        <Icon className={`w-8 h-8 ${colorClasses[color].replace('bg-', 'text-')}`} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryCard;
