// allSalaries.jsx
import { useEffect, useState } from "react";
import SideBar from "../account/sidebar";
import { 
    FaFileUpload, 
    FaEdit, 
    FaTrash, 
    FaSearch, 
    FaFilter,
    FaSync,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaUserCircle,
    FaTimes,
    FaSave,
    FaEye,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaChartPie,
    FaDownload,
    FaPrint
} from "react-icons/fa";
import API from "../../components/api";

function Salaries() {
    const [salaries, setSalaries] = useState([]);
    const [filteredSalaries, setFilteredSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [stats, setStats] = useState({
        totalSalaries: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
        averageSalary: 0,
        byStatus: { paid: 0, pending: 0, cancelled: 0 }
    });
    const [formData, setFormData] = useState({
        employeeId: "",
        GrossSalary: "",
        TotalDeduction: "",
        month: "",
        year: new Date().getFullYear(),
        paymentMethod: "bank transfer",
        status: "pending",
        notes: ""
    });
    const [errors, setErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);

    // Fetch data on component mount
    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
        fetchSalaries();
        fetchStats();
    }, []);

    // Filter salaries based on search and filters
    useEffect(() => {
        let filtered = salaries;

        if (searchTerm) {
            filtered = filtered.filter(salary => 
                salary.employeeId?.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                salary.employeeId?.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                salary.employeeId?.employeeNumber?.toString().includes(searchTerm) ||
                salary.employeeId?.Position?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedMonth) {
            filtered = filtered.filter(s => s.month === parseInt(selectedMonth));
        }

        if (selectedYear) {
            filtered = filtered.filter(s => s.year === parseInt(selectedYear));
        }

        if (selectedStatus) {
            filtered = filtered.filter(s => s.status === selectedStatus);
        }

        setFilteredSalaries(filtered);
    }, [searchTerm, selectedMonth, selectedYear, selectedStatus, salaries]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/employees/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const employeeData = res.data.employees || res.data;
            setEmployees(employeeData);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/departments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(res.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/salaries/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const salaryData = res.data.salaries || res.data;
            setSalaries(salaryData);
            setFilteredSalaries(salaryData);
        } catch (error) {
            console.error("Error fetching salaries:", error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/salaries/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        window.location.href = '/login';
    };

    const getEmployeeName = (employeeId) => {
        if (!employeeId) return "Unknown";
        const emp = employees.find(e => e._id === employeeId);
        return emp ? `${emp.FirstName} ${emp.LastName}` : "Unknown";
    };

    const getDepartmentName = (employeeId) => {
        if (!employeeId) return "Unknown";
        const emp = employees.find(e => e._id === employeeId);
        if (!emp || !emp.departmentId) return "Unknown";
        
        if (typeof emp.departmentId === 'object') {
            return emp.departmentId.departmentName;
        }
        
        const dept = departments.find(d => d._id === emp.departmentId);
        return dept ? dept.departmentName : "Unknown";
    };

    const getMonthName = (monthNumber) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[monthNumber - 1] || "Unknown";
    };

    const getStatusBadge = (status) => {
        const badges = {
            'paid': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'paid': <FaCheckCircle className="text-green-500" />,
            'pending': <FaClock className="text-yellow-500" />,
            'cancelled': <FaTimesCircle className="text-red-500" />
        };
        return icons[status] || <FaClock />;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-calculate Net Salary
        if (name === 'GrossSalary' || name === 'TotalDeduction') {
            const gross = parseFloat(name === 'GrossSalary' ? value : formData.GrossSalary) || 0;
            const deduction = parseFloat(name === 'TotalDeduction' ? value : formData.TotalDeduction) || 0;
            const net = gross - deduction;
            setFormData(prev => ({
                ...prev,
                NetSalary: net >= 0 ? net : 0
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employeeId) newErrors.employeeId = "Employee is required";
        if (!formData.GrossSalary || formData.GrossSalary <= 0) newErrors.GrossSalary = "Valid gross salary is required";
        if (!formData.month) newErrors.month = "Month is required";
        if (!formData.year) newErrors.year = "Year is required";

        // Check if salary already exists for this employee/month/year
        const existingSalary = salaries.find(s => 
            s.employeeId === formData.employeeId && 
            s.month === parseInt(formData.month) && 
            s.year === parseInt(formData.year) &&
            (!selectedSalary || s._id !== selectedSalary._id)
        );

        if (existingSalary) {
            newErrors.employeeId = "Salary already exists for this employee in the selected month/year";
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
            const res = await API.post('/salaries/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(res.data.msg || "Salary created successfully");
            setIsCreateModalOpen(false);
            resetForm();
            fetchSalaries();
            fetchStats();
        } catch (error) {
            console.error("Error creating salary:", error);
            alert(error.response?.data?.msg || "Failed to create salary");
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
            const res = await API.put(`/salaries/edit/${selectedSalary._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(res.data.msg || "Salary updated successfully");
            setIsEditModalOpen(false);
            resetForm();
            fetchSalaries();
            fetchStats();
        } catch (error) {
            console.error("Error updating salary:", error);
            alert(error.response?.data?.msg || "Failed to update salary");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this salary record? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const res = await API.delete(`/salaries/remove/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                alert(res.data.msg || "Salary deleted successfully");
                fetchSalaries();
                fetchStats();
            } catch (error) {
                console.error("Error deleting salary:", error);
                alert(error.response?.data?.msg || "Failed to delete salary");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.put(`/salaries/edit/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Salary marked as ${newStatus}`);
            fetchSalaries();
            fetchStats();
        } catch (error) {
            console.error("Error updating status:", error);
            alert(error.response?.data?.msg || "Failed to update status");
        }
    };

    const openCreateModal = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (salary) => {
        setSelectedSalary(salary);
        setFormData({
            employeeId: salary.employeeId?._id || salary.employeeId,
            GrossSalary: salary.GrossSalary,
            TotalDeduction: salary.TotalDeduction,
            month: salary.month,
            year: salary.year,
            paymentMethod: salary.paymentMethod || "bank transfer",
            status: salary.status || "pending",
            notes: salary.notes || ""
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (salary) => {
        setSelectedSalary(salary);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            employeeId: "",
            GrossSalary: "",
            TotalDeduction: "",
            month: "",
            year: new Date().getFullYear(),
            paymentMethod: "bank transfer",
            status: "pending",
            notes: ""
        });
        setErrors({});
        setSelectedSalary(null);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsViewModalOpen(false);
        resetForm();
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedMonth("");
        setSelectedYear("");
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

    // Available years (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 min-h-screen">
            <SideBar />

            {/* Main Content */}
            <div className="ml-80 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-300" />
                        Salary Management
                    </h1>
                    <p className="text-blue-200">
                        Manage employee salaries, track payments, and generate reports
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Salaries</p>
                                <p className="text-2xl font-bold text-white">
                                    {statsLoading ? (
                                        <span className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        stats.totalSalaries
                                    )}
                                </p>
                            </div>
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <FaMoneyBillWave className="text-xl text-blue-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Amount</p>
                                <p className="text-lg font-bold text-white truncate max-w-[120px]">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <FaMoneyBillWave className="text-xl text-green-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Paid</p>
                                <p className="text-lg font-bold text-white">{formatCurrency(stats.totalPaid)}</p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <FaCheckCircle className="text-xl text-green-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Pending</p>
                                <p className="text-lg font-bold text-white">{formatCurrency(stats.totalPending)}</p>
                            </div>
                            <div className="bg-yellow-500/20 p-3 rounded-lg">
                                <FaClock className="text-xl text-yellow-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Average</p>
                                <p className="text-lg font-bold text-white">{formatCurrency(stats.averageSalary)}</p>
                            </div>
                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                <FaChartPie className="text-xl text-purple-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/10">
                    <div className="flex flex-col gap-4">
                        {/* Top Row */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                                <input
                                    type="text"
                                    placeholder="Search by employee name, position..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-blue-300/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={clearFilters}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all duration-200"
                                    title="Clear filters"
                                >
                                    <FaSync className="text-sm" />
                                </button>

                                <button
                                    onClick={openCreateModal}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                >
                                    <FaFileUpload />
                                    Add Salary
                                </button>
                            </div>
                        </div>

                        {/* Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/20">
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    Month
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="" className="text-gray-800">All Months</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month} className="text-gray-800">
                                            {getMonthName(month)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/20 border border-blue-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="" className="text-gray-800">All Years</option>
                                    {years.map(year => (
                                        <option key={year} value={year} className="text-gray-800">
                                            {year}
                                        </option>
                                    ))}
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
                                    <option value="paid" className="text-gray-800">Paid</option>
                                    <option value="pending" className="text-gray-800">Pending</option>
                                    <option value="cancelled" className="text-gray-800">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div className="mb-4 text-blue-200">
                    Showing {filteredSalaries.length} of {salaries.length} salary records
                </div>

                {/* Salaries Table */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employee</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Gross Salary</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Deduction</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Net Salary</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Period</th>
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
                                                <span>Loading salaries...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSalaries.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <FaMoneyBillWave className="text-5xl text-gray-300 mb-4" />
                                                <p className="text-lg font-medium text-gray-600 mb-2">
                                                    {searchTerm || selectedMonth || selectedYear || selectedStatus
                                                        ? "No salaries match your filters"
                                                        : "No salary records found"}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    {searchTerm || selectedMonth || selectedYear || selectedStatus
                                                        ? "Try adjusting your filters"
                                                        : "Get started by adding your first salary record"}
                                                </p>
                                                {(searchTerm || selectedMonth || selectedYear || selectedStatus) && (
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
                                    filteredSalaries.map((salary) => {
                                        const employeeName = salary.employeeId 
                                            ? `${salary.employeeId.FirstName || ''} ${salary.employeeId.LastName || ''}`
                                            : getEmployeeName(salary.employeeId);
                                        
                                        const departmentName = salary.employeeId?.departmentId?.departmentName || 
                                            getDepartmentName(salary.employeeId);

                                        return (
                                            <tr 
                                                key={salary._id} 
                                                className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                                                onClick={() => openViewModal(salary)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                            {salary.employeeId?.FirstName?.charAt(0) || 'E'}
                                                            {salary.employeeId?.LastName?.charAt(0) || ''}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {employeeName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {salary.employeeId?.Position || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                        {departmentName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatCurrency(salary.GrossSalary)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatCurrency(salary.TotalDeduction)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-semibold text-green-600">
                                                        {formatCurrency(salary.NetSalary)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {getMonthName(salary.month)} {salary.year}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(salary.status)}`}>
                                                        {getStatusIcon(salary.status)}
                                                        {salary.status?.charAt(0).toUpperCase() + salary.status?.slice(1) || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(salary);
                                                        }}
                                                        className="inline-flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium mr-2 transition-all duration-200 transform hover:scale-105"
                                                    >
                                                        <FaEdit className="mr-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(salary._id);
                                                        }}
                                                        className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                                                    >
                                                        <FaTrash className="mr-1" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Salary Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FaFileUpload className="text-2xl" />
                                    Add New Salary
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
                            <div className="space-y-4">
                                {/* Employee Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Employee <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.FirstName} {emp.LastName} - {emp.Position} ({emp.employeeNumber})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.employeeId && (
                                        <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
                                    )}
                                </div>

                                {/* Gross Salary */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gross Salary ($) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="GrossSalary"
                                        value={formData.GrossSalary}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.GrossSalary ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="5000"
                                        min="0"
                                        step="100"
                                    />
                                    {errors.GrossSalary && (
                                        <p className="mt-1 text-sm text-red-500">{errors.GrossSalary}</p>
                                    )}
                                </div>

                                {/* Total Deduction */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Deduction ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="TotalDeduction"
                                        value={formData.TotalDeduction}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        min="0"
                                        step="100"
                                    />
                                </div>

                                {/* Net Salary (Auto-calculated) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Net Salary ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="NetSalary"
                                        value={formData.GrossSalary - (formData.TotalDeduction || 0)}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    />
                                </div>

                                {/* Month and Year */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Month <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="month"
                                            value={formData.month}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border ${errors.month ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Select Month</option>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                <option key={month} value={month}>
                                                    {getMonthName(month)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.month && (
                                            <p className="mt-1 text-sm text-red-500">{errors.month}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Year <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border ${errors.year ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Select Year</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.year && (
                                            <p className="mt-1 text-sm text-red-500">{errors.year}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="bank transfer">Bank Transfer</option>
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Additional notes..."
                                    ></textarea>
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
                                            Create Salary
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Salary Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FaEdit className="text-2xl" />
                                    Edit Salary
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
                        <form onSubmit={handleEdit} className="p-6">
                            <div className="space-y-4">
                                {/* Employee (Read-only in edit) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Employee
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedSalary ? getEmployeeName(selectedSalary.employeeId) : ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    />
                                </div>

                                {/* Gross Salary */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gross Salary ($) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="GrossSalary"
                                        value={formData.GrossSalary}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.GrossSalary ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                        min="0"
                                        step="100"
                                    />
                                    {errors.GrossSalary && (
                                        <p className="mt-1 text-sm text-red-500">{errors.GrossSalary}</p>
                                    )}
                                </div>

                                {/* Total Deduction */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Deduction ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="TotalDeduction"
                                        value={formData.TotalDeduction}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        min="0"
                                        step="100"
                                    />
                                </div>

                                {/* Net Salary */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Net Salary ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.GrossSalary - (formData.TotalDeduction || 0)}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    />
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="bank transfer">Bank Transfer</option>
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Additional notes..."
                                    ></textarea>
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

            {/* View Salary Modal */}
            {isViewModalOpen && selectedSalary && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FaMoneyBillWave className="text-2xl" />
                                    Salary Details
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
                                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedSalary.employeeId?.FirstName?.charAt(0) || 'E'}
                                    {selectedSalary.employeeId?.LastName?.charAt(0) || ''}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedSalary.employeeId 
                                            ? `${selectedSalary.employeeId.FirstName} ${selectedSalary.employeeId.LastName}`
                                            : getEmployeeName(selectedSalary.employeeId)}
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedSalary.employeeId?.Position || 'N/A'} • 
                                        Employee #{selectedSalary.employeeId?.employeeNumber || 'N/A'}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedSalary.status)}`}>
                                        {getStatusIcon(selectedSalary.status)}
                                        {selectedSalary.status?.charAt(0).toUpperCase() + selectedSalary.status?.slice(1) || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedSalary.employeeId?.departmentId?.departmentName || 
                                         getDepartmentName(selectedSalary.employeeId)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {getMonthName(selectedSalary.month)} {selectedSalary.year}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Gross Salary</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(selectedSalary.GrossSalary)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Deduction</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        -{formatCurrency(selectedSalary.TotalDeduction)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                    <p className="text-sm text-gray-500">Net Salary</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(selectedSalary.NetSalary)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {selectedSalary.paymentMethod || 'Bank Transfer'}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Payment Date</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedSalary.paymentDate 
                                            ? new Date(selectedSalary.paymentDate).toLocaleDateString() 
                                            : 'Not paid yet'}
                                    </p>
                                </div>

                                {selectedSalary.notes && (
                                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                        <p className="text-sm text-gray-500">Notes</p>
                                        <p className="text-gray-900">{selectedSalary.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Status Actions */}
                            {selectedSalary.status === 'pending' && (
                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedSalary._id, 'cancelled');
                                            closeModal();
                                        }}
                                        className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                    >
                                        Cancel Salary
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedSalary._id, 'paid');
                                            closeModal();
                                        }}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
                                    >
                                        Mark as Paid
                                    </button>
                                </div>
                            )}

                            {selectedSalary.status !== 'pending' && (
                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                    <button
                                        onClick={closeModal}
                                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeModal();
                                            openEditModal(selectedSalary);
                                        }}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                                    >
                                        Edit Salary
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Salaries;
