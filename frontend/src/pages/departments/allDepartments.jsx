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
    FaChevronRight,
    FaChartPie,
    FaDollarSign,
    FaUsers,
    FaEye,
    FaEyeSlash,
    FaFileExport,
    FaPrint,
    FaDownload,
    FaStar,
    FaRegStar
} from "react-icons/fa";

function AllDepartments() {
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortBy, setSortBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [budgetRange, setBudgetRange] = useState({ min: '', max: '' });
    const [favorites, setFavorites] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [formData, setFormData] = useState({
        departmentCode: "",
        departmentName: "",
        grossSalary: ""
    });

    // Fetch departments on component mount
    useEffect(() => {
        fetchDepartments();
        loadFavorites();
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

    // Load favorites from localStorage
    const loadFavorites = () => {
        const saved = localStorage.getItem('departmentFavorites');
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
    };

    // Toggle favorite
    const toggleFavorite = (deptId) => {
        let newFavorites;
        if (favorites.includes(deptId)) {
            newFavorites = favorites.filter(id => id !== deptId);
        } else {
            newFavorites = [...favorites, deptId];
        }
        setFavorites(newFavorites);
        localStorage.setItem('departmentFavorites', JSON.stringify(newFavorites));
    };

    // Search, filter, and sort functionality
    useEffect(() => {
        let filtered = departments.filter(dep => 
            (dep.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             dep.departmentCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Apply budget range filter
        if (budgetRange.min !== '') {
            filtered = filtered.filter(dep => dep.grossSalary >= Number(budgetRange.min));
        }
        if (budgetRange.max !== '') {
            filtered = filtered.filter(dep => dep.grossSalary <= Number(budgetRange.max));
        }

        // Apply favorites filter
        if (showFavoritesOnly) {
            filtered = filtered.filter(dep => favorites.includes(dep._id));
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.departmentName.localeCompare(b.departmentName);
            } else if (sortBy === 'code') {
                comparison = a.departmentCode.localeCompare(b.departmentCode);
            } else if (sortBy === 'salary') {
                comparison = a.grossSalary - b.grossSalary;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredDepartments(filtered);
        setCurrentPage(1);
    }, [searchTerm, departments, sortOrder, sortBy, budgetRange, showFavoritesOnly, favorites]);

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

    const openViewModal = (dep) => {
        setSelectedDepartment(dep);
        setIsViewModalOpen(true);
    };

    const handleDeleteDepartment = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                const token = localStorage.getItem('token');
                await API.delete(`/departments/remove/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Department deleted successfully');
                fetchDepartments();
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
            fetchDepartments();
        } catch (err) {
            console.error(err);
            alert("Failed to update department");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedDepartment(null);
    };

    // Export functions
    const exportToCSV = () => {
        const headers = ['Code', 'Name', 'Budget'];
        const data = filteredDepartments.map(dep => [
            dep.departmentCode,
            dep.departmentName,
            dep.grossSalary
        ]);
        
        const csvContent = [headers, ...data]
            .map(row => row.join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `departments-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Departments Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #2563eb; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #2563eb; color: white; padding: 10px; text-align: left; }
                        td { border: 1px solid #ddd; padding: 8px; }
                        tr:nth-child(even) { background: #f9fafb; }
                        .summary { margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <h1>Departments Report</h1>
                    <div class="summary">
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Departments:</strong> ${filteredDepartments.length}</p>
                        <p><strong>Total Budget:</strong> $${totalBudget.toLocaleString()}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Budget</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredDepartments.map(dep => `
                                <tr>
                                    <td>${dep.departmentCode}</td>
                                    <td>${dep.departmentName}</td>
                                    <td>$${dep.grossSalary?.toLocaleString() || 0}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
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
    const maxBudget = Math.max(...departments.map(d => d.grossSalary || 0));
    const minBudget = Math.min(...departments.map(d => d.grossSalary || 0));

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
                {/* Header Section */}
                <div className="mb-6 md:mb-8 animate-fadeIn">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <FaBuilding className="text-blue-300" />
                        Department Management
                    </h1>
                    <p className="text-sm md:text-base text-blue-200">
                        Manage and organize all your departments in one place
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-white/20">
                    <div className="flex flex-col gap-4">
                        {/* Search and Action Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                                <input
                                    type="text"
                                    placeholder="Search departments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 md:p-3 ${showFilters ? 'bg-green-500' : 'bg-white/10'} hover:bg-green-500 rounded-lg text-white transition-all duration-200`}
                                    title="Toggle filters"
                                >
                                    <FaFilter className="text-sm md:text-base" />
                                </button>

                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
                                    title={`Sort ${sortOrder === 'asc' ? 'Z to A' : 'A to Z'}`}
                                >
                                    {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                                </button>

                                <button
                                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className={`p-2 md:p-3 ${showFavoritesOnly ? 'bg-yellow-500' : 'bg-white/10'} hover:bg-yellow-500 rounded-lg text-white transition-all duration-200`}
                                    title="Show favorites only"
                                >
                                    <FaStar />
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

                        {/* Filter Row */}
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/20 animate-slideDown">
                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="name" className="text-gray-800">Department Name</option>
                                        <option value="code" className="text-gray-800">Department Code</option>
                                        <option value="salary" className="text-gray-800">Budget</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Min Budget</label>
                                    <input
                                        type="number"
                                        placeholder="Min $"
                                        value={budgetRange.min}
                                        onChange={(e) => setBudgetRange({...budgetRange, min: e.target.value})}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-blue-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Max Budget</label>
                                    <input
                                        type="number"
                                        placeholder="Max $"
                                        value={budgetRange.max}
                                        onChange={(e) => setBudgetRange({...budgetRange, max: e.target.value})}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-blue-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Items Per Page</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="10" className="text-gray-800">10 per page</option>
                                        <option value="25" className="text-gray-800">25 per page</option>
                                        <option value="50" className="text-gray-800">50 per page</option>
                                        <option value="100" className="text-gray-800">100 per page</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Departments</p>
                                <p className="text-2xl md:text-3xl font-bold text-white">{departments.length}</p>
                            </div>
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <FaBuilding className="text-xl md:text-2xl text-blue-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Budget</p>
                                <p className="text-lg md:text-xl font-bold text-green-300 truncate max-w-[120px] md:max-w-none">
                                    {formatCurrency(totalBudget)}
                                </p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <FaMoneyBillWave className="text-xl md:text-2xl text-green-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Avg Budget</p>
                                <p className="text-lg md:text-xl font-bold text-purple-300 truncate max-w-[120px] md:max-w-none">
                                    {formatCurrency(avgSalary)}
                                </p>
                            </div>
                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                <FaChartPie className="text-xl md:text-2xl text-purple-300" />
                            </div>
                        </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Budget Range</p>
                                <p className="text-xs md:text-sm font-bold text-yellow-300">
                                    {formatCurrency(minBudget)} - {formatCurrency(maxBudget)}
                                </p>
                            </div>
                            <div className="bg-yellow-500/20 p-3 rounded-lg">
                                <FaDollarSign className="text-xl md:text-2xl text-yellow-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={exportToCSV}
                        className="px-3 py-1 md:px-4 md:py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-xs md:text-sm flex items-center gap-2 transition-all duration-200"
                    >
                        <FaDownload />
                        Export CSV
                    </button>
                    <button
                        onClick={printReport}
                        className="px-3 py-1 md:px-4 md:py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs md:text-sm flex items-center gap-2 transition-all duration-200"
                    >
                        <FaPrint />
                        Print Report
                    </button>
                </div>

                {/* Results count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <p className="text-xs md:text-sm text-blue-200">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDepartments.length)} of {filteredDepartments.length} departments
                        {showFavoritesOnly && " (favorites only)"}
                    </p>
                    {filteredDepartments.length > 0 && (
                        <p className="text-xs md:text-sm text-blue-200">
                            Page {currentPage} of {totalPages}
                        </p>
                    )}
                </div>

                {/* Departments Display */}
                <div className="backdrop-blur-xl bg-white/10 rounded-xl shadow-xl overflow-hidden border border-white/20">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Favorite</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Code</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Department Name</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Budget</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 md:px-6 py-8 text-center text-white">
                                            <div className="flex justify-center items-center">
                                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="ml-3">Loading departments...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 md:px-6 py-8 text-center text-white">
                                            {searchTerm || showFavoritesOnly ? "No departments match your filters" : "No departments found. Create your first department!"}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((dep) => (
                                        <tr key={dep._id} className="hover:bg-white/5 transition-colors duration-200 cursor-pointer" onClick={() => openViewModal(dep)}>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(dep._id); }}
                                                    className="text-yellow-400 hover:scale-110 transition-transform"
                                                >
                                                    {favorites.includes(dep._id) ? <FaStar /> : <FaRegStar />}
                                                </button>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <span className="bg-blue-500/20 text-blue-300 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-mono border border-blue-500/30">
                                                    {dep.departmentCode}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-white">
                                                {dep.departmentName}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <span className="font-semibold text-green-400">
                                                    {formatCurrency(dep.grossSalary)}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(dep); }}
                                                    className="inline-flex cursor-pointer items-center px-2 md:px-3 py-1 md:py-2 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white rounded-lg text-xs md:text-sm font-medium mr-1 md:mr-2 transition-all duration-200 transform hover:scale-105 border border-green-500/30"
                                                >
                                                    <FaEdit className="mr-1 text-xs md:text-sm" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dep._id); }}
                                                    className="inline-flex cursor-pointer items-center px-2 md:px-3 py-1 md:py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-red-500/30"
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
                            <div className="text-center text-white py-8">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p>Loading departments...</p>
                            </div>
                        ) : currentItems.length === 0 ? (
                            <div className="text-center text-white py-8">
                                {searchTerm || showFavoritesOnly ? "No departments match your filters" : "No departments found. Create your first department!"}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentItems.map((dep) => (
                                    <div key={dep._id} className="backdrop-blur-xl bg-white/10 rounded-lg p-4 border border-white/20">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <button
                                                        onClick={() => toggleFavorite(dep._id)}
                                                        className="text-yellow-400"
                                                    >
                                                        {favorites.includes(dep._id) ? <FaStar /> : <FaRegStar />}
                                                    </button>
                                                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-mono border border-blue-500/30">
                                                        {dep.departmentCode}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-white text-base mb-1">{dep.departmentName}</h3>
                                                <p className="text-green-400 font-bold text-lg">{formatCurrency(dep.grossSalary)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                                            <button
                                                onClick={() => openViewModal(dep)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg text-sm transition-all"
                                            >
                                                <FaEye />
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditModal(dep)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white rounded-lg text-sm transition-all"
                                            >
                                                <FaEdit />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDepartment(dep._id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-sm transition-all"
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
                        <div className="px-4 md:px-6 py-3 md:py-4 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs md:text-sm text-blue-200">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-1 md:gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-1 md:p-2 rounded-lg ${
                                        currentPage === 1
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    <FaChevronLeft className="text-xs md:text-sm" />
                                </button>
                                
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
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-1 md:p-2 rounded-lg ${
                                        currentPage === totalPages
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    <FaChevronRight className="text-xs md:text-sm" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl w-full max-w-md p-4 md:p-8 shadow-2xl border border-white/20 transform transition-all max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                Edit Department
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1">
                                    Department Code
                                </label>
                                <input
                                    type="text"
                                    name="departmentCode"
                                    value={formData.departmentCode}
                                    onChange={handleChange}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter department code"
                                />
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    name="departmentName"
                                    value={formData.departmentName}
                                    onChange={handleChange}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter department name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1">
                                    Gross Salary
                                </label>
                                <input
                                    type="number"
                                    name="grossSalary"
                                    value={formData.grossSalary}
                                    onChange={handleChange}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter gross salary"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 md:mt-8">
                            <button
                                onClick={handleCancel}
                                className="w-full sm:w-auto px-4 md:px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors duration-200 text-sm md:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedDepartment && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl w-full max-w-md p-4 md:p-8 shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                Department Details
                            </h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <FaBuilding className="text-4xl text-white" />
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-blue-200">Department Code</p>
                                        <p className="text-lg font-semibold text-white">{selectedDepartment.departmentCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200">Budget</p>
                                        <p className="text-lg font-semibold text-green-400">{formatCurrency(selectedDepartment.grossSalary)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-blue-200 mb-2">Department Name</p>
                                <p className="text-xl font-bold text-white">{selectedDepartment.departmentName}</p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-blue-200 mb-2">Department ID</p>
                                <p className="text-sm font-mono text-gray-300">{selectedDepartment._id}</p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-blue-200 mb-2">Created</p>
                                <p className="text-sm text-gray-300">
                                    {selectedDepartment.createdAt ? new Date(selectedDepartment.createdAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-blue-200 mb-2">Last Updated</p>
                                <p className="text-sm text-gray-300">
                                    {selectedDepartment.updatedAt ? new Date(selectedDepartment.updatedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    openEditModal(selectedDepartment);
                                }}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white rounded-lg transition-all duration-200"
                            >
                                Edit Department
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}

export default AllDepartments;
