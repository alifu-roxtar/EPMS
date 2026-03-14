// alldepartments.jsx
import SideBar from "../account/sidebar";
import API from "../../components/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    FaEdit, 
    FaTrash, 
    FaFolderPlus, 
    FaSearch, 
    FaBuilding, 
    FaMoneyBillWave,
    FaBars,
    FaTimes,
    FaFilter,
    FaSortAmountDown,
    FaSortAmountUp,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

function AllDepartments() {
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
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
                headers: { Authorization: `Bearer ${token}` }
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

    // Search and sort functionality
    useEffect(() => {
        let filtered = departments.filter(dep => 
            dep.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dep.departmentCode.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort by name
        filtered.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.departmentName.localeCompare(b.departmentName);
            } else {
                return b.departmentName.localeCompare(a.departmentName);
            }
        });

        setFilteredDepartments(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchTerm, departments, sortOrder]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

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
                    headers: { Authorization: `Bearer ${token}` }
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
                { headers: { Authorization: `Bearer ${token}` } }
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
        }).format(amount || 0);
    };

    // Calculate stats
    const totalBudget = departments.reduce((sum, dep) => sum + (dep.grossSalary || 0), 0);
    const avgSalary = departments.length > 0 ? totalBudget / departments.length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800">
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
                {/* Header Section */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Department Management
                    </h1>
                    <p className="text-sm md:text-base text-blue-200">
                        Manage and organize all your departments in one place
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 mb-6 md:mb-8">
                    <div className="flex flex-col gap-4">
                        {/* Search and Add Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                                <input
                                    type="text"
                                    placeholder="Search departments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 md:py-3 bg-white/20 border border-blue-300/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 md:p-3 ${showFilters ? 'bg-green-500' : 'bg-white/20'} hover:bg-green-500 rounded-lg text-white transition-all duration-200`}
                                    title="Toggle filters"
                                >
                                    <FaFilter className="text-sm md:text-base" />
                                </button>

                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all duration-200"
                                    title={`Sort ${sortOrder === 'asc' ? 'Z to A' : 'A to Z'}`}
                                >
                                    {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                                </button>

                                <Link
                                    to="/createDepartment"
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                                >
                                    <FaFolderPlus className="text-sm md:text-base" />
                                    <span className="hidden sm:inline">Add New</span>
                                    <span className="sm:hidden">Add</span>
                                </Link>
                            </div>
                        </div>

                        {/* Filter Row (Collapsible) */}
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/20">
                                <select
                                    className="w-full px-3 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white text-sm"
                                    onChange={(e) => {
                                        // Add filter logic here
                                    }}
                                >
                                    <option value="" className="text-gray-800">All Departments</option>
                                    <option value="active" className="text-gray-800">Active</option>
                                    <option value="inactive" className="text-gray-800">Inactive</option>
                                </select>

                                <select
                                    className="w-full px-3 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white text-sm"
                                    onChange={(e) => {
                                        // Add budget range filter
                                    }}
                                >
                                    <option value="" className="text-gray-800">Budget Range</option>
                                    <option value="0-50000" className="text-gray-800">$0 - $50,000</option>
                                    <option value="50000-100000" className="text-gray-800">$50,000 - $100,000</option>
                                    <option value="100000+" className="text-gray-800">$100,000+</option>
                                </select>

                                <select
                                    className="w-full px-3 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white text-sm"
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                >
                                    <option value="10" className="text-gray-800">10 per page</option>
                                    <option value="25" className="text-gray-800">25 per page</option>
                                    <option value="50" className="text-gray-800">50 per page</option>
                                    <option value="100" className="text-gray-800">100 per page</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">Total Departments</p>
                                <p className="text-2xl md:text-3xl font-bold text-blue-900">{departments.length}</p>
                            </div>
                            <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
                                <FaBuilding className="text-xl md:text-2xl text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">Total Budget</p>
                                <p className="text-xl md:text-3xl font-bold text-green-600 truncate max-w-[150px] md:max-w-none">
                                    {formatCurrency(totalBudget)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-2 md:p-3 rounded-lg">
                                <FaMoneyBillWave className="text-xl md:text-2xl text-green-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">Avg Salary/Dept</p>
                                <p className="text-xl md:text-3xl font-bold text-purple-600 truncate max-w-[150px] md:max-w-none">
                                    {formatCurrency(avgSalary)}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-2 md:p-3 rounded-lg">
                                <FaMoneyBillWave className="text-xl md:text-2xl text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results count and pagination info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <p className="text-sm text-blue-200">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDepartments.length)} of {filteredDepartments.length} departments
                    </p>
                    <p className="text-sm text-blue-200">
                        Page {currentPage} of {totalPages}
                    </p>
                </div>

                {/* Departments Table - Responsive Card View on Mobile */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {/* Desktop Table View - Hidden on mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                                        Department Code
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                                        Department Name
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                                        Gross Salary
                                    </th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 md:px-6 py-6 md:py-8 text-center text-gray-500">
                                            Loading departments...
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 md:px-6 py-6 md:py-8 text-center text-gray-500">
                                            {searchTerm ? "No departments match your search" : "No departments found. Create your first department!"}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((dep) => (
                                        <tr key={dep._id} className="hover:bg-blue-50 transition-colors duration-200">
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <span className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-mono">
                                                    {dep.departmentCode}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700">
                                                {dep.departmentName}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700">
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(dep.grossSalary)}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => openEditModal(dep)}
                                                    className="inline-flex cursor-pointer items-center px-2 md:px-3 py-1 md:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs md:text-sm font-medium mr-1 md:mr-2 transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <FaEdit className="mr-1 text-xs md:text-sm" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDepartment(dep._id)}
                                                    className="inline-flex cursor-pointer items-center px-2 md:px-3 py-1 md:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <FaTrash className="mr-1 text-xs md:text-sm" />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden p-4">
                        {loading ? (
                            <div className="text-center text-gray-500 py-8">Loading departments...</div>
                        ) : currentItems.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                {searchTerm ? "No departments match your search" : "No departments found. Create your first department!"}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentItems.map((dep) => (
                                    <div key={dep._id} className="bg-gray-50 rounded-lg p-4 shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-mono">
                                                    {dep.departmentCode}
                                                </span>
                                                <h3 className="font-semibold text-gray-800 mt-2">{dep.departmentName}</h3>
                                            </div>
                                            <span className="font-bold text-green-600">
                                                {formatCurrency(dep.grossSalary)}
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => openEditModal(dep)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm"
                                            >
                                                <FaEdit />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDepartment(dep._id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm"
                                            >
                                                <FaTrash />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredDepartments.length > 0 && (
                        <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs md:text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-1 md:p-2 rounded-lg ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaChevronLeft className="text-xs md:text-sm" />
                                </button>
                                
                                {/* Mobile: Show fewer page numbers */}
                                <div className="flex gap-1 md:gap-2">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-6 h-6 md:w-8 md:h-8 rounded-lg text-xs md:text-sm ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-1 md:p-2 rounded-lg ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaChevronRight className="text-xs md:text-sm" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal - Responsive */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-4 md:p-8 shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-4 md:mb-6">
                            Edit Department
                        </h2>

                        <div className="space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                    Department Code
                                </label>
                                <input
                                    type="text"
                                    name="departmentCode"
                                    value={formData.departmentCode}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter department code"
                                />
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    name="departmentName"
                                    value={formData.departmentName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter department name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                    Gross Salary
                                </label>
                                <input
                                    type="number"
                                    name="grossSalary"
                                    value={formData.grossSalary}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter gross salary"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 md:mt-8">
                            <button
                                onClick={handleCancel}
                                className="w-full sm:w-auto px-4 md:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm md:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full sm:w-auto px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
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
