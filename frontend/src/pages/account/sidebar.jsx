import { useState } from "react";
import { 
    FaHome, 
    FaBuilding, 
    FaExclamationTriangle, 
    FaFileExport, 
    FaUsers, 
    FaSignOutAlt,
    FaChevronLeft,
    FaChevronRight,
    FaCog,
    FaBell,
    FaUserCircle,
    FaChartPie,
    FaMoneyBillWave
} from "react-icons/fa";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from "react-router-dom";

function SideBar() {
    const [logout, setLogout] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const openLogout = () => setLogout(true);
    const closeLogout = () => setLogout(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        { path: '/home', icon: FaHome, label: 'Home', color: 'from-blue-500 to-blue-600' },
        { path: '/departments', icon: FaBuilding, label: 'Departments', color: 'from-green-500 to-green-600' },
        { path: '/employees', icon: FaUsers, label: 'Employees', color: 'from-yellow-500 to-yellow-600' },
        { path: '/salaries', icon: FaMoneyBill1Wave, label: 'Salaries', color: 'from-purple-500 to-purple-600' },
        { path: '/report', icon: FaFileExport, label: 'Reports', color: 'from-red-500 to-red-600' },
    ];

    return (
        <>
            {/* Sidebar Container */}
            <div className={`h-screen fixed left-0 top-0 transition-all duration-500 ease-in-out z-50
                ${collapsed ? 'w-24' : 'w-72'} 
                bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
                shadow-2xl shadow-black/50 border-r border-white/10`}>
                
                {/* Toggle Button */}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 bg-gradient-to-r from-blue-600 to-blue-700 
                        hover:from-blue-700 hover:to-blue-800 text-white p-2 rounded-full 
                        shadow-lg shadow-blue-500/50 transition-all duration-300 
                        hover:scale-110 z-10 border-2 border-white/20"
                >
                    {collapsed ? <FaChevronRight className="text-sm" /> : <FaChevronLeft className="text-sm" />}
                </button>

                {/* Header Section with Logo */}
                <div className="relative pt-8 pb-6 px-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 
                                flex items-center justify-center shadow-lg shadow-blue-600/30 
                                transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <span className="text-2xl font-bold text-white">E</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full 
                                border-2 border-gray-900 animate-pulse"></div>
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-xl font-bold text-white whitespace-nowrap
                                    bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    EPMS
                                </h1>
                                <p className="text-xs text-gray-400 whitespace-nowrap">Enterprise Management</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="px-4 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 
                        hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                                flex items-center justify-center shadow-lg">
                                <FaUserCircle className="text-2xl text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 
                                rounded-full border-2 border-gray-800"></div>
                        </div>
                        {!collapsed && (
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white">Admin User</h3>
                                <p className="text-xs text-gray-400">admin@epms.com</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 
                    scrollbar-track-transparent h-[calc(100vh-280px)]">
                    <div className="space-y-2">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`group relative flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                                        gap-3 px-4 py-3 rounded-xl transition-all duration-300
                                        ${active 
                                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/30` 
                                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {active && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
                                            bg-white rounded-r-full"></div>
                                    )}
                                    
                                    {/* Icon */}
                                    <div className={`relative ${collapsed ? 'mr-0' : 'mr-3'}`}>
                                        <Icon className={`text-xl transition-all duration-300 
                                            ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                                            group-hover:scale-110 group-hover:rotate-3`} />
                                        {!collapsed && active && (
                                            <span className="absolute -right-1 -top-1 w-2 h-2 bg-white 
                                                rounded-full animate-ping"></span>
                                        )}
                                    </div>
                                    
                                    {/* Label */}
                                    {!collapsed && (
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}
                                    
                                    {/* Tooltip for collapsed mode */}
                                    {collapsed && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 
                                            text-white text-sm rounded-lg opacity-0 invisible 
                                            group-hover:opacity-100 group-hover:visible transition-all 
                                            duration-300 whitespace-nowrap shadow-xl border border-white/10">
                                            {item.label}
                                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 
                                                border-8 border-transparent border-r-gray-900"></div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Quick Stats */}
                    {!collapsed && (
                        <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-600/20 
                            to-purple-600/20 border border-white/10">
                            <div className="flex items-center gap-2 text-blue-400 mb-3">
                                <FaChartPie className="text-lg" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Quick Stats</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white">12</p>
                                    <p className="text-xs text-gray-400">Depts</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white">48</p>
                                    <p className="text-xs text-gray-400">Employees</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
                    <div className="space-y-2">
                        {/* Settings Icon */}
                        <button className={`w-full ${collapsed ? 'px-2' : 'px-4'} py-3 rounded-xl 
                            text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 
                            flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 group`}>
                            <FaCog className={`text-xl transition-transform duration-300 
                                group-hover:rotate-180 group-hover:text-blue-400`} />
                            {!collapsed && <span className="text-sm">Settings</span>}
                        </button>

                        {/* Notifications */}
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`w-full ${collapsed ? 'px-2' : 'px-4'} py-3 rounded-xl 
                                text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 
                                flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 relative group`}>
                            <FaBell className="text-xl" />
                            {!collapsed && <span className="text-sm">Notifications</span>}
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full 
                                animate-pulse"></span>
                            
                            {/* Notifications Dropdown */}
                            {showNotifications && !collapsed && (
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 
                                    rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                                    <div className="p-3 border-b border-white/10">
                                        <h4 className="text-sm font-semibold text-white">Notifications</h4>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-gray-400">No new notifications</p>
                                    </div>
                                </div>
                            )}
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={openLogout}
                            className={`w-full ${collapsed ? 'px-2' : 'px-4'} py-3 rounded-xl 
                                bg-gradient-to-r from-red-600/20 to-red-700/20 
                                hover:from-red-600 hover:to-red-700 text-red-400 hover:text-white 
                                transition-all duration-300 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                                gap-3 group border border-red-500/20 hover:border-red-500/50`}
                        >
                            <FaSignOutAlt className={`text-xl transition-transform duration-300 
                                group-hover:rotate-180`} />
                            {!collapsed && <span className="text-sm font-medium">Logout</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {logout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
                        onClick={closeLogout}
                    />
                    
                    {/* Modal */}
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 
                        rounded-2xl shadow-2xl shadow-red-500/20 z-10 max-w-md w-full 
                        transform transition-all duration-500 animate-slideUp border border-white/10">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 
                                    flex items-center justify-center">
                                    <FaExclamationTriangle className="text-3xl text-yellow-500 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Confirm Logout</h2>
                                    <p className="text-sm text-gray-400">You're about to end your session</p>
                                </div>
                            </div>
                            <button 
                                className="absolute top-4 right-4 text-gray-400 hover:text-white 
                                    transition-colors duration-200"
                                onClick={closeLogout}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-center text-gray-300 mb-6">
                                Are you sure you want to logout from your account?
                            </p>
                            
                            {/* Session Info */}
                            <div className="bg-white/5 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Active Session</span>
                                    <span className="text-green-400">● Online</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-400">Last Activity</span>
                                    <span className="text-white">Just now</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeLogout}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 
                                        text-white rounded-xl font-medium transition-all duration-300 
                                        hover:scale-105 border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 
                                        to-red-700 hover:from-red-700 hover:to-red-800 text-white 
                                        rounded-xl font-medium transition-all duration-300 
                                        hover:scale-105 shadow-lg shadow-red-600/30 
                                        flex items-center justify-center gap-2 group"
                                >
                                    <FaSignOutAlt className="group-hover:rotate-180 transition-transform duration-300" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #4B5563;
                    border-radius: 20px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #6B7280;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </>
    );
}

export default SideBar;
