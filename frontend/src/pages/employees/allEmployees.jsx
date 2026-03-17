// allEmployees.jsx
import SideBar from "../account/sidebar";
import { useState, useEffect } from "react";
import API from "../../components/api";
import { 
    FaEdit, 
    FaTrash, 
    FaUserPlus, 
    FaSearch, 
    FaVenusMars, 
    FaPhone, 
    FaMapMarkerAlt, 
    FaBriefcase,
    FaIdCard,
    FaTimes,
    FaSave,
    FaUserCircle,
    FaFilter,
    FaSync,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaEnvelope,
    FaChartPie,
    FaUsers,
    FaBuilding,
    FaChevronLeft,
    FaChevronRight,
    FaEye,
    FaEyeSlash,
    FaBars,
    FaArrowLeft
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function AllEmployees() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        byDepartment: {},
        byGender: { male: 0, female: 0, other: 0 },
        totalSalary: 0,
        averageSalary: 0,
        activeEmployees: 0
    });
    const [formData, setFormData] = useState({
        employeeNumber: "",
        FirstName: "",
        LastName: "",
        Position: "",
        Address: "",
        Telephone: "",
        Gender: "",
        departmentId: "",
        email: "",
        dateHired: "",
        salary: "",
        status: "active"
    });
    const [errors, setErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch data on component mount
    useEffect(() => {
        fetchDepartments();
        fetchEmployees();
        fetchStats();
    }, []);

    // Filter employees based on all filters
    useEffect(() => {
        let filtered = employees;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(emp => 
                emp.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeNumber?.toString().includes(searchTerm) ||
                emp.Position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.Telephone?.includes(searchTerm) ||
                emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Department filter
        if (selectedDepartment) {
            filtered = filtered.filter(emp => emp.departmentId?._id === selectedDepartment || emp.departmentId === selectedDepartment);
        }

        // Gender filter
        if (selectedGender) {
            filtered = filtered.filter(emp => emp.Gender === selectedGender);
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(emp => emp.status === selectedStatus);
        }

        setFilteredEmployees(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedDepartment, selectedGender, selectedStatus, employees]);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/departments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(res.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            }
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/employees/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const employeeData = res.data.employees || res.data;
            setEmployees(employeeData);
            setFilteredEmployees(employeeData);
        } catch (error) {
            console.error("Error fetching employees:", error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                alert("Failed to fetch employees. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/employees/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            if (employees.length > 0) {
                calculateBasicStats();
            }
        } finally {
            setStatsLoading(false);
        }
    };

    const calculateBasicStats = () => {
        const totalEmployees = employees.length;
        const totalSalary = employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);
        const byGender = {
            male: employees.filter(e => e.Gender === 'male').length,
            female: employees.filter(e => e.Gender === 'female').length,
            other: employees.filter(e => e.Gender === 'other').length
        };
        const activeEmployees = employees.filter(e => e.status === 'active').length;

        setStats({
            totalEmployees,
            byGender,
            totalSalary,
            averageSalary: totalEmployees > 0 ? totalSalary / totalEmployees : 0,
            activeEmployees,
            byDepartment: {}
        });
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        window.location.href = '/login';
    };

    const getDepartmentName = (departmentId) => {
        if (!departmentId) return "No Department";
        const dep = departments.find(d => d._id === departmentId);
        return dep ? dep.departmentName : "Unknown Department";
    };

    const getDepartmentColor = (departmentId) => {
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-yellow-100 text-yellow-800',
            'bg-pink-100 text-pink-800',
            'bg-indigo-100 text-indigo-800'
        ];
        const index = departments.findIndex(d => d._id === departmentId) % colors.length;
        return colors[index] || colors[0];
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'on leave': 'bg-yellow-100 text-yellow-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ""
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employeeNumber) newErrors.employeeNumber = "Employee number is required";
        if (!formData.FirstName) newErrors.FirstName = "First name is required";
        if (!formData.LastName) newErrors.LastName = "Last name is required";
        if (!formData.Position) newErrors.Position = "Position is required";
        if (!formData.Address) newErrors.Address = "Address is required";
        if (!formData.Telephone) newErrors.Telephone = "Telephone is required";
        if (!formData.Gender) newErrors.Gender = "Gender is required";
        if (!formData.departmentId) newErrors.departmentId = "Department is required";

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (formData.Telephone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(formData.Telephone)) {
            newErrors.Telephone = "Invalid phone number format";
        }

        if (formData.salary && formData.salary < 0) {
            newErrors.salary = "Salary cannot be negative";
        }

        return newErrors;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.post('/employees/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert(res.data.msg || "Employee created successfully");
            setIsAddModalOpen(false);
            resetForm();
            fetchEmployees();
            fetchStats();
        } catch (error) {
            console.error("Error creating employee:", error);
            alert(error.response?.data?.msg || "Failed to create employee");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.put(`/employees/update/${selectedEmployee._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert(res.data.msg || "Employee updated successfully");
            setIsEditModalOpen(false);
            resetForm();
            fetchEmployees();
            fetchStats();
        } catch (error) {
            console.error("Error updating employee:", error);
            alert(error.response?.data?.msg || "Failed to update employee");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const res = await API.delete(`/employees/delete/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                alert(res.data.msg || "Employee deleted successfully");
                fetchEmployees();
                fetchStats();
            } catch (error) {
                console.error("Error deleting employee:", error);
                alert(error.response?.data?.msg || "Failed to delete employee");
            }
        }
    };

    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            employeeNumber: employee.employeeNumber || "",
            FirstName: employee.FirstName || "",
            LastName: employee.LastName || "",
            Position: employee.Position || "",
            Address: employee.Address || "",
            Telephone: employee.Telephone || "",
            Gender: employee.Gender || "",
            departmentId: employee.departmentId?._id || employee.departmentId || "",
            email: employee.email || "",
            dateHired: employee.dateHired ? employee.dateHired.split('T')[0] : "",
            salary: employee.salary || "",
            status: employee.status || "active"
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            employeeNumber: "",
            FirstName: "",
            LastName: "",
            Position: "",
            Address: "",
            Telephone: "",
            Gender: "",
            departmentId: "",
            email: "",
            dateHired: "",
            salary: "",
            status: "active"
        });
        setErrors({});
        setSelectedEmployee(null);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsViewModalOpen(false);
        resetForm();
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedDepartment("");
        setSelectedGender("");
        setSelectedStatus("");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                {/* Header */}
                <div className="mb-6 md:mb-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => window.history.back()}
                            className="lg:hidden text-blue-200 hover:text-white transition-colors"
                        >
                            <FaArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
                            <FaUsers className="text-blue-300" />
                            Employee Management
                        </h1>
                    </div>
                    <p className="text-sm md:text-base text-blue-200">
                        Manage and organize all your employees across different departments
                    </p>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
                    {/* Total Employees */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total</p>
                                <p className="text-xl md:text-2xl font-bold text-white">
                                    {statsLoading ? (
                                        <span className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        stats.totalEmployees || employees.length
                                    )}
                                </p>
                            </div>
                            <div className="bg-blue-500/20 p-2 md:p-3 rounded-lg">
                                <FaUsers className="text-lg md:text-xl text-blue-300" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Active Employees */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Active</p>
                                <p className="text-xl md:text-2xl font-bold text-white">
                                    {stats.activeEmployees || employees.filter(e => e.status === 'active').length}
                                </p>
                            </div>
                            <div className="bg-green-500/20 p-2 md:p-3 rounded-lg">
                                <FaUserCircle className="text-lg md:text-xl text-green-300" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Gender Distribution */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Male/Female</p>
                                <p className="text-lg md:text-xl font-bold text-white">
                                    {stats.byGender.male || employees.filter(e => e.Gender === 'male').length} / {stats.byGender.female || employees.filter(e => e.Gender === 'female').length}
                                </p>
                            </div>
                            <div className="bg-purple-500/20 p-2 md:p-3 rounded-lg">
                                <FaVenusMars className="text-lg md:text-xl text-purple-300" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Total Salary */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Salary</p>
                                <p className="text-sm md:text-base font-bold text-white truncate max-w-[100px] md:max-w-[120px]">
                                    {formatCurrency(stats.totalSalary || employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0))}
                                </p>
                            </div>
                            <div className="bg-yellow-500/20 p-2 md:p-3 rounded-lg">
                                <FaMoneyBillWave className="text-lg md:text-xl text-yellow-300" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Departments Count */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Departments</p>
                                <p className="text-xl md:text-2xl font-bold text-white">{departments.length}</p>
                            </div>
                            <div className="bg-indigo-500/20 p-2 md:p-3 rounded-lg">
                                <FaBuilding className="text-lg md:text-xl text-indigo-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-white/20">
                    <div className="flex flex-col gap-4">
                        {/* Search and Action Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
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
                                    onClick={clearFilters}
                                    className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
                                    title="Clear filters"
                                >
                                    <FaSync className="text-sm md:text-base" />
                                </button>

                                <button
                                    onClick={openAddModal}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                                >
                                    <FaUserPlus className="text-sm md:text-base" />
                                    <span className="hidden sm:inline">Add Employee</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            </div>
                        </div>

                        {/* Filter Row */}
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/20 animate-slideDown">
                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Department</label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="" className="text-gray-800">All Departments</option>
                                        {departments.map(dep => (
                                            <option key={dep._id} value={dep._id} className="text-gray-800">
                                                {dep.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Gender</label>
                                    <select
                                        value={selectedGender}
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="" className="text-gray-800">All Genders</option>
                                        <option value="male" className="text-gray-800">Male</option>
                                        <option value="female" className="text-gray-800">Female</option>
                                        <option value="other" className="text-gray-800">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="" className="text-gray-800">All Status</option>
                                        <option value="active" className="text-gray-800">Active</option>
                                        <option value="inactive" className="text-gray-800">Inactive</option>
                                        <option value="on leave" className="text-gray-800">On Leave</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Show</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="10" className="text-gray-800">10 per page</option>
                                        <option value="25" className="text-gray-800">25 per page</option>
                                        <option value="50" className="text-gray-800">50 per page</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <p className="text-xs md:text-sm text-blue-200">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees
                    </p>
                    {filteredEmployees.length > 0 && (
                        <p className="text-xs md:text-sm text-blue-200">
                            Page {currentPage} of {totalPages}
                        </p>
                    )}
                </div>

                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden md:block backdrop-blur-xl bg-white/10 rounded-xl shadow-xl overflow-hidden border border-white/20">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Employee #</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Name</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Position</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Department</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Contact</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Gender</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Status</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 md:px-6 py-8 text-center text-white">
                                            <div className="flex justify-center items-center">
                                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="ml-3">Loading employees...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 md:px-6 py-8 text-center text-white">
                                            <div className="flex flex-col items-center">
                                                <FaUsers className="text-4xl text-blue-300 mb-4 opacity-50" />
                                                <p className="text-white">
                                                    {searchTerm || selectedDepartment || selectedGender || selectedStatus 
                                                        ? "No employees match your filters" 
                                                        : "No employees found"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-white/5 transition-colors duration-200 cursor-pointer" onClick={() => openViewModal(emp)}>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <span className="bg-blue-500/20 text-blue-300 px-2 md:px-3 py-1 rounded-full text-xs font-mono border border-blue-500/30">
                                                    #{emp.employeeNumber}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                                                        {emp.FirstName?.charAt(0)}{emp.LastName?.charAt(0)}
                                                    </div>
                                                    <div className="ml-2 md:ml-3">
                                                        <div className="text-xs md:text-sm font-medium text-white">
                                                            {emp.FirstName} {emp.LastName}
                                                        </div>
                                                        {emp.email && (
                                                            <div className="text-xs text-blue-300">{emp.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-white">
                                                {emp.Position}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${getDepartmentColor(emp.departmentId?._id || emp.departmentId)}`}>
                                                    {emp.departmentId?.departmentName || getDepartmentName(emp.departmentId)}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-white">
                                                {emp.Telephone}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                                    emp.Gender === 'male' 
                                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                                        : emp.Gender === 'female'
                                                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                }`}>
                                                    {emp.Gender}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(emp.status)}`}>
                                                    {emp.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(emp); }}
                                                    className="inline-flex items-center px-2 md:px-3 py-1 md:py-2 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white rounded-lg text-xs md:text-sm font-medium mr-1 transition-all duration-200 transform hover:scale-105 border border-green-500/30"
                                                >
                                                    <FaEdit className="mr-1 text-xs md:text-sm" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(emp._id); }}
                                                    className="inline-flex items-center px-2 md:px-3 py-1 md:py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-red-500/30"
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
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="text-center text-white py-8">
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p>Loading employees...</p>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center text-white py-8 backdrop-blur-xl bg-white/10 rounded-xl p-6">
                            <FaUsers className="text-4xl text-blue-300 mx-auto mb-4 opacity-50" />
                            <p className="text-white">
                                {searchTerm || selectedDepartment || selectedGender || selectedStatus 
                                    ? "No employees match your filters" 
                                    : "No employees found"}
                            </p>
                        </div>
                    ) : (
                        currentItems.map((emp) => (
                            <div key={emp._id} className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {emp.FirstName?.charAt(0)}{emp.LastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{emp.FirstName} {emp.LastName}</h3>
                                            <p className="text-xs text-blue-300">{emp.Position}</p>
                                            <p className="text-xs text-gray-400">{emp.employeeNumber}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(emp.status)}`}>
                                        {emp.status || 'active'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <p className="text-xs text-blue-200">Department</p>
                                        <p className="text-sm font-semibold text-white truncate">
                                            {emp.departmentId?.departmentName || getDepartmentName(emp.departmentId)}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <p className="text-xs text-blue-200">Contact</p>
                                        <p className="text-sm font-semibold text-white">{emp.Telephone}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2">
                                        <p className="text-xs text-blue-200">Gender</p>
                                        <p className="text-sm font-semibold text-white capitalize">{emp.Gender}</p>
                                    </div>
                                    {emp.email && (
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <p className="text-xs text-blue-200">Email</p>
                                            <p className="text-sm font-semibold text-white truncate">{emp.email}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-white/10">
                                    <button
                                        onClick={() => openViewModal(emp)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg text-sm transition-all"
                                    >
                                        <FaEye />
                                        View
                                    </button>
                                    <button
                                        onClick={() => openEditModal(emp)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white rounded-lg text-sm transition-all"
                                    >
                                        <FaEdit />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(emp._id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-sm transition-all"
                                    >
                                        <FaTrash />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {filteredEmployees.length > 0 && (
                    <div className="mt-4 md:mt-6 backdrop-blur-xl bg-white/10 rounded-xl px-4 md:px-6 py-3 md:py-4 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs md:text-sm text-blue-200 order-2 sm:order-1">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-1 md:gap-2 order-1 sm:order-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
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
                                        onClick={() => paginate(pageNum)}
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
                                onClick={() => paginate(currentPage + 1)}
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

            {/* Add/Edit/View Modals - Keep existing modal code but make them responsive */}
            {/* Add Employee Modal - Responsive */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/20">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                    <FaUserPlus className="text-xl md:text-2xl" />
                                    Add New Employee
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                                >
                                    <FaTimes className="text-lg md:text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreate} className="p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* All form fields with responsive classes */}
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Employee Number <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <input
                                            type="text"
                                            name="employeeNumber"
                                            value={formData.employeeNumber}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.employeeNumber ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="EMP001"
                                        />
                                    </div>
                                    {errors.employeeNumber && (
                                        <p className="mt-1 text-xs text-red-400">{errors.employeeNumber}</p>
                                    )}
                                </div>

                                {/* Continue with all other form fields using the same responsive pattern */}
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        First Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="FirstName"
                                        value={formData.FirstName}
                                        onChange={handleChange}
                                        className={`w-full bg-white/10 border ${errors.FirstName ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="John"
                                    />
                                    {errors.FirstName && (
                                        <p className="mt-1 text-xs text-red-400">{errors.FirstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Last Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="LastName"
                                        value={formData.LastName}
                                        onChange={handleChange}
                                        className={`w-full bg-white/10 border ${errors.LastName ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Doe"
                                    />
                                    {errors.LastName && (
                                        <p className="mt-1 text-xs text-red-400">{errors.LastName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="john.doe@company.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Position <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <input
                                            type="text"
                                            name="Position"
                                            value={formData.Position}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.Position ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    {errors.Position && (
                                        <p className="mt-1 text-xs text-red-400">{errors.Position}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Telephone <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <input
                                            type="text"
                                            name="Telephone"
                                            value={formData.Telephone}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.Telephone ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    {errors.Telephone && (
                                        <p className="mt-1 text-xs text-red-400">{errors.Telephone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Address <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <input
                                            type="text"
                                            name="Address"
                                            value={formData.Address}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.Address ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="123 Main St, City"
                                        />
                                    </div>
                                    {errors.Address && (
                                        <p className="mt-1 text-xs text-red-400">{errors.Address}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Gender <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <select
                                            name="Gender"
                                            value={formData.Gender}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.Gender ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="" className="text-gray-800">Select Gender</option>
                                            <option value="male" className="text-gray-800">Male</option>
                                            <option value="female" className="text-gray-800">Female</option>
                                            <option value="other" className="text-gray-800">Other</option>
                                        </select>
                                    </div>
                                    {errors.Gender && (
                                        <p className="mt-1 text-xs text-red-400">{errors.Gender}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Department <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        className={`w-full bg-white/10 border ${errors.departmentId ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="" className="text-gray-800">Select Department</option>
                                        {departments.map((dep) => (
                                            <option key={dep._id} value={dep._id} className="text-gray-800">
                                                {dep.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.departmentId && (
                                        <p className="mt-1 text-xs text-red-400">{errors.departmentId}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Date Hired
                                    </label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <input
                                            type="date"
                                            name="dateHired"
                                            value={formData.dateHired}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Salary
                                    </label>
                                    <div className="relative">
                                        <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                        <input
                                            type="number"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.salary ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                    {errors.salary && (
                                        <p className="mt-1 text-xs text-red-400">{errors.salary}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active" className="text-gray-800">Active</option>
                                        <option value="inactive" className="text-gray-800">Inactive</option>
                                        <option value="on leave" className="text-gray-800">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-full sm:w-auto px-4 md:px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors duration-200 text-sm md:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 text-sm md:text-base"
                                >
                                    {formLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Create
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal - Similar responsive updates */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/20">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-4 md:p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                    <FaEdit className="text-xl md:text-2xl" />
                                    Edit Employee
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                                >
                                    <FaTimes className="text-lg md:text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Reuse the same form fields as add modal */}
                        <form onSubmit={handleEdit} className="p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Copy all form fields from add modal with same responsive classes */}
                                {/* ... (same form fields as above) ... */}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-full sm:w-auto px-4 md:px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors duration-200 text-sm md:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 text-sm md:text-base"
                                >
                                    {formLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Employee Modal - Responsive */}
            {isViewModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="backdrop-blur-xl bg-white/10 rounded-2xl w-full max-w-2xl border border-white/20">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 md:p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                    <FaUserCircle className="text-xl md:text-2xl" />
                                    Employee Details
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                                >
                                    <FaTimes className="text-lg md:text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                                    {selectedEmployee.FirstName?.charAt(0)}{selectedEmployee.LastName?.charAt(0)}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-xl md:text-2xl font-bold text-white">
                                        {selectedEmployee.FirstName} {selectedEmployee.LastName}
                                    </h3>
                                    <p className="text-sm md:text-base text-blue-200">{selectedEmployee.Position}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedEmployee.status)}`}>
                                        {selectedEmployee.status || 'active'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                    <p className="text-xs text-blue-200">Employee Number</p>
                                    <p className="text-sm md:text-base font-semibold text-white">#{selectedEmployee.employeeNumber}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                    <p className="text-xs text-blue-200">Department</p>
                                    <p className="text-sm md:text-base font-semibold text-white">
                                        {selectedEmployee.departmentId?.departmentName || getDepartmentName(selectedEmployee.departmentId)}
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                    <p className="text-xs text-blue-200">Email</p>
                                    <p className="text-sm md:text-base font-semibold text-white">{selectedEmployee.email || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                    <p className="text-xs text-blue-200">Phone</p>
                                    <p className="text-sm md:text-base font-semibold text-white">{selectedEmployee.Telephone}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                    <p className="text-xs text-blue-200">Gender</p>
                                    <p className="text-sm md:text-base font-semibold text-white capitalize">{selectedEmployee.Gender}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                    <p className="text-xs text-blue-200">Date Hired</p>
                                    <p className="text-sm md:text-base font-semibold text-white">{formatDate(selectedEmployee.dateHired)}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 md:p-4 sm:col-span-2">
                                    <p className="text-xs text-blue-200">Address</p>
                                    <p className="text-sm md:text-base font-semibold text-white">{selectedEmployee.Address}</p>
                                </div>
                                {selectedEmployee.salary && (
                                    <div className="bg-white/5 rounded-lg p-3 md:p-4 sm:col-span-2">
                                        <p className="text-xs text-blue-200">Salary</p>
                                        <p className="text-lg md:text-xl font-bold text-green-400">{formatCurrency(selectedEmployee.salary)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-4 md:pt-6 border-t border-white/20">
                                <button
                                    onClick={closeModal}
                                    className="w-full sm:w-auto px-4 md:px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-sm md:text-base"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        closeModal();
                                        openEditModal(selectedEmployee);
                                    }}
                                    className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 text-sm md:text-base"
                                >
                                    Edit Employee
                                </button>
                            </div>
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

export default AllEmployees;
