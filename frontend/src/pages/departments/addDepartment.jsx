// addDepartment.jsx
import SideBar from "../account/sidebar";
import { 
    FaPlus, 
    FaArrowLeft, 
    FaBuilding, 
    FaDollarSign, 
    FaHashtag,
    FaCheckCircle,
    FaTimesCircle,
    FaBars,
    FaTimes,
    FaInfoCircle,
    FaSave
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../components/api";

function AddDepartment() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        departmentCode: '',
        departmentName: '',
        grossSalary: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    const navigate = useNavigate();

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // Handle field blur (for validation styling)
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true
        });
    };

    // Real-time validation
    const validateField = (name, value) => {
        switch(name) {
            case 'departmentCode':
                if (!value.trim()) return 'Department code is required';
                if (value.trim().length < 3) return 'Department code must be at least 3 characters';
                if (!/^[A-Za-z0-9-]+$/.test(value)) return 'Only letters, numbers, and hyphens allowed';
                return '';
            case 'departmentName':
                if (!value.trim()) return 'Department name is required';
                if (value.trim().length < 2) return 'Department name must be at least 2 characters';
                return '';
            case 'grossSalary':
                if (!value) return 'Gross salary is required';
                if (value <= 0) return 'Gross salary must be greater than 0';
                if (value > 10000000) return 'Salary seems too high (max $10M)';
                return '';
            default:
                return '';
        }
    };

    // Get field error (combines touched and validation)
    const getFieldError = (name) => {
        if (touched[name]) {
            return validateField(name, formData[name]);
        }
        return errors[name] || '';
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate all fields
        newErrors.departmentCode = validateField('departmentCode', formData.departmentCode);
        newErrors.departmentName = validateField('departmentName', formData.departmentName);
        newErrors.grossSalary = validateField('grossSalary', formData.grossSalary);
        
        // Filter out empty errors
        const filteredErrors = Object.fromEntries(
            Object.entries(newErrors).filter(([_, value]) => value !== '')
        );
        
        setErrors(filteredErrors);
        
        // Mark all fields as touched
        setTouched({
            departmentCode: true,
            departmentName: true,
            grossSalary: true
        });
        
        return Object.keys(filteredErrors).length === 0;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            // Scroll to first error
            const firstError = document.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const res = await API.post('/departments/add', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccess(true);
            
            // Show success message
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn flex items-center gap-2';
            toast.innerHTML = '<FaCheckCircle class="text-white" /> Department created successfully! Redirecting...';
            document.body.appendChild(toast);
            
            setTimeout(() => toast.remove(), 3000);
            
            // Redirect after success
            setTimeout(() => navigate('/departments'), 1500);
            
        } catch (error) {
            console.error("Error creating department:", error);
            
            // Handle specific error messages
            if (error.response?.data?.msg) {
                if (error.response.data.msg.includes('already exists')) {
                    setErrors({
                        ...errors,
                        departmentCode: 'This department code already exists'
                    });
                } else {
                    alert(error.response.data.msg);
                }
            } else {
                alert("Failed to create department. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Get field status icon
    const getFieldStatus = (name) => {
        if (!touched[name] || !formData[name]) return null;
        const error = validateField(name, formData[name]);
        return error ? 
            <FaTimesCircle className="text-red-500 absolute right-3 top-1/2 -translate-y-1/2" /> :
            <FaCheckCircle className="text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                    {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
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
                    <Link 
                        to="/departments" 
                        className="inline-flex items-center text-blue-200 hover:text-white mb-3 md:mb-4 transition-all duration-200 group text-sm md:text-base"
                    >
                        <div className="bg-blue-500/20 p-1 md:p-2 rounded-lg mr-2 group-hover:bg-blue-500/30 transition-colors">
                            <FaArrowLeft className="text-xs md:text-sm" />
                        </div>
                        Back to Departments
                    </Link>
                    
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
                        <FaBuilding className="text-green-400 text-xl md:text-2xl" />
                        Create New Department
                    </h1>
                    <p className="text-sm md:text-base text-blue-200">
                        Add a new department to your organization. Fill in the details below.
                    </p>
                </div>

                {/* Form Card */}
                <div className="max-w-3xl">
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-8 py-4 md:py-6">
                            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                <FaBuilding className="text-white/80" />
                                Department Information
                            </h2>
                            <p className="text-xs md:text-sm text-blue-100 mt-1">
                                Fields marked with <span className="text-red-300">*</span> are required
                            </p>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleCreate} className="p-4 md:p-8">
                            <div className="space-y-5 md:space-y-6">
                                {/* Department Code */}
                                <div className="group">
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2 flex items-center gap-1">
                                        <FaHashtag className="text-blue-400" />
                                        Department Code <span className="text-red-400">*</span>
                                        <div className="relative ml-1 group">
                                            <FaInfoCircle className="text-xs text-blue-300 cursor-help" />
                                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                Unique identifier for the department (e.g., HR-001, IT-DEPT)
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="departmentCode"
                                            value={formData.departmentCode}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="e.g., HR-001, IT-DEPT, FIN-01"
                                            className={`w-full bg-white/10 border-2 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 transition-all duration-300 pr-10
                                                ${getFieldError('departmentCode') 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : touched.departmentCode && formData.departmentCode && !getFieldError('departmentCode')
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-white/20 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                        />
                                        {getFieldStatus('departmentCode')}
                                    </div>
                                    {getFieldError('departmentCode') && (
                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                            <FaTimesCircle className="text-xs" />
                                            {getFieldError('departmentCode')}
                                        </p>
                                    )}
                                    {touched.departmentCode && formData.departmentCode && !getFieldError('departmentCode') && (
                                        <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                                            <FaCheckCircle className="text-xs" />
                                            Looks good!
                                        </p>
                                    )}
                                </div>

                                {/* Department Name */}
                                <div className="group">
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2 flex items-center gap-1">
                                        <FaBuilding className="text-blue-400" />
                                        Department Name <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="departmentName"
                                            value={formData.departmentName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="e.g., Human Resources, IT Department"
                                            className={`w-full bg-white/10 border-2 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 transition-all duration-300 pr-10
                                                ${getFieldError('departmentName') 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : touched.departmentName && formData.departmentName && !getFieldError('departmentName')
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-white/20 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                        />
                                        {getFieldStatus('departmentName')}
                                    </div>
                                    {getFieldError('departmentName') && (
                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                            <FaTimesCircle className="text-xs" />
                                            {getFieldError('departmentName')}
                                        </p>
                                    )}
                                    {touched.departmentName && formData.departmentName && !getFieldError('departmentName') && (
                                        <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                                            <FaCheckCircle className="text-xs" />
                                            Looks good!
                                        </p>
                                    )}
                                </div>

                                {/* Gross Salary */}
                                <div className="group">
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2 flex items-center gap-1">
                                        <FaDollarSign className="text-blue-400" />
                                        Gross Salary <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base">$</span>
                                        <input
                                            type="number"
                                            name="grossSalary"
                                            value={formData.grossSalary}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                            className={`w-full bg-white/10 border-2 rounded-lg pl-8 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 transition-all duration-300 pr-10
                                                ${getFieldError('grossSalary') 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : touched.grossSalary && formData.grossSalary && !getFieldError('grossSalary')
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-white/20 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                        />
                                        {getFieldStatus('grossSalary')}
                                    </div>
                                    {getFieldError('grossSalary') && (
                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                            <FaTimesCircle className="text-xs" />
                                            {getFieldError('grossSalary')}
                                        </p>
                                    )}
                                    {touched.grossSalary && formData.grossSalary && !getFieldError('grossSalary') && (
                                        <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                                            <FaCheckCircle className="text-xs" />
                                            Valid salary amount
                                        </p>
                                    )}
                                </div>

                                {/* Form Hints */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 md:p-4">
                                    <h4 className="text-xs md:text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                        <FaInfoCircle />
                                        Quick Tips
                                    </h4>
                                    <ul className="text-xs md:text-sm text-blue-200 space-y-1 list-disc list-inside">
                                        <li>Department code should be unique and easy to remember</li>
                                        <li>Use clear, descriptive department names</li>
                                        <li>Set a realistic budget for the department</li>
                                    </ul>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6 border-t border-white/10">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 
                                            hover:from-green-600 hover:to-emerald-700 text-white 
                                            font-semibold py-3 md:py-4 px-4 md:px-6 rounded-lg 
                                            flex items-center justify-center gap-2 
                                            transition-all duration-300 transform hover:scale-105 
                                            hover:shadow-2xl hover:shadow-green-500/30
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            disabled:hover:scale-100 text-sm md:text-base
                                            order-2 sm:order-1"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="hidden sm:inline">Creating Department...</span>
                                                <span className="sm:hidden">Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="text-base md:text-lg" />
                                                <span className="hidden sm:inline">Create Department</span>
                                                <span className="sm:hidden">Create</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <Link
                                        to="/departments"
                                        className="flex-1 bg-white/10 hover:bg-white/20 
                                            text-white font-semibold py-3 md:py-4 px-4 md:px-6 
                                            rounded-lg text-center transition-all duration-200 
                                            transform hover:scale-105 border border-white/20
                                            hover:border-white/30 text-sm md:text-base
                                            order-1 sm:order-2"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Preview Card (Optional) */}
                    {formData.departmentName && formData.departmentCode && formData.grossSalary && !Object.keys(errors).length && (
                        <div className="mt-6 md:mt-8 backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 border border-white/20 animate-slideUp">
                            <h3 className="text-sm md:text-base font-semibold text-white mb-3 flex items-center gap-2">
                                <FaBuilding className="text-green-400" />
                                Department Preview
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-xs text-blue-200 mb-1">Code</p>
                                    <p className="text-sm md:text-base font-mono font-semibold text-white">{formData.departmentCode}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-xs text-blue-200 mb-1">Name</p>
                                    <p className="text-sm md:text-base font-semibold text-white">{formData.departmentName}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-xs text-blue-200 mb-1">Budget</p>
                                    <p className="text-sm md:text-base font-semibold text-green-400">
                                        ${Number(formData.grossSalary).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}

export default AddDepartment;
