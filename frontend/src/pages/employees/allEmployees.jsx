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
    FaEyeSlash
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function AllEmployees() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
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
    const [itemsPerPage] = useState(10);
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
        setCurrentPage(1); // Reset to first page when filters change
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
            // Handle both response structures
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
            // Calculate basic stats from employees if stats endpoint fails
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
        // Clear error for this field
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

        // Email validation if provided
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // Phone number validation
        if (formData.Telephone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(formData.Telephone)) {
            newErrors.Telephone = "Invalid phone number format";
        }

        // Salary validation
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

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format date
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
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 min-h-screen">
            <SideBar />
            
            {/* Main Content */}
            <div className="ml-80 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <FaUsers className="text-blue-300" />
                        Employee Management
                    </h1>
                    <p className="text-blue-200">
                        Manage and organize all your employees across different departments
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Employees</p>
                                <p className="text-2xl font-bold text-white">
                                    {statsLoading ? (
                                        <span className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        stats.totalEmployees || employees.length
                                    )}
                                </p>
                            </div>
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <FaUsers className="text-xl text-blue-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Active</p>
                                <p className="text-2xl font-bold text-white">
                                    {stats.activeEmployees || employees.filter(e => e.status === 'active').length}
                                </p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <FaUserCircle className="text-xl text-green-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Male/Female</p>
                                <p className="text-2xl font-bold text-white">
                                    {stats.byGender.male || employees.filter(e => e.Gender === 'male').length} / {stats.byGender.female || employees.filter(e => e.Gender === 'female').length}
                                </p>
                            </div>
                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                <FaVenusMars className="text-xl text-purple-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Salary</p>
                                <p className="text-lg font-bold text-white truncate max-w-[120px]">
                                    {formatCurrency(stats.totalSalary || employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0))}
                                </p>
                            </div>
                            <div className="bg-yellow-500/20 p-3 rounded-lg">
                                <FaMoneyBillWave className="text-xl text-yellow-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Departments</p>
                                <p className="text-2xl font-bold text-white">{departments.length}</p>
                            </div>
                            <div className="bg-indigo-500/20 p-3 rounded-lg">
                                <FaBuilding className="text-xl text-indigo-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/10">
                    <div className="flex flex-col gap-4">
                        {/* Top Row - Search and Add Button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                                <input
                                    type="text"
                                    placeholder="Search by name, ID, position, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-blue-300/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-3 ${showFilters ? 'bg-green-500' : 'bg-white/20'} hover:bg-green-500 rounded-lg text-white transition-all duration-200`}
                                    title="Toggle filters"
                                >
                                    <FaFilter className="text-sm" />
                                </button>

                                <button
                                    onClick={clearFilters}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all duration-200"
                                    title="Clear filters"
                                >
                                    <FaSync className="text-sm" />
                                </button>

                                <button
                                    onClick={openAddModal}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                >
                                    <FaUserPlus />
                                    Add Employee
                                </button>
                            </div>
                        </div>

                        {/* Bottom Row - Filters (Collapsible) */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/20">
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-2">
                                        Department
                                    </label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="w-full px-4 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                    <label className="block text-sm font-medium text-blue-200 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={selectedGender}
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="w-full px-4 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="" className="text-gray-800">All Genders</option>
                                        <option value="male" className="text-gray-800">Male</option>
                                        <option value="female" className="text-gray-800">Female</option>
                                        <option value="other" className="text-gray-800">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-4 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="" className="text-gray-800">All Status</option>
                                        <option value="active" className="text-gray-800">Active</option>
                                        <option value="inactive" className="text-gray-800">Inactive</option>
                                        <option value="on leave" className="text-gray-800">On Leave</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results count */}
                <div className="mb-4 text-blue-200">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees
                </div>

                {/* Employees Table */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employee #</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Position</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Gender</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                <span>Loading employees...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <FaUsers className="text-5xl text-gray-300 mb-4" />
                                                <p className="text-lg font-medium text-gray-600 mb-2">
                                                    {searchTerm || selectedDepartment || selectedGender || selectedStatus 
                                                        ? "No employees match your filters" 
                                                        : "No employees found"}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    {searchTerm || selectedDepartment || selectedGender || selectedStatus 
                                                        ? "Try adjusting your filters" 
                                                        : "Get started by adding your first employee"}
                                                </p>
                                                {(searchTerm || selectedDepartment || selectedGender || selectedStatus) && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        Clear Filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer" onClick={() => openViewModal(emp)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                                                    #{emp.employeeNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {emp.FirstName?.charAt(0)}{emp.LastName?.charAt(0)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {emp.FirstName} {emp.LastName}
                                                        </div>
                                                        {emp.email && (
                                                            <div className="text-xs text-gray-500">{emp.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {emp.Position}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDepartmentColor(emp.departmentId?._id || emp.departmentId)}`}>
                                                    {emp.departmentId?.departmentName || getDepartmentName(emp.departmentId)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {emp.Telephone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    emp.Gender === 'male' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : emp.Gender === 'female'
                                                        ? 'bg-pink-100 text-pink-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {emp.Gender}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(emp.status)}`}>
                                                    {emp.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(emp);
                                                    }}
                                                    className="inline-flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium mr-2 transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <FaEdit className="mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(emp._id);
                                                    }}
                                                    className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
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

                    {/* Pagination */}
                    {filteredEmployees.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaChevronLeft />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`px-4 py-2 rounded-lg ${
                                            currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FaUserPlus className="text-2xl" />
                                    Add New Employee
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreate} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Employee Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Employee Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="employeeNumber"
                                            value={formData.employeeNumber}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.employeeNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="EMP001"
                                        />
                                    </div>
                                    {errors.employeeNumber && (
                                        <p className="mt-1 text-sm text-red-500">{errors.employeeNumber}</p>
                                    )}
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="FirstName"
                                        value={formData.FirstName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.FirstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="John"
                                    />
                                    {errors.FirstName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.FirstName}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="LastName"
                                        value={formData.LastName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.LastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Doe"
                                    />
                                    {errors.LastName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.LastName}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="john.doe@company.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Position <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="Position"
                                            value={formData.Position}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Position ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    {errors.Position && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Position}</p>
                                    )}
                                </div>

                                {/* Telephone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telephone <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="Telephone"
                                            value={formData.Telephone}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Telephone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    {errors.Telephone && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Telephone}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="Address"
                                            value={formData.Address}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="123 Main St, City"
                                        />
                                    </div>
                                    {errors.Address && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Address}</p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <select
                                            name="Gender"
                                            value={formData.Gender}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    {errors.Gender && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Gender}</p>
                                    )}
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.departmentId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white`}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dep) => (
                                            <option key={dep._id} value={dep._id}>
                                                {dep.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.departmentId && (
                                        <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>
                                    )}
                                </div>

                                {/* Date Hired */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date Hired
                                    </label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="date"
                                            name="dateHired"
                                            value={formData.dateHired}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Salary */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Salary
                                    </label>
                                    <div className="relative">
                                        <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.salary ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                    {errors.salary && (
                                        <p className="mt-1 text-sm text-red-500">{errors.salary}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Create Employee
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FaEdit className="text-2xl" />
                                    Edit Employee
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Same form fields as add modal */}
                        <form onSubmit={handleEdit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Same form fields as add modal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Employee Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="employeeNumber"
                                            value={formData.employeeNumber}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.employeeNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                            placeholder="EMP001"
                                        />
                                    </div>
                                    {errors.employeeNumber && (
                                        <p className="mt-1 text-sm text-red-500">{errors.employeeNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="FirstName"
                                        value={formData.FirstName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.FirstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                        placeholder="John"
                                    />
                                    {errors.FirstName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.FirstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="LastName"
                                        value={formData.LastName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.LastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                        placeholder="Doe"
                                    />
                                    {errors.LastName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.LastName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                            placeholder="john.doe@company.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Position <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="Position"
                                            value={formData.Position}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Position ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    {errors.Position && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Position}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telephone <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="Telephone"
                                            value={formData.Telephone}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Telephone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    {errors.Telephone && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Telephone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="Address"
                                            value={formData.Address}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                            placeholder="123 Main St, City"
                                        />
                                    </div>
                                    {errors.Address && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Address}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <select
                                            name="Gender"
                                            value={formData.Gender}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.Gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    {errors.Gender && (
                                        <p className="mt-1 text-sm text-red-500">{errors.Gender}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.departmentId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white`}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dep) => (
                                            <option key={dep._id} value={dep._id}>
                                                {dep.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.departmentId && (
                                        <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date Hired
                                    </label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="date"
                                            name="dateHired"
                                            value={formData.dateHired}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Salary
                                    </label>
                                    <div className="relative">
                                        <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.salary ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                    {errors.salary && (
                                        <p className="mt-1 text-sm text-red-500">{errors.salary}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formLoading ? (
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
                        </form>
                    </div>
                </div>
            )}

            {/* View Employee Modal */}
            {isViewModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FaUserCircle className="text-2xl" />
                                    Employee Details
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                                    {selectedEmployee.FirstName?.charAt(0)}{selectedEmployee.LastName?.charAt(0)}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {selectedEmployee.FirstName} {selectedEmployee.LastName}
                                    </h3>
                                    <p className="text-gray-600">{selectedEmployee.Position}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedEmployee.status)}`}>
                                        {selectedEmployee.status || 'active'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Employee Number</p>
                                    <p className="text-lg font-semibold text-gray-900">#{selectedEmployee.employeeNumber}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedEmployee.departmentId?.departmentName || getDepartmentName(selectedEmployee.departmentId)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedEmployee.email || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedEmployee.Telephone}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedEmployee.Gender}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Date Hired</p>
                                    <p className="text-lg font-semibold text-gray-900">{formatDate(selectedEmployee.dateHired)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedEmployee.Address}</p>
                                </div>
                                {selectedEmployee.salary && (
                                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                        <p className="text-sm text-gray-500">Salary</p>
                                        <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedEmployee.salary)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        closeModal();
                                        openEditModal(selectedEmployee);
                                    }}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                                >
                                    Edit Employee
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllEmployees;