// Asset Status
export const ASSET_STATUS = {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    REPAIR: 'repair',
    RETIRED: 'retired',
    MISSING: 'missing'
};

// Asset Status Labels
export const ASSET_STATUS_LABELS = {
    [ASSET_STATUS.AVAILABLE]: 'Available',
    [ASSET_STATUS.ASSIGNED]: 'Assigned',
    [ASSET_STATUS.REPAIR]: 'In Repair',
    [ASSET_STATUS.RETIRED]: 'Retired',
    [ASSET_STATUS.MISSING]: 'Missing'
};

// Asset Status Colors (Tailwind classes)
export const ASSET_STATUS_COLORS = {
    [ASSET_STATUS.AVAILABLE]: 'bg-green-100 text-green-800',
    [ASSET_STATUS.ASSIGNED]: 'bg-blue-100 text-blue-800',
    [ASSET_STATUS.REPAIR]: 'bg-yellow-100 text-yellow-800',
    [ASSET_STATUS.RETIRED]: 'bg-gray-100 text-gray-800',
    [ASSET_STATUS.MISSING]: 'bg-red-100 text-red-800'
};

// Condition Status
export const CONDITION_STATUS = {
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    DAMAGED: 'damaged'
};

export const CONDITION_STATUS_LABELS = {
    [CONDITION_STATUS.GOOD]: 'Good',
    [CONDITION_STATUS.FAIR]: 'Fair',
    [CONDITION_STATUS.POOR]: 'Poor',
    [CONDITION_STATUS.DAMAGED]: 'Damaged'
};

export const CONDITION_STATUS_COLORS = {
    [CONDITION_STATUS.GOOD]: 'bg-green-100 text-green-800',
    [CONDITION_STATUS.FAIR]: 'bg-blue-100 text-blue-800',
    [CONDITION_STATUS.POOR]: 'bg-yellow-100 text-yellow-800',
    [CONDITION_STATUS.DAMAGED]: 'bg-red-100 text-red-800'
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    EMPLOYEE: 'employee'
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.STAFF]: 'Staff',
    [USER_ROLES.EMPLOYEE]: 'Employee'
};

export const USER_ROLE_COLORS = {
    [USER_ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
    [USER_ROLES.STAFF]: 'bg-blue-100 text-blue-800',
    [USER_ROLES.EMPLOYEE]: 'bg-gray-100 text-gray-800'
};

// Transaction Action Types
export const ACTION_TYPES = {
    CHECKOUT: 'checkout',
    CHECKIN: 'checkin',
    SEND_REPAIR: 'send_repair',
    COMPLETE_REPAIR: 'complete_repair',
    REPORT_LOST: 'report_lost',
    REPORT_FOUND: 'report_found',
    DISPOSE: 'dispose'
};

export const ACTION_TYPE_LABELS = {
    [ACTION_TYPES.CHECKOUT]: 'Check Out',
    [ACTION_TYPES.CHECKIN]: 'Check In',
    [ACTION_TYPES.SEND_REPAIR]: 'Sent to Repair',
    [ACTION_TYPES.COMPLETE_REPAIR]: 'Repair Completed',
    [ACTION_TYPES.REPORT_LOST]: 'Reported Lost',
    [ACTION_TYPES.REPORT_FOUND]: 'Found',
    [ACTION_TYPES.DISPOSE]: 'Disposed'
};

export const ACTION_TYPE_COLORS = {
    [ACTION_TYPES.CHECKOUT]: 'bg-blue-100 text-blue-800',
    [ACTION_TYPES.CHECKIN]: 'bg-green-100 text-green-800',
    [ACTION_TYPES.SEND_REPAIR]: 'bg-yellow-100 text-yellow-800',
    [ACTION_TYPES.COMPLETE_REPAIR]: 'bg-teal-100 text-teal-800',
    [ACTION_TYPES.REPORT_LOST]: 'bg-red-100 text-red-800',
    [ACTION_TYPES.REPORT_FOUND]: 'bg-purple-100 text-purple-800',
    [ACTION_TYPES.DISPOSE]: 'bg-gray-100 text-gray-800'
};

// Action Labels (alias for ACTION_TYPE_LABELS)
export const ACTION_LABELS = ACTION_TYPE_LABELS;

// Asset Status Options for forms
export const ASSET_STATUS_OPTIONS = [
    { value: ASSET_STATUS.AVAILABLE, label: 'Available' },
    { value: ASSET_STATUS.ASSIGNED, label: 'Assigned' },
    { value: ASSET_STATUS.REPAIR, label: 'In Repair' },
    { value: ASSET_STATUS.RETIRED, label: 'Retired' },
    { value: ASSET_STATUS.MISSING, label: 'Missing' }
];

// Condition Options for forms
export const CONDITION_OPTIONS = [
    { value: CONDITION_STATUS.GOOD, label: 'Good' },
    { value: CONDITION_STATUS.FAIR, label: 'Fair' },
    { value: CONDITION_STATUS.POOR, label: 'Poor' },
    { value: CONDITION_STATUS.DAMAGED, label: 'Damaged' }
];

// Role Options for forms
export const ROLE_OPTIONS = [
    { value: USER_ROLES.ADMIN, label: 'Administrator' },
    { value: USER_ROLES.STAFF, label: 'Staff' },
    { value: USER_ROLES.EMPLOYEE, label: 'Employee' }
];

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [10, 25, 50, 100]
};

// Navigation menu items
export const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'HiHome', roles: ['admin', 'staff', 'employee'] },
    { path: '/assets', label: 'Assets', icon: 'HiDesktopComputer', roles: ['admin', 'staff', 'employee'] },
    { path: '/transactions', label: 'Transactions', icon: 'HiSwitchHorizontal', roles: ['admin', 'staff', 'employee'] },
    { path: '/checkout', label: 'Check Out', icon: 'HiArrowRight', roles: ['admin', 'staff'] },
    { path: '/checkin', label: 'Check In', icon: 'HiArrowLeft', roles: ['admin', 'staff'] },
    { path: '/categories', label: 'Categories', icon: 'HiTag', roles: ['admin', 'staff'] },
    { path: '/locations', label: 'Locations', icon: 'HiLocationMarker', roles: ['admin', 'staff'] },
    { path: '/users', label: 'Users', icon: 'HiUsers', roles: ['admin'] },
    { path: '/reports', label: 'Reports', icon: 'HiDocumentReport', roles: ['admin', 'staff'] }
];
