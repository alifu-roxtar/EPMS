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
    FaTimesCircle
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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
        // Clear messages when user types
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

            // Prepare update data
            const updateData = {
                username: formData.username,
                email: formData.email
            };

            // Only include password fields if they're being changed
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const res = await API.put(`/users/edit/${userId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                setSuccessMessage("Profile updated successfully!");
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                
                // Update token if returned
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                }
                
                // Refresh user data
                fetchUserData();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage(error.response?.data?.msg || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 min-h-screen">
                <SideBar />
                <div className="ml-80 p-8 flex items-center justify-center h-screen">
                    <div className="text-white text-center">
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xl">Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 min-h-screen">
            <SideBar />
            
            {/* Main Content */}
            <div className="ml-80 p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link 
                            to="/home" 
                            className="text-blue-200 hover:text-white transition-colors"
                        >
                            <FaArrowLeft className="text-xl" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Settings</h1>
                    </div>
                    <p className="text-blue-200">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Settings Content */}
                <div className="max-w-3xl">
                    {/* Profile Settings Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FaUserCircle className="text-2xl" />
                                Profile Information
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            {/* Success Message */}
                            {successMessage && (
                                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                    <FaCheckCircle className="text-green-500 text-xl" />
                                    <p className="text-green-700">{successMessage}</p>
                                </div>
                            )}

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                                    <FaTimesCircle className="text-red-500 text-xl" />
                                    <p className="text-red-700">{errorMessage}</p>
                                </div>
                            )}

                            {/* Form */}
                            <div className="space-y-6">
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your username"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                                    <p className="text-sm text-gray-500 mb-4">Leave empty if you don't want to change your password</p>
                                </div>

                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                                            hover:from-blue-700 hover:to-blue-800 text-white 
                                            rounded-lg font-semibold flex items-center gap-2 
                                            transition-all duration-300 disabled:opacity-50 
                                            disabled:cursor-not-allowed"
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
                            </div>
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FaLock className="text-2xl" />
                                Account Information
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <span className="text-gray-600">Account Status</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <span className="text-gray-600">Member Since</span>
                                    <span className="text-gray-900 font-medium">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <span className="text-gray-600">Last Updated</span>
                                    <span className="text-gray-900 font-medium">
                                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-gray-600">User ID</span>
                                    <span className="text-gray-500 text-sm font-mono">
                                        {user?._id || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
