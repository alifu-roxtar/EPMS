import { useState, useEffect } from "react";
import SideBar from "../account/sidebar";
import API from "../../components/api";
import { 
    FaUserCircle, 
    FaEnvelope, 
    FaLock, 
    FaSave,
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaTimesCircle,
    FaBars,
    FaTimes,
    FaUser,
    FaIdCard,
    FaCalendarAlt,
    FaClock,
    FaShieldAlt
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    
    // Form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    // Fetch user data on component mount
    useEffect(() => {
        fetchUserData();
    }, []);

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
            setFormData(prev => ({
                ...prev,
                username: res.data.username || '',
                email: res.data.email || ''
            }));
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setSuccessMessage('');
        setErrorMessage('');
    };

    const validateForm = () => {
        if (formData.newPassword && formData.newPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters long");
            return false;
        }
        
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setErrorMessage("New passwords do not match");
            return false;
        }

        if (formData.newPassword && !formData.currentPassword) {
            setErrorMessage("Current password is required to change password");
            return false;
        }

        return true;
    };

    const handleSaveProfile = async () => {
        if (!validateForm()) return;

        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('uid');

            const updateData = {
                username: formData.username,
                email: formData.email
            };

            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const res = await API.put(`/users/edit/${userId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                setSuccessMessage("Profile updated successfully!");
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                }
                
                fetchUserData();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage(error.response?.data?.msg || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
                <SideBar />
                <div className="lg:ml-80 p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
                    <div className="text-white text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-base md:text-xl">Loading settings...</p>
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
                <div className="mb-6 md:mb-8 animate-fadeIn">
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
                    
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2 md:gap-3">
                        <FaUserCircle className="text-blue-300 text-xl md:text-2xl" />
                        Account Settings
                    </h1>
                    <p className="text-sm md:text-base text-blue-200 mt-2">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Mobile Tab Navigation */}
                <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                            activeTab === 'profile' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                        }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                            activeTab === 'security' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                        }`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                            activeTab === 'account' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-white/10 text-blue-200 hover:bg-white/20'
                        }`}
                    >
                        Account Info
                    </button>
                </div>

                {/* Settings Content */}
                <div className="max-w-4xl">
                    {/* Desktop Layout - Grid */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Profile Settings Card */}
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl overflow-hidden border border-white/20">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-6 py-4">
                                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                        <FaUserCircle className="text-xl" />
                                        Profile Information
                                    </h2>
                                </div>
                                
                                <div className="p-4 md:p-6">
                                    {/* Success Message */}
                                    {successMessage && (
                                        <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-3 md:p-4 flex items-center gap-3">
                                            <FaCheckCircle className="text-green-400 text-lg md:text-xl flex-shrink-0" />
                                            <p className="text-green-300 text-sm md:text-base">{successMessage}</p>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {errorMessage && (
                                        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-3 md:p-4 flex items-center gap-3">
                                            <FaTimesCircle className="text-red-400 text-lg md:text-xl flex-shrink-0" />
                                            <p className="text-red-300 text-sm md:text-base">{errorMessage}</p>
                                        </div>
                                    )}

                                    {/* Form */}
                                    <div className="space-y-4 md:space-y-6">
                                        {/* Username */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                                <FaUser className="inline mr-2" />
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter your username"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                                <FaEnvelope className="inline mr-2" />
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Card */}
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl overflow-hidden border border-white/20">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 md:px-6 py-4">
                                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                        <FaShieldAlt className="text-xl" />
                                        Security
                                    </h2>
                                </div>
                                
                                <div className="p-4 md:p-6">
                                    <div className="space-y-4 md:space-y-6">
                                        <p className="text-xs md:text-sm text-blue-200">Change your password</p>

                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                                                >
                                                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                                                >
                                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-blue-300 mt-1">Minimum 6 characters</p>
                                        </div>

                                        {/* Confirm New Password */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Account Info */}
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl overflow-hidden border border-white/20 h-fit">
                            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 md:px-6 py-4">
                                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                    <FaLock className="text-xl" />
                                    Account Information
                                </h2>
                            </div>
                            
                            <div className="p-4 md:p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                                        <span className="text-blue-200 text-sm">Account Status</span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                                        <span className="text-blue-200 text-sm flex items-center gap-2">
                                            <FaCalendarAlt className="text-xs" />
                                            Member Since
                                        </span>
                                        <span className="text-white text-sm font-medium">
                                            {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                                        <span className="text-blue-200 text-sm flex items-center gap-2">
                                            <FaClock className="text-xs" />
                                            Last Updated
                                        </span>
                                        <span className="text-white text-sm font-medium">
                                            {user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-blue-200 text-sm flex items-center gap-2">
                                            <FaIdCard className="text-xs" />
                                            User ID
                                        </span>
                                        <span className="text-blue-300 text-xs font-mono bg-white/5 px-2 py-1 rounded">
                                            {user?._id ? `${user._id.substring(0, 8)}...` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout - Tabbed Content */}
                    <div className="lg:hidden space-y-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl overflow-hidden border border-white/20">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <FaUserCircle />
                                        Profile Information
                                    </h2>
                                </div>
                                
                                <div className="p-4">
                                    {/* Success/Error Messages */}
                                    {successMessage && (
                                        <div className="mb-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                                            <FaCheckCircle className="text-green-400 flex-shrink-0" />
                                            <p className="text-green-300 text-sm">{successMessage}</p>
                                        </div>
                                    )}
                                    {errorMessage && (
                                        <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                                            <FaTimesCircle className="text-red-400 flex-shrink-0" />
                                            <p className="text-red-300 text-sm">{errorMessage}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-blue-200 mb-1">Username</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white"
                                                placeholder="Username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-blue-200 mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white"
                                                placeholder="Email"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl overflow-hidden border border-white/20">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-4">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <FaShieldAlt />
                                        Security
                                    </h2>
                                </div>
                                
                                <div className="p-4">
                                    <p className="text-xs text-blue-200 mb-4">Change your password</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-blue-200 mb-1">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white pr-10"
                                                    placeholder="Current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300"
                                                >
                                                    {showCurrentPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-blue-200 mb-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white pr-10"
                                                    placeholder="New password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300"
                                                >
                                                    {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-blue-300 mt-1">Minimum 6 characters</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-blue-200 mb-1">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white pr-10"
                                                    placeholder="Confirm password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Info Tab */}
                        {activeTab === 'account' && (
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-xl overflow-hidden border border-white/20">
                                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-4">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <FaLock />
                                        Account Information
                                    </h2>
                                </div>
                                
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-white/10">
                                            <span className="text-blue-200 text-sm">Status</span>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                                Active
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/10">
                                            <span className="text-blue-200 text-sm">Member Since</span>
                                            <span className="text-white text-sm">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/10">
                                            <span className="text-blue-200 text-sm">Last Updated</span>
                                            <span className="text-white text-sm">{user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-blue-200 text-sm">User ID</span>
                                            <span className="text-blue-300 text-xs font-mono">{user?._id ? `${user._id.substring(0, 8)}...` : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button - Common for all tabs on mobile */}
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                    {/* Desktop Save Button */}
                    <div className="hidden lg:flex justify-end mt-6">
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
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

export default Settings;
