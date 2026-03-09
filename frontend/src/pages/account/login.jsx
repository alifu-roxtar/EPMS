import { useState } from "react";
import { 
    FaEnvelope, 
    FaLock, 
    FaSignInAlt, 
    FaEye, 
    FaEyeSlash,
    FaArrowLeft,
    FaShieldAlt,
    FaUserCircle,
    FaBuilding,
    FaCheckCircle
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API from "../../components/api";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const res = await API.post('/users/login', { email, password });
            if (res.data) {
                // Show success message
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn flex items-center gap-2';
                toast.innerHTML = '<FaCheckCircle class="text-white" /> Login successful! Redirecting...';
                document.body.appendChild(toast);
                
                setTimeout(() => toast.remove(), 3000);

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('uid', res.data.user.id);
                
                // Optional: store email if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                setTimeout(() => navigate('/home'), 1500);
                setErrorMessage('');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.msg || 'Login failed. Please try again.');
            
            // Shake animation on error
            const form = document.querySelector('.login-form');
            form.classList.add('animate-shake');
            setTimeout(() => form.classList.remove('animate-shake'), 500);
        } finally {
            setIsLoading(false);
        }
    };

    // Load remembered email on component mount
    useState(() => {
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 
            flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 
                    rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 
                    rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 
                    rounded-full blur-3xl animate-spin-slow"></div>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-20 left-20 text-white/5 text-6xl animate-float">
                <FaBuilding />
            </div>
            <div className="absolute bottom-20 right-20 text-white/5 text-6xl animate-float-delayed">
                <FaUserCircle />
            </div>
            <div className="absolute top-40 right-40 text-white/5 text-4xl animate-float-slow">
                <FaShieldAlt />
            </div>

            {/* Main Login Card */}
            <div className="relative w-full max-w-md">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br 
                    from-blue-500 to-purple-600 rounded-2xl rotate-12 opacity-50 blur-sm"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br 
                    from-purple-500 to-pink-600 rounded-2xl -rotate-12 opacity-50 blur-sm"></div>

                {/* Login Form Container */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl 
                    shadow-2xl shadow-black/30 border border-white/20 overflow-hidden
                    transform transition-all duration-500 hover:scale-[1.02] login-form">
                    
                    {/* Header with Gradient */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 
                            rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 
                            rounded-full -ml-8 -mb-8"></div>
                        
                        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">
                            Welcome Back
                        </h2>
                        <p className="text-blue-100 text-sm relative z-10">
                            Sign in to access your EPMS dashboard
                        </p>
                        
                        {/* Logo/Badge */}
                        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm 
                            px-4 py-2 rounded-full border border-white/30">
                            <span className="text-white text-sm font-semibold">EPMS v2.0</span>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200 
                                    flex items-center gap-2">
                                    <FaEnvelope className="text-blue-400" />
                                    Email Address
                                </label>
                                <div className={`relative group transition-all duration-300 
                                    ${emailFocused ? 'transform scale-105' : ''}`}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        className="w-full px-4 py-3 bg-white/5 border-2 
                                            border-white/10 rounded-xl text-white 
                                            placeholder-gray-400 focus:outline-none 
                                            focus:border-blue-500 transition-all duration-300
                                            hover:bg-white/10 peer"
                                        placeholder="Enter your email"
                                        required
                                    />
                                    <div className={`absolute inset-0 rounded-xl 
                                        bg-gradient-to-r from-blue-500 to-purple-500 
                                        opacity-0 transition-opacity duration-300 
                                        -z-10 blur-md ${emailFocused ? 'opacity-50' : ''}`}>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    We'll never share your email
                                </p>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200 
                                    flex items-center gap-2">
                                    <FaLock className="text-blue-400" />
                                    Password
                                </label>
                                <div className={`relative group transition-all duration-300 
                                    ${passwordFocused ? 'transform scale-105' : ''}`}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        className="w-full px-4 py-3 bg-white/5 border-2 
                                            border-white/10 rounded-xl text-white 
                                            placeholder-gray-400 focus:outline-none 
                                            focus:border-blue-500 transition-all duration-300
                                            hover:bg-white/10 pr-12"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-gray-400 hover:text-white transition-colors
                                            duration-300"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    <div className={`absolute inset-0 rounded-xl 
                                        bg-gradient-to-r from-blue-500 to-purple-500 
                                        opacity-0 transition-opacity duration-300 
                                        -z-10 blur-md ${passwordFocused ? 'opacity-50' : ''}`}>
                                    </div>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 
                                            bg-white/5 text-blue-600 focus:ring-blue-500
                                            focus:ring-offset-0 cursor-pointer
                                            transition-all duration-300"
                                    />
                                    <span className="text-sm text-gray-300 
                                        group-hover:text-white transition-colors duration-300">
                                        Remember me
                                    </span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-400 hover:text-blue-300 
                                        transition-colors duration-300 flex items-center gap-1
                                        hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="bg-red-500/10 border border-red-500/50 
                                    rounded-lg p-3 animate-slideIn">
                                    <p className="text-red-400 text-sm text-center">
                                        {errorMessage}
                                    </p>
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                                    hover:from-blue-700 hover:to-purple-700 text-white 
                                    py-4 rounded-xl font-semibold text-lg
                                    transition-all duration-300 transform hover:scale-[1.02]
                                    hover:shadow-2xl hover:shadow-blue-600/30
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    disabled:hover:scale-100
                                    flex items-center justify-center gap-3 group
                                    relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 
                                    transform -skew-x-12 -translate-x-full 
                                    group-hover:translate-x-full transition-transform 
                                    duration-700"></div>
                                
                                {isLoading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white 
                                            border-t-transparent rounded-full animate-spin">
                                        </div>
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSignInAlt className="text-xl group-hover:rotate-12 
                                            transition-transform duration-300" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>

                            {/* Register Link */}
                            <div className="text-center mt-6">
                                <p className="text-gray-400">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="text-blue-400 hover:text-blue-300 
                                            font-semibold transition-colors duration-300
                                            hover:underline inline-flex items-center gap-1
                                            group"
                                    >
                                        Create Account
                                        <FaArrowLeft className="text-xs rotate-180 
                                            group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </p>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <FaShieldAlt className="text-green-400 text-sm" />
                                <span className="text-xs text-gray-400">
                                    Secured with 256-bit encryption
                                </span>
                            </div>
                        </form>
                    </div>

                    {/* Footer Decoration */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 
                        bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                
                @keyframes spin-slow {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 7s ease-in-out infinite;
                    animation-delay: 2s;
                }
                
                .animate-float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                }
                
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
}

export default Login;
