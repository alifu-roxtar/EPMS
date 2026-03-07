// alldepartments.jsx
import SideBar from "../account/sidebar";
import API from "../../components/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaFolderPlus, FaSearch, FaBuilding, FaMoneyBillWave } from "react-icons/fa";

function AllDepartments() {
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [formData, setFormData] = useState({
        departmentCode: "",
        departmentName: "",
        grossSalary: ""
    });

    // Fetch departments on component mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/departments/all', {
                headers: { Authorization: token }
            });
            setDepartments(res.data);
            setFilteredDepartments(res.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
            alert("Failed to fetch departments");
        } finally {
            setLoading(false);
        }
    };

    // Search functionality
    useEffect(() => {
        const filtered = departments.filter(dep => 
            dep.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dep.departmentCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDepartments(filtered);
    }, [searchTerm, departments]);

    const openEditModal = (dep) => {
        setSelectedDepartment(dep);
        setFormData({
            departmentCode: dep.departmentCode,
            departmentName: dep.departmentName,
            grossSalary: dep.grossSalary
        });
        setIsModalOpen(true);
    };

    const handleDeleteDepartment = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                const token = localStorage.getItem('token');
                await API.delete(`/departments/remove/${id}`, {
                    headers: { Authorization: token }
                });
                alert('Department deleted successfully');
                fetchDepartments(); // Refresh the list
            } catch (error) {
                console.error("Error deleting department:", error);
                alert("Failed to delete department");
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.put(
                `/departments/edit/${selectedDepartment._id}`,
                formData,
                { headers: { Authorization: token } }
            );
            alert(res.data.msg);
            setIsModalOpen(false);
            fetchDepartments(); // Refresh the list
        } catch (err) {
            console.error(err);
            alert("Failed to update department");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedDepartment(null);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-linear-to-br from-blue-900 to-blue-800 min-h-screen flex">
            <SideBar />
            
            {/* Main Content */}
            <div className="flex-1 ml-80 p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Department Management
                    </h1>
                    <p className="text-blue-200">
                        Manage and organize all your departments in one place
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                            <input
                                type="text"
                                placeholder="Search departments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-blue-300/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Add Button */}
                        <Link
                            to="/createDepartment"
                            className="w-full md:w-auto bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                        >
                            <FaFolderPlus className="text-lg" />
                            Add New Department
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Departments</p>
                                <p className="text-3xl font-bold text-blue-900">{departments.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FaBuilding className="text-2xl text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Budget</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatCurrency(departments.reduce((sum, dep) => sum + (dep.grossSalary || 0), 0))}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <FaMoneyBillWave className="text-2xl text-green-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Avg Salary/Dept</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {formatCurrency(
                                        departments.length > 0 
                                            ? departments.reduce((sum, dep) => sum + (dep.grossSalary || 0), 0) / departments.length 
                                            : 0
                                    )}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <FaMoneyBillWave className="text-2xl text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Departments Table */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-linear-to-r from-blue-600 to-blue-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Department Code
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Department Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Gross Salary
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Loading departments...
                                        </td>
                                    </tr>
                                ) : filteredDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            {searchTerm ? "No departments match your search" : "No departments found. Create your first department!"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDepartments.map((dep, index) => (
                                        <tr key={dep._id} className="hover:bg-blue-50 transition-colors duration-200">
                                            <td key={index} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                    {dep.departmentCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {dep.departmentName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(dep.grossSalary)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => openEditModal(dep)}
                                                    className="inline-flex cursor-pointer items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium mr-2 transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <FaEdit className="mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDepartment(dep._id)}
                                                    className="inline-flex cursor-pointer items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <FaTrash className="mr-1" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-2xl transform transition-all">
                        <h2 className="text-2xl font-bold text-blue-900 mb-6">
                            Edit Department
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department Code
                                </label>
                                <input
                                    type="text"
                                    name="departmentCode"
                                    value={formData.departmentCode}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter department code"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    name="departmentName"
                                    value={formData.departmentName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter department name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gross Salary
                                </label>
                                <input
                                    type="number"
                                    name="grossSalary"
                                    value={formData.grossSalary}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter gross salary"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllDepartments;