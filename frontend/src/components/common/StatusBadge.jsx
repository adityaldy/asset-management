import { 
    ASSET_STATUS_COLORS, 
    ASSET_STATUS_LABELS,
    CONDITION_STATUS_COLORS,
    CONDITION_STATUS_LABELS,
    USER_ROLE_COLORS,
    USER_ROLE_LABELS,
    ACTION_TYPE_COLORS,
    ACTION_TYPE_LABELS
} from '../../utils/constants';

const StatusBadge = ({ status, type = 'asset' }) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    let label = status;

    switch (type) {
        case 'asset':
            colorClass = ASSET_STATUS_COLORS[status] || colorClass;
            label = ASSET_STATUS_LABELS[status] || status;
            break;
        case 'condition':
            colorClass = CONDITION_STATUS_COLORS[status] || colorClass;
            label = CONDITION_STATUS_LABELS[status] || status;
            break;
        case 'role':
            colorClass = USER_ROLE_COLORS[status] || colorClass;
            label = USER_ROLE_LABELS[status] || status;
            break;
        case 'action':
            colorClass = ACTION_TYPE_COLORS[status] || colorClass;
            label = ACTION_TYPE_LABELS[status] || status;
            break;
        default:
            break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
