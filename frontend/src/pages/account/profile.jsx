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
    FaUserTie
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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

            // If no ID in params, get current user
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
            
            // Fetch departments count
            const deptRes = await API.get('/departments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch employees count
            const empRes = await API.get('/employees/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch salaries count (if endpoint exists)
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
        // This would come from a real endpoint in production
        // For now, we'll create sample data
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
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 min-h-screen">
                <SideBar />
                <div className="ml-80 p-8 flex items-center justify-center h-screen">
                    <div className="text-white text-center">
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xl">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 min-h-screen">
            <SideBar />
            
            {/* Main Content */}
            <div className="ml-80 p-8">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <Link 
                        to="/home" 
                        className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-4"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
                    {/* Cover Photo */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        {/* Profile Picture */}
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 
                                    flex items-center justify-center shadow-2xl border-4 border-white
                                    transform transition-transform duration-300 group-hover:scale-105">
                                    <span className="text-5xl font-bold text-white">
                                        {getInitials()}
                                    </span>
                                </div>
                                <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 
                                    shadow-lg hover:bg-gray-100 transition-colors duration-300
                                    opacity-0 group-hover:opacity-100">
                                    <FaCamera className="text-blue-600" />
                                </button>
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <div className="absolute bottom-4 right-8">
                            <Link
                                to="/settings"
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 
                                    text-white px-4 py-2 rounded-lg flex items-center gap-2 
                                    transition-all duration-300 border border-white/30"
                            >
                                <FaEdit />
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-20 p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {user?.username || 'User Name'}
                                </h1>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <FaEnvelope className="text-blue-500" />
                                        {user?.email || 'email@example.com'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaClock className="text-green-500" />
                                        Last active: {getLastActive()}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="px-4 py-2 bg-green-100 text-green-800 
                                    rounded-full text-sm font-semibold flex items-center gap-2">
                                    <FaCheckCircle />
                                    Active Account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <FaBuilding className="text-2xl text-blue-600" />
                            </div>
                            <span className="text-3xl font-bold text-blue-600">{stats.departments}</span>
                        </div>
                        <h3 className="text-gray-600 font-medium">Departments</h3>
                        <p className="text-sm text-gray-400 mt-1">Total departments created</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-xl">
                                <FaUsers className="text-2xl text-green-600" />
                            </div>
                            <span className="text-3xl font-bold text-green-600">{stats.employees}</span>
                        </div>
                        <h3 className="text-gray-600 font-medium">Employees</h3>
                        <p className="text-sm text-gray-400 mt-1">Total employees managed</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <FaMoneyBillWave className="text-2xl text-purple-600" />
                            </div>
                            <span className="text-3xl font-bold text-purple-600">{stats.salaries}</span>
                        </div>
                        <h3 className="text-gray-600 font-medium">Salaries</h3>
                        <p className="text-sm text-gray-400 mt-1">Total salary records</p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-300
                                    ${activeTab === 'overview' 
                                        ? 'border-blue-600 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-300
                                    ${activeTab === 'activity' 
                                        ? 'border-blue-600 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Recent Activity
                            </button>
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-300
                                    ${activeTab === 'stats' 
                                        ? 'border-blue-600 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Statistics
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaUserCircle className="text-blue-500 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Full Name</p>
                                                <p className="font-medium text-gray-800">{user?.username || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaEnvelope className="text-green-500 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email Address</p>
                                                <p className="font-medium text-gray-800">{user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaIdCard className="text-purple-500 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">User ID</p>
                                                <p className="font-medium text-gray-800 font-mono text-sm">{user?._id || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaCalendarAlt className="text-yellow-500 text-xl" />
                                            <div>
                                                <p className="text-sm text-gray-500">Member Since</p>
                                                <p className="font-medium text-gray-800">{getJoinDate()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Statistics */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h3>
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-blue-800 font-medium">Department Management</span>
                                                <FaBuilding className="text-blue-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-blue-600">{stats.departments}</p>
                                            <p className="text-sm text-blue-500 mt-1">Total departments</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-green-800 font-medium">Employee Management</span>
                                                <FaUsers className="text-green-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-green-600">{stats.employees}</p>
                                            <p className="text-sm text-green-500 mt-1">Total employees</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-purple-800 font-medium">Salary Records</span>
                                                <FaMoneyBillWave className="text-purple-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-purple-600">{stats.salaries}</p>
                                            <p className="text-sm text-purple-500 mt-1">Total salary records</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                                ${activity.type === 'department' ? 'bg-blue-100 text-blue-600' :
                                                  activity.type === 'employee' ? 'bg-green-100 text-green-600' :
                                                  'bg-purple-100 text-purple-600'}`}>
                                                {activity.type === 'department' ? <FaBuilding /> :
                                                 activity.type === 'employee' ? <FaUsers /> :
                                                 <FaMoneyBillWave />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-800">
                                                    <span className="font-semibold">{activity.action}</span> {activity.name}
                                                </p>
                                                <p className="text-sm text-gray-500">{activity.time}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {activity.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Statistics</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="font-medium text-gray-700 mb-4">Department Distribution</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Active Departments</span>
                                                    <span className="font-semibold">{stats.departments}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="font-medium text-gray-700 mb-4">Employee Statistics</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Total Employees</span>
                                                    <span className="font-semibold">{stats.employees}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Average per Department</span>
                                                    <span className="font-semibold">
                                                        {stats.departments > 0 ? (stats.employees / stats.departments).toFixed(1) : 0}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-yellow-600 h-2 rounded-full" 
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
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/departments" 
                            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                            <FaBuilding className="text-2xl text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Departments</span>
                        </Link>
                        <Link to="/employees" 
                            className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                            <FaUsers className="text-2xl text-green-600" />
                            <span className="text-sm font-medium text-green-700">Employees</span>
                        </Link>
                        <Link to="/salaries" 
                            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                            <FaMoneyBillWave className="text-2xl text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">Salaries</span>
                        </Link>
                        <Link to="/settings" 
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <FaEdit className="text-2xl text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
