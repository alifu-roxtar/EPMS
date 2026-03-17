import { useState, useEffect } from "react";
import { 
    FaHome, 
    FaBuilding, 
    FaExclamationTriangle, 
    FaFileExport, 
    FaUsers, 
    FaSignOutAlt,
    FaCog,
    FaUserCircle,
    FaChartPie,
    FaMoneyBillWave,
    FaBars,
    FaTimes
} from "react-icons/fa";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../components/api";

function SideBar() {
    const [logout, setLogout] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        departments: 0,
        employees: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);
    
    const openLogout = () => setLogout(true);
    const closeLogout = () => setLogout(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch user data and stats on component mount
    useEffect(() => {
        fetchUserData();
        fetchStats();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await API.get('/users/getme', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('uid');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Fetch departments count
            const deptRes = await API.get('/departments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch employees count
            const empRes = await API.get('/employees/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const employeesData = empRes.data.employees || empRes.data;
            
            setStats({
                departments: deptRes.data.length || 0,
                employees: employeesData.length || 0
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        navigate('/login');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
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

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.username) return 'U';
        return user.username.charAt(0).toUpperCase();
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (!user?.username) return 'User';
        return user.username.length > 15 
            ? `${user.username.substring(0, 15)}...` 
            : user.username;
    };

    // Get user email
    const getUserEmail = () => {
        if (!user?.email) return 'user@epms.com';
        return user.email;
    };

    return (
        <>
            {/* Mobile Menu Toggle - Only ONE button, always at top left */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 
                    text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 
                    hover:scale-105 ${mobileMenuOpen ? 'hidden' : 'block'}`}
                aria-label="Open menu"
            >
                <FaBars size={24} />
            </button>

            {/* Sidebar - Controlled by mobileMenuOpen state */}
            <div className={`
                fixed left-0 top-0 h-screen z-50
                transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
                w-72
                bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
                shadow-2xl shadow-black/50 border-r border-white/10
                overflow-y-auto
            `}>
                {/* Header Section with Logo and Close Button */}
                <div className="sticky top-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 z-10">
                    <div className="relative pt-8 pb-6 px-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 
                                        flex items-center justify-center shadow-lg shadow-blue-600/30">
                                        <span className="text-2xl font-bold text-white">E</span>
                                    </div>
                                </div>
                                <div className="overflow-hidden">
                                    <h1 className="text-xl font-bold text-white whitespace-nowrap
                                        bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        EPMS
                                    </h1>
                                    <p className="text-xs text-gray-400 whitespace-nowrap">Enterprise Management</p>
                                </div>
                            </div>

                            {/* Close button - Only visible on mobile when menu is open */}
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                aria-label="Close menu"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="px-4 py-4 border-b border-white/10">
                    {loading ? (
                        <div className="flex items-center gap-3 p-2">
                            <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                                <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => handleNavigation('/profile')}
                            className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/5 
                                hover:bg-white/10 transition-all duration-300 group text-left"
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
                                    flex items-center justify-center shadow-lg font-bold text-white">
                                    {getUserInitials()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 
                                    rounded-full border-2 border-gray-800"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white truncate">
                                    {getUserDisplayName()}
                                </h3>
                                <p className="text-xs text-gray-400 truncate">
                                    {getUserEmail()}
                                </p>
                            </div>
                        </button>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="px-3 py-6" aria-label="Main navigation">
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full group relative flex items-center justify-start 
                                        gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left
                                        ${active 
                                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    aria-current={active ? 'page' : undefined}
                                >
                                    {/* Active Indicator */}
                                    {active && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
                                            bg-white rounded-r-full"></div>
                                    )}
                                    
                                    {/* Icon */}
                                    <Icon className={`text-xl transition-all duration-300 
                                        ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                                        group-hover:scale-110 group-hover:rotate-3`} />
                                    
                                    {/* Label */}
                                    <span className="text-sm font-medium">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-600/20 
                        to-purple-600/20 border border-white/10">
                        <div className="flex items-center gap-2 text-blue-400 mb-3">
                            <FaChartPie className="text-lg" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Quick Stats</span>
                        </div>
                        
                        {statsLoading ? (
                            <div className="space-y-3">
                                <div className="h-8 bg-white/10 rounded animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <p className="text-2xl font-bold text-white">{stats.departments}</p>
                                    <p className="text-xs text-gray-400">Departments</p>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-lg">
                                    <p className="text-2xl font-bold text-white">{stats.employees}</p>
                                    <p className="text-xs text-gray-400">Employees</p>
                                </div>
                            </div>
                        )}
                        
                        {/* View All Links */}
                        <div className="mt-3 flex justify-between text-xs">
                            <button 
                                onClick={() => handleNavigation('/departments')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                View all →
                            </button>
                            <button 
                                onClick={() => handleNavigation('/employees')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                View all →
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Bottom Actions */}
                <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 via-gray-800 to-transparent p-4">
                    <div className="space-y-2">
                        {/* Settings */}
                        <button 
                            onClick={() => handleNavigation('/settings')}
                            className="w-full px-4 py-3 rounded-xl 
                                text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 
                                flex items-center justify-start gap-3 group"
                        >
                            <FaCog className={`text-xl transition-transform duration-300 
                                group-hover:rotate-180 group-hover:text-blue-400`} />
                            <span className="text-sm">Settings</span>
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={openLogout}
                            className="w-full px-4 py-3 rounded-xl 
                                bg-gradient-to-r from-red-600/20 to-red-700/20 
                                hover:from-red-600 hover:to-red-700 text-red-400 hover:text-white 
                                transition-all duration-300 flex items-center justify-start 
                                gap-3 group border border-red-500/20 hover:border-red-500/50"
                        >
                            <FaSignOutAlt className={`text-xl transition-transform duration-300 
                                group-hover:rotate-180`} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Logout Confirmation Modal */}
            {logout && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                                {user ? (
                                    <>Are you sure you want to logout <span className="font-semibold text-white">{user.username}</span>?</>
                                ) : (
                                    'Are you sure you want to logout from your account?'
                                )}
                            </p>
                            
                            {/* Session Info */}
                            <div className="bg-white/5 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Active Session</span>
                                    <span className="text-green-400">● Online</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-400">Account</span>
                                    <span className="text-white">{user?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-400">Departments</span>
                                    <span className="text-white">{stats.departments}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-400">Employees</span>
                                    <span className="text-white">{stats.employees}</span>
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

            {/* Animations */}
            <style jsx>{`
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
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </>
    );
}

export default SideBar;
