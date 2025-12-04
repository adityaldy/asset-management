import { NavLink } from 'react-router-dom';
import { 
    HiHome, 
    HiDesktopComputer, 
    HiSwitchHorizontal,
    HiArrowRight,
    HiArrowLeft,
    HiTag,
    HiLocationMarker,
    HiUsers,
    HiDocumentReport,
    HiX
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const iconMap = {
    HiHome,
    HiDesktopComputer,
    HiSwitchHorizontal,
    HiArrowRight,
    HiArrowLeft,
    HiTag,
    HiLocationMarker,
    HiUsers,
    HiDocumentReport
};

const navItems = [
    { path: '/', label: 'Dashboard', icon: 'HiHome', roles: ['admin', 'staff', 'employee'] },
    { path: '/assets', label: 'Assets', icon: 'HiDesktopComputer', roles: ['admin', 'staff', 'employee'] },
    { path: '/transactions', label: 'Transactions', icon: 'HiSwitchHorizontal', roles: ['admin', 'staff', 'employee'] },
    { path: '/transactions/checkout', label: 'Check Out', icon: 'HiArrowRight', roles: ['admin', 'staff'] },
    { path: '/transactions/checkin', label: 'Check In', icon: 'HiArrowLeft', roles: ['admin', 'staff'] },
    { path: '/categories', label: 'Categories', icon: 'HiTag', roles: ['admin', 'staff'] },
    { path: '/locations', label: 'Locations', icon: 'HiLocationMarker', roles: ['admin', 'staff'] },
    { path: '/users', label: 'Users', icon: 'HiUsers', roles: ['admin'] },
    { path: '/reports', label: 'Reports', icon: 'HiDocumentReport', roles: ['admin', 'staff'] }
];

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const filteredNavItems = navItems.filter(item => 
        item.roles.includes(user?.role)
    );

    return (
        <>
            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 z-30 w-64 h-screen bg-gray-900 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
                    <div className="flex items-center gap-2">
                        <HiDesktopComputer className="w-8 h-8 text-blue-500" />
                        <span className="text-xl font-bold text-white">Asset MS</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-3">
                    <ul className="space-y-1">
                        {filteredNavItems.map((item) => {
                            const Icon = iconMap[item.icon];
                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }`
                                        }
                                    >
                                        {Icon && <Icon className="w-5 h-5" />}
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 text-center">
                        IT Asset Management v1.0
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
