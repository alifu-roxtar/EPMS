import { useState, useEffect } from "react";
import SideBar from "../account/sidebar";
import API from "../../components/api";
import { 
    FaUserCircle, 
    FaEnvelope, 
    FaCalendarAlt,
    FaIdCard,
    FaBuilding,
    FaUsers,
    FaMoneyBillWave,
    FaEdit,
    FaCamera,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaArrowLeft,
    FaChartPie,
    FaBriefcase,
    FaMapMarkerAlt,
    FaPhone,
    FaVenusMars,
    FaUserTie,
    FaBars,
    FaTimes,
    FaShieldAlt,
    FaHistory,
    FaChartLine
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        departments: 0,
        employees: 0,
        salaries: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchUserData();
        fetchUserStats();
        fetchRecentActivity();
    }, [id]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const userId = id || localStorage.getItem('uid');
            
            const res = await API.get(`/users/getme`, {
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

    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const deptRes = await API.get('/departments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const empRes = await API.get('/employees/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            let salariesCount = 0;
            try {
                const salRes = await API.get('/salaries/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                salariesCount = (salRes.data.salaries || salRes.data).length;
            } catch (error) {
                console.log("Salaries endpoint not available");
            }

            const employeesData = empRes.data.employees || empRes.data;
            
            setStats({
                departments: deptRes.data.length || 0,
                employees: employeesData.length || 0,
                salaries: salariesCount
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchRecentActivity = async () => {
        setRecentActivity([
            { type: 'department', action: 'Created', name: 'Software Development', time: '2 hours ago' },
            { type: 'employee', action: 'Added', name: 'John Doe', time: '5 hours ago' },
            { type: 'salary', action: 'Processed', name: 'March 2026', time: '1 day ago' },
            { type: 'department', action: 'Updated', name: 'Human Resources', time: '2 days ago' },
            { type: 'employee', action: 'Added', name: 'Jane Smith', time: '3 days ago' },
        ]);
    };

    const getInitials = () => {
        if (!user?.username) return 'U';
        return user.username
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getJoinDate = () => {
        if (!user?.createdAt) return 'N/A';
        return new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getLastActive = () => {
        if (!user?.updatedAt) return 'N/A';
        const lastActive = new Date(user.updatedAt);
        const now = new Date();
        const diffHours = Math.floor((now - lastActive) / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${Math.floor(diffHours / 24)} days ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
                <SideBar />
                <div className="lg:ml-80 p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
                    <div className="text-white text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-base md:text-xl">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
                <SideBar />
            </div>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`${mobileMenuOpen ? 'blur-sm' : ''} lg:blur-none transition-all duration-300 lg:ml-80 p-4 sm:p-6 md:p-8`}>
                {/* Header with Back Button */}
                <div className="mb-4 md:mb-6 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={() => navigate('/home')}
                            className="lg:hidden text-blue-200 hover:text-white transition-colors p-2"
                        >
                            <FaArrowLeft size={20} />
                        </button>
                        <Link 
                            to="/home" 
                            className="hidden lg:inline-flex items-center text-blue-200 hover:text-white transition-colors group"
                        >
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-2 group-hover:bg-blue-500/30 transition-colors">
                                <FaArrowLeft className="text-sm" />
                            </div>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden mb-6 md:mb-8 border border-white/20">
                    {/* Cover Photo */}
                    <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        {/* Profile Picture */}
                        <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
                            <div className="relative group">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 
                                    flex items-center justify-center shadow-2xl border-2 md:border-4 border-white
                                    transform transition-transform duration-300 group-hover:scale-105">
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                                        {getInitials()}
                                    </span>
                                </div>
                                <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white rounded-full p-1 md:p-2 
                                    shadow-lg hover:bg-gray-100 transition-colors duration-300
                                    opacity-0 group-hover:opacity-100">
                                    <FaCamera className="text-xs md:text-sm text-blue-600" />
                                </button>
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-4 md:right-8">
                            <Link
                                to="/settings"
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 
                                    text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 
                                    transition-all duration-300 border border-white/30 text-xs sm:text-sm"
                            >
                                <FaEdit className="text-xs sm:text-sm" />
                                <span className="hidden xs:inline">Edit Profile</span>
                            </Link>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-14 sm:pt-16 md:pt-20 p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="w-full md:w-auto">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                                    {user?.username || 'User Name'}
                                </h1>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-blue-200 text-xs sm:text-sm md:text-base">
                                    <span className="flex items-center gap-1">
                                        <FaEnvelope className="text-blue-300 flex-shrink-0" />
                                        <span className="truncate max-w-[200px] sm:max-w-none">{user?.email || 'email@example.com'}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaClock className="text-green-300 flex-shrink-0" />
                                        Last active: {getLastActive()}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="px-3 py-1 sm:px-4 sm:py-2 bg-green-500/20 text-green-300 
                                    rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 border border-green-500/30">
                                    <FaCheckCircle className="text-xs sm:text-sm" />
                                    Active Account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className="bg-blue-500/20 p-2 md:p-3 rounded-xl">
                                <FaBuilding className="text-lg md:text-2xl text-blue-300" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-white">{stats.departments}</span>
                        </div>
                        <h3 className="text-sm md:text-base text-gray-300 font-medium">Departments</h3>
                        <p className="text-xs md:text-sm text-blue-200 mt-1">Total departments created</p>
                    </div>

                    <div className="backdrop-blur-xl bg-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className="bg-green-500/20 p-2 md:p-3 rounded-xl">
                                <FaUsers className="text-lg md:text-2xl text-green-300" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-white">{stats.employees}</span>
                        </div>
                        <h3 className="text-sm md:text-base text-gray-300 font-medium">Employees</h3>
                        <p className="text-xs md:text-sm text-blue-200 mt-1">Total employees managed</p>
                    </div>

                    <div className="backdrop-blur-xl bg-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className="bg-purple-500/20 p-2 md:p-3 rounded-xl">
                                <FaMoneyBillWave className="text-lg md:text-2xl text-purple-300" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-white">{stats.salaries}</span>
                        </div>
                        <h3 className="text-sm md:text-base text-gray-300 font-medium">Salaries</h3>
                        <p className="text-xs md:text-sm text-blue-200 mt-1">Total salary records</p>
                    </div>
                </div>

                {/* Mobile Tab Navigation */}
                <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                            activeTab === 'overview' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                            activeTab === 'activity' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                        }`}
                    >
                        Activity
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                            activeTab === 'stats' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                        }`}
                    >
                        Statistics
                    </button>
                </div>

                {/* Main Content Area - Desktop Grid */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Personal Information - Left Column */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FaUserCircle className="text-blue-300" />
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <FaUserCircle className="text-blue-400 text-xl flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-blue-200">Full Name</p>
                                    <p className="font-medium text-white truncate">{user?.username || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <FaEnvelope className="text-green-400 text-xl flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-blue-200">Email Address</p>
                                    <p className="font-medium text-white truncate">{user?.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <FaIdCard className="text-purple-400 text-xl flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-blue-200">User ID</p>
                                    <p className="font-medium text-white font-mono text-sm truncate">{user?._id || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <FaCalendarAlt className="text-yellow-400 text-xl flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-blue-200">Member Since</p>
                                    <p className="font-medium text-white truncate">{getJoinDate()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Statistics - Middle Column */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FaChartLine className="text-green-300" />
                            Account Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-600/20 to-blue-600/10 p-4 rounded-xl border border-blue-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-blue-200 font-medium">Department Management</span>
                                    <FaBuilding className="text-blue-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.departments}</p>
                                <p className="text-xs text-blue-200 mt-1">Total departments</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-600/20 to-green-600/10 p-4 rounded-xl border border-green-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-green-200 font-medium">Employee Management</span>
                                    <FaUsers className="text-green-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.employees}</p>
                                <p className="text-xs text-green-200 mt-1">Total employees</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-600/20 to-purple-600/10 p-4 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-purple-200 font-medium">Salary Records</span>
                                    <FaMoneyBillWave className="text-purple-400" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.salaries}</p>
                                <p className="text-xs text-purple-200 mt-1">Total salary records</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity - Right Column */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FaHistory className="text-purple-300" />
                            Recent Activity
                        </h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                        ${activity.type === 'department' ? 'bg-blue-500/20 text-blue-300' :
                                          activity.type === 'employee' ? 'bg-green-500/20 text-green-300' :
                                          'bg-purple-500/20 text-purple-300'}`}>
                                        {activity.type === 'department' ? <FaBuilding /> :
                                         activity.type === 'employee' ? <FaUsers /> :
                                         <FaMoneyBillWave />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white">
                                            <span className="font-semibold">{activity.action}</span> {activity.name}
                                        </p>
                                        <p className="text-xs text-blue-200 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Tab Content */}
                <div className="lg:hidden space-y-6 mb-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 border border-white/20">
                            <h3 className="text-base font-semibold text-white mb-3">Personal Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                    <FaUserCircle className="text-blue-400 text-lg flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-blue-200">Full Name</p>
                                        <p className="text-sm font-medium text-white truncate">{user?.username || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                    <FaEnvelope className="text-green-400 text-lg flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-blue-200">Email</p>
                                        <p className="text-sm font-medium text-white truncate">{user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                    <FaIdCard className="text-purple-400 text-lg flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-blue-200">User ID</p>
                                        <p className="text-sm font-medium text-white font-mono truncate">
                                            {user?._id ? `${user._id.substring(0, 10)}...` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                    <FaCalendarAlt className="text-yellow-400 text-lg flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-blue-200">Member Since</p>
                                        <p className="text-sm font-medium text-white truncate">{getJoinDate()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 border border-white/20">
                            <h3 className="text-base font-semibold text-white mb-3">Recent Activity</h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                            ${activity.type === 'department' ? 'bg-blue-500/20 text-blue-300' :
                                              activity.type === 'employee' ? 'bg-green-500/20 text-green-300' :
                                              'bg-purple-500/20 text-purple-300'}`}>
                                            {activity.type === 'department' ? <FaBuilding /> :
                                             activity.type === 'employee' ? <FaUsers /> :
                                             <FaMoneyBillWave />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white">
                                                <span className="font-semibold">{activity.action}</span> {activity.name}
                                            </p>
                                            <p className="text-xs text-blue-200 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'stats' && (
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 border border-white/20">
                            <h3 className="text-base font-semibold text-white mb-3">Usage Statistics</h3>
                            <div className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <h4 className="text-sm font-medium text-blue-200 mb-3">Department Distribution</h4>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-300">Active Departments</span>
                                            <span className="font-semibold text-white">{stats.departments}</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <h4 className="text-sm font-medium text-blue-200 mb-3">Employee Statistics</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-300">Total Employees</span>
                                                <span className="font-semibold text-white">{stats.employees}</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-300">Avg per Department</span>
                                                <span className="font-semibold text-white">
                                                    {stats.departments > 0 ? (stats.employees / stats.departments).toFixed(1) : 0}
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div className="bg-yellow-500 h-2 rounded-full" 
                                                    style={{ width: `${stats.departments > 0 ? (stats.employees / stats.departments) * 10 : 0}%` }}>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions - Responsive Grid */}
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-blue-300" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        <Link to="/departments" 
                            className="flex flex-col items-center gap-1 md:gap-2 p-3 md:p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all duration-300 border border-blue-500/30">
                            <FaBuilding className="text-lg md:text-2xl text-blue-300" />
                            <span className="text-xs md:text-sm font-medium text-blue-200">Departments</span>
                        </Link>
                        <Link to="/employees" 
                            className="flex flex-col items-center gap-1 md:gap-2 p-3 md:p-4 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all duration-300 border border-green-500/30">
                            <FaUsers className="text-lg md:text-2xl text-green-300" />
                            <span className="text-xs md:text-sm font-medium text-green-200">Employees</span>
                        </Link>
                        <Link to="/salaries" 
                            className="flex flex-col items-center gap-1 md:gap-2 p-3 md:p-4 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all duration-300 border border-purple-500/30">
                            <FaMoneyBillWave className="text-lg md:text-2xl text-purple-300" />
                            <span className="text-xs md:text-sm font-medium text-purple-200">Salaries</span>
                        </Link>
                        <Link to="/settings" 
                            className="flex flex-col items-center gap-1 md:gap-2 p-3 md:p-4 bg-gray-500/10 hover:bg-gray-500/20 rounded-xl transition-all duration-300 border border-gray-500/30">
                            <FaEdit className="text-lg md:text-2xl text-gray-300" />
                            <span className="text-xs md:text-sm font-medium text-gray-200">Settings</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

export default Profile;
