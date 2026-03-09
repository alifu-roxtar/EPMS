import { useState } from "react";
import API from "../../components/api";
import { useNavigate, Link } from "react-router-dom";
import { 
    FaUsers, 
    FaUserPlus, 
    FaUserCircle, 
    FaEnvelope, 
    FaLock, 
    FaPlus,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaTimesCircle,
    FaArrowRight,
    FaShieldAlt,
    FaBuilding,
    FaChartLine
} from "react-icons/fa";

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    
    // Password strength indicators
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const navigate = useNavigate();

    // Password strength checker
    const checkPasswordStrength = (pass) => {
        setPasswordStrength({
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
        });
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        checkPasswordStrength(newPassword);
    };

    const getPasswordStrengthScore = () => {
        return Object.values(passwordStrength).filter(Boolean).length;
    };

    const getPasswordStrengthColor = () => {
        const score = getPasswordStrengthScore();
        if (score <= 2) return 'bg-red-500';
        if (score <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        const score = getPasswordStrengthScore();
        if (score <= 2) return 'Weak';
        if (score <= 4) return 'Medium';
        return 'Strong';
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        // Validation
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        if (getPasswordStrengthScore() < 3) {
            setErrorMessage("Please use a stronger password!");
            return;
        }

        if (!acceptTerms) {
            setErrorMessage("Please accept the Terms and Conditions!");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        
        try {
            const res = await API.post('/users/register', { username, email, password });
            if (res.data) {
                setSuccessMessage("Account created successfully! Redirecting...");
                
                // Show success toast
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn flex items-center gap-2';
                toast.innerHTML = '<FaCheckCircle class="text-white" /> Registration successful! Welcome to EPMS!';
                document.body.appendChild(toast);
                
                setTimeout(() => toast.remove(), 3000);

                localStorage.setItem('token', res.data.token);
                
                setTimeout(() => navigate('/home'), 1500);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.msg || "Registration failed. Please try again.");
            
            // Shake animation on error
            const form = document.querySelector('.register-form');
            form.classList.add('animate-shake');
            setTimeout(() => form.classList.remove('animate-shake'), 500);
        } finally {
            setIsLoading(false);
        }
    };

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
                    w-96 h-96 bg-gradient-to-r from-green-600/20 to-blue-600/20 
                    rounded-full blur-3xl animate-spin-slow"></div>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-20 left-20 text-white/5 text-6xl animate-float">
                <FaBuilding />
            </div>
            <div className="absolute bottom-20 right-20 text-white/5 text-6xl animate-float-delayed">
                <FaChartLine />
            </div>
            <div className="absolute top-40 right-40 text-white/5 text-4xl animate-float-slow">
                <FaUsers />
            </div>

            {/* Main Register Card */}
            <div className="relative w-full max-w-2xl">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br 
                    from-green-500 to-blue-600 rounded-2xl rotate-12 opacity-50 blur-sm"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br 
                    from-purple-500 to-pink-600 rounded-2xl -rotate-12 opacity-50 blur-sm"></div>

                {/* Register Form Container */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl 
                    shadow-2xl shadow-black/30 border border-white/20 overflow-hidden
                    transform transition-all duration-500 hover:scale-[1.02] register-form">
                    
                    {/* Header with Gradient */}
                    <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 
                            rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 
                            rounded-full -ml-8 -mb-8"></div>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm 
                                flex items-center justify-center border border-white/30">
                                <FaUsers className="text-4xl text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Join EPMS Today
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    Create your account and start managing your workforce efficiently
                                </p>
                            </div>
                        </div>
                        
                        {/* Stats Badge */}
                        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm 
                            px-4 py-2 rounded-full border border-white/30">
                            <span className="text-white text-sm font-semibold">500+ Users</span>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-8 max-h-[600px] overflow-y-auto scrollbar-thin">
                        <form onSubmit={handleCreate} className="space-y-5">
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200 
                                    flex items-center gap-2">
                                    <FaUserCircle className="text-green-400" />
                                    Username
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border-2 
                                            border-white/10 rounded-xl text-white 
                                            placeholder-gray-400 focus:outline-none 
                                            focus:border-green-500 transition-all duration-300
                                            hover:bg-white/10 pl-10"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                    <FaUserCircle className="absolute left-3 top-1/2 
                                        -translate-y-1/2 text-gray-400 group-hover:text-green-400 
                                        transition-colors duration-300" />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200 
                                    flex items-center gap-2">
                                    <FaEnvelope className="text-blue-400" />
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border-2 
                                            border-white/10 rounded-xl text-white 
                                            placeholder-gray-400 focus:outline-none 
                                            focus:border-blue-500 transition-all duration-300
                                            hover:bg-white/10 pl-10"
                                        placeholder="Enter your email"
                                        required
                                    />
                                    <FaEnvelope className="absolute left-3 top-1/2 
                                        -translate-y-1/2 text-gray-400 group-hover:text-blue-400 
                                        transition-colors duration-300" />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200 
                                    flex items-center gap-2">
                                    <FaLock className="text-yellow-400" />
                                    Password
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-3 bg-white/5 border-2 
                                            border-white/10 rounded-xl text-white 
                                            placeholder-gray-400 focus:outline-none 
                                            focus:border-yellow-500 transition-all duration-300
                                            hover:bg-white/10 pl-10 pr-12"
                                        placeholder="Create a password"
                                        required
                                    />
                                    <FaLock className="absolute left-3 top-1/2 
                                        -translate-y-1/2 text-gray-400 group-hover:text-yellow-400 
                                        transition-colors duration-300" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-gray-400 hover:text-white transition-colors
                                            duration-300"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                {password && (
                                    <div className="mt-3 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${getPasswordStrengthColor()} 
                                                        transition-all duration-500 ease-out`}
                                                    style={{ width: `${(getPasswordStrengthScore() / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs font-semibold 
                                                ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                {passwordStrength.length ? 
                                                    <FaCheckCircle className="text-green-400" /> : 
                                                    <FaTimesCircle className="text-red-400" />}
                                                <span className="text-gray-400">8+ characters</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {passwordStrength.uppercase ? 
                                                    <FaCheckCircle className="text-green-400" /> : 
                                                    <FaTimesCircle className="text-red-400" />}
                                                <span className="text-gray-400">Uppercase</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {passwordStrength.lowercase ? 
                                                    <FaCheckCircle className="text-green-400" /> : 
                                                    <FaTimesCircle className="text-red-400" />}
                                                <span className="text-gray-400">Lowercase</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {passwordStrength.number ? 
                                                    <FaCheckCircle className="text-green-400" /> : 
                                                    <FaTimesCircle className="text-red-400" />}
                                                <span className="text-gray-400">Number</span>
                                            </div>
                                            <div className="flex items-center gap-2 col-span-2">
                                                {passwordStrength.special ? 
                                                    <FaCheckCircle className="text-green-400" /> : 
                                                    <FaTimesCircle className="text-red-400" />}
                                                <span className="text-gray-400">Special character (!@#$%)</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200 
                                    flex items-center gap-2">
                                    <FaLock className="text-purple-400" />
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border-2 
                                            border-white/10 rounded-xl text-white 
                                            placeholder-gray-400 focus:outline-none 
                                            focus:border-purple-500 transition-all duration-300
                                            hover:bg-white/10 pl-10 pr-12"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <FaLock className="absolute left-3 top-1/2 
                                        -translate-y-1/2 text-gray-400 group-hover:text-purple-400 
                                        transition-colors duration-300" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-gray-400 hover:text-white transition-colors
                                            duration-300"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-red-400 text-xs mt-1 animate-slideIn">
                                        Passwords do not match!
                                    </p>
                                )}
                                {confirmPassword && password === confirmPassword && (
                                    <p className="text-green-400 text-xs mt-1 animate-slideIn 
                                        flex items-center gap-1">
                                        <FaCheckCircle /> Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-white/20 
                                        bg-white/5 text-green-600 focus:ring-green-500
                                        focus:ring-offset-0 cursor-pointer
                                        transition-all duration-300"
                                    required
                                />
                                <label className="text-sm text-gray-300">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-green-400 hover:text-green-300 
                                        transition-colors duration-300">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-green-400 hover:text-green-300 
                                        transition-colors duration-300">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Error/Success Message */}
                            {errorMessage && (
                                <div className="bg-red-500/10 border border-red-500/50 
                                    rounded-lg p-3 animate-slideIn">
                                    <p className="text-red-400 text-sm text-center">
                                        {errorMessage}
                                    </p>
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-green-500/10 border border-green-500/50 
                                    rounded-lg p-3 animate-slideIn">
                                    <p className="text-green-400 text-sm text-center 
                                        flex items-center justify-center gap-2">
                                        <FaCheckCircle /> {successMessage}
                                    </p>
                                </div>
                            )}

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600 
                                    hover:from-green-700 hover:to-blue-700 text-white 
                                    py-4 rounded-xl font-semibold text-lg
                                    transition-all duration-300 transform hover:scale-[1.02]
                                    hover:shadow-2xl hover:shadow-green-600/30
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
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus className="text-xl group-hover:rotate-12 
                                            transition-transform duration-300" />
                                        <span>Create Account</span>
                                        <FaArrowRight className="text-sm group-hover:translate-x-1 
                                            transition-transform duration-300" />
                                    </>
                                )}
                            </button>

                            {/* Login Link */}
                            <div className="text-center mt-6">
                                <p className="text-gray-400">
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        className="text-green-400 hover:text-green-300 
                                            font-semibold transition-colors duration-300
                                            hover:underline inline-flex items-center gap-1
                                            group"
                                    >
                                        Sign In
                                        <FaArrowRight className="text-xs 
                                            group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </p>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <FaShieldAlt className="text-green-400 text-sm" />
                                <span className="text-xs text-gray-400">
                                    Your data is protected with enterprise-grade security
                                </span>
                            </div>
                        </form>
                    </div>

                    {/* Footer Decoration */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 
                        bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
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
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
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

export default Register;
