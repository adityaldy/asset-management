import { HiOutlineInbox } from 'react-icons/hi';

const EmptyState = ({ 
    title = 'No data found',
    description = 'There are no items to display.',
    icon: Icon = HiOutlineInbox,
    action = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <Icon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 text-center max-w-sm mb-4">{description}</p>
            {action && action}
        </div>
    );
};

export default EmptyState;
