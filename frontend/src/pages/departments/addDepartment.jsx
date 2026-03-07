// addDepartment.jsx
import SideBar from "../account/sidebar";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../components/api";

function AddDepartment() {
    const [formData, setFormData] = useState({
        departmentCode: '',
        departmentName: '',
        grossSalary: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.departmentCode.trim()) {
            newErrors.departmentCode = 'Department code is required';
        }
        if (!formData.departmentName.trim()) {
            newErrors.departmentName = 'Department name is required';
        }
        if (!formData.grossSalary) {
            newErrors.grossSalary = 'Gross salary is required';
        } else if (formData.grossSalary <= 0) {
            newErrors.grossSalary = 'Gross salary must be greater than 0';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const res = await API.post('/departments/add', formData, {
                headers: { Authorization: token }
            });
            
            alert(res.data.msg);
            navigate('/departments');
        } catch (error) {
            console.error("Error creating department:", error);
            if (error.response?.data?.msg) {
                alert(error.response.data.msg);
            } else {
                alert("Failed to create department");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-900 to-blue-800">
            <SideBar />
            
            <div className="ml-80 p-8">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        to="/departments" 
                        className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors duration-200"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Departments
                    </Link>
                    
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create New Department
                    </h1>
                    <p className="text-blue-200">
                        Add a new department to your organization
                    </p>
                </div>

                {/* Form Card */}
                <div className="max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <form onSubmit={handleCreate} className="space-y-6">
                            {/* Department Code */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Department Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="departmentCode"
                                    value={formData.departmentCode}
                                    onChange={handleChange}
                                    placeholder="e.g., DEP001, HR-001"
                                    className={`w-full border ${errors.departmentCode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                />
                                {errors.departmentCode && (
                                    <p className="mt-1 text-sm text-red-500">{errors.departmentCode}</p>
                                )}
                            </div>

                            {/* Department Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Department Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="departmentName"
                                    value={formData.departmentName}
                                    onChange={handleChange}
                                    placeholder="e.g., Human Resources, IT Department"
                                    className={`w-full border ${errors.departmentName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                />
                                {errors.departmentName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.departmentName}</p>
                                )}
                            </div>

                            {/* Gross Salary */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Gross Salary ($) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="grossSalary"
                                        value={formData.grossSalary}
                                        onChange={handleChange}
                                        placeholder="50000"
                                        min="0"
                                        step="1000"
                                        className={`w-full pl-8 border ${errors.grossSalary ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    />
                                </div>
                                {errors.grossSalary && (
                                    <p className="mt-1 text-sm text-red-500">{errors.grossSalary}</p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-linear-to-r from-green-500 cursor-pointer to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="text-lg" />
                                            Create Department
                                        </>
                                    )}
                                </button>
                                
                                <Link
                                    to="/departments"
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700 font-semibold py-3 px-6 rounded-lg text-center transition-all duration-200"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddDepartment;