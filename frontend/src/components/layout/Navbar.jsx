import { useState, useRef, useEffect } from 'react';
import { HiMenu, HiUserCircle, HiLogout, HiUser } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLE_LABELS } from '../../utils/constants';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <HiMenu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
                        IT Asset Management System
                    </h1>
                </div>

                {/* Right side - User menu */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                            <p className="text-xs text-gray-500">
                                {USER_ROLE_LABELS[user?.role] || user?.role}
                            </p>
                        </div>
                        <HiUserCircle className="w-10 h-10 text-gray-400" />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <div className="px-4 py-2 border-b border-gray-200 sm:hidden">
                                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            
                            <button
                                onClick={() => setDropdownOpen(false)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <HiUser className="w-4 h-4" />
                                Profile
                            </button>
                            
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <HiLogout className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
