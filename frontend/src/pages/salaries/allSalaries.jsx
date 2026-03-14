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
    FaPrint,
    FaBars,
    FaChevronLeft,
    FaChevronRight,
    FaSortAmountDown,
    FaSortAmountUp,
    FaStar,
    FaRegStar,
    FaFileExport,
    FaPercentage,
    FaDollarSign
} from "react-icons/fa";
import API from "../../components/api";

function Salaries() {
    const [salaries, setSalaries] = useState([]);
    const [filteredSalaries, setFilteredSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('date');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [favorites, setFavorites] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
    
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
        loadFavorites();
    }, []);

    const loadFavorites = () => {
        const saved = localStorage.getItem('salaryFavorites');
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
    };

    const toggleFavorite = (salaryId) => {
        let newFavorites;
        if (favorites.includes(salaryId)) {
            newFavorites = favorites.filter(id => id !== salaryId);
        } else {
            newFavorites = [...favorites, salaryId];
        }
        setFavorites(newFavorites);
        localStorage.setItem('salaryFavorites', JSON.stringify(newFavorites));
    };

    // Filter salaries based on search and filters
    useEffect(() => {
        let filtered = salaries;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(salary => 
                salary.employeeId?.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                salary.employeeId?.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                salary.employeeId?.employeeNumber?.toString().includes(searchTerm) ||
                salary.employeeId?.Position?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Month filter
        if (selectedMonth) {
            filtered = filtered.filter(s => s.month === parseInt(selectedMonth));
        }

        // Year filter
        if (selectedYear) {
            filtered = filtered.filter(s => s.year === parseInt(selectedYear));
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(s => s.status === selectedStatus);
        }

        // Department filter
        if (selectedDepartment) {
            filtered = filtered.filter(s => {
                const deptId = s.employeeId?.departmentId?._id || s.employeeId?.departmentId;
                return deptId === selectedDepartment;
            });
        }

        // Salary range filter
        if (salaryRange.min !== '') {
            filtered = filtered.filter(s => s.NetSalary >= Number(salaryRange.min));
        }
        if (salaryRange.max !== '') {
            filtered = filtered.filter(s => s.NetSalary <= Number(salaryRange.max));
        }

        // Favorites filter
        if (showFavoritesOnly) {
            filtered = filtered.filter(s => favorites.includes(s._id));
        }

        // Sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                const dateA = new Date(a.year, a.month - 1);
                const dateB = new Date(b.year, b.month - 1);
                comparison = dateA - dateB;
            } else if (sortBy === 'amount') {
                comparison = a.NetSalary - b.NetSalary;
            } else if (sortBy === 'name') {
                const nameA = `${a.employeeId?.FirstName} ${a.employeeId?.LastName}`;
                const nameB = `${b.employeeId?.FirstName} ${b.employeeId?.LastName}`;
                comparison = nameA.localeCompare(nameB);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredSalaries(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedMonth, selectedYear, selectedStatus, selectedDepartment, salaries, sortOrder, sortBy, salaryRange, showFavoritesOnly, favorites]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSalaries.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);

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
            'paid': 'bg-green-500/20 text-green-300 border border-green-500/30',
            'pending': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
            'cancelled': 'bg-red-500/20 text-red-300 border border-red-500/30'
        };
        return badges[status] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'paid': <FaCheckCircle className="text-green-400" />,
            'pending': <FaClock className="text-yellow-400" />,
            'cancelled': <FaTimesCircle className="text-red-400" />
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
        setSelectedDepartment("");
        setSalaryRange({ min: '', max: '' });
        setShowFavoritesOnly(false);
    };

    // Export functions
    const exportToCSV = () => {
        const headers = ['Employee', 'Department', 'Period', 'Gross', 'Deduction', 'Net', 'Status'];
        const data = filteredSalaries.map(s => {
            const empName = s.employeeId ? `${s.employeeId.FirstName} ${s.employeeId.LastName}` : getEmployeeName(s.employeeId);
            const deptName = s.employeeId?.departmentId?.departmentName || getDepartmentName(s.employeeId);
            return [
                empName,
                deptName,
                `${getMonthName(s.month)} ${s.year}`,
                s.GrossSalary,
                s.TotalDeduction,
                s.NetSalary,
                s.status
            ];
        });
        
        const csvContent = [headers, ...data]
            .map(row => row.join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salaries-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Salaries Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #2563eb; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #2563eb; color: white; padding: 10px; text-align: left; }
                        td { border: 1px solid #ddd; padding: 8px; }
                        tr:nth-child(even) { background: #f9fafb; }
                        .summary { margin-bottom: 20px; }
                        .paid { color: green; }
                        .pending { color: orange; }
                        .cancelled { color: red; }
                    </style>
                </head>
                <body>
                    <h1>Salaries Report</h1>
                    <div class="summary">
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Records:</strong> ${filteredSalaries.length}</p>
                        <p><strong>Total Amount:</strong> $${stats.totalAmount.toLocaleString()}</p>
                        <p><strong>Paid:</strong> $${stats.totalPaid.toLocaleString()}</p>
                        <p><strong>Pending:</strong> $${stats.totalPending.toLocaleString()}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Period</th>
                                <th>Gross</th>
                                <th>Deduction</th>
                                <th>Net</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredSalaries.map(s => `
                                <tr>
                                    <td>${s.employeeId ? `${s.employeeId.FirstName} ${s.employeeId.LastName}` : getEmployeeName(s.employeeId)}</td>
                                    <td>${s.employeeId?.departmentId?.departmentName || getDepartmentName(s.employeeId)}</td>
                                    <td>${getMonthName(s.month)} ${s.year}</td>
                                    <td>$${s.GrossSalary?.toLocaleString() || 0}</td>
                                    <td>$${s.TotalDeduction?.toLocaleString() || 0}</td>
                                    <td>$${s.NetSalary?.toLocaleString() || 0}</td>
                                    <td class="${s.status}">${s.status}</td>
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

    // Available years (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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

            <SideBar />

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
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <FaMoneyBillWave className="text-green-300" />
                        Salary Management
                    </h1>
                    <p className="text-sm md:text-base text-blue-200">
                        Manage employee salaries, track payments, and generate reports
                    </p>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total</p>
                                <p className="text-xl md:text-2xl font-bold text-white">
                                    {statsLoading ? (
                                        <span className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        stats.totalSalaries
                                    )}
                                </p>
                            </div>
                            <div className="bg-blue-500/20 p-2 md:p-3 rounded-lg">
                                <FaMoneyBillWave className="text-lg md:text-xl text-blue-300" />
                            </div>
                        </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Total Amount</p>
                                <p className="text-sm md:text-lg font-bold text-white truncate max-w-[100px] md:max-w-[120px]">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                            <div className="bg-green-500/20 p-2 md:p-3 rounded-lg">
                                <FaDollarSign className="text-lg md:text-xl text-green-300" />
                            </div>
                        </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Paid</p>
                                <p className="text-sm md:text-lg font-bold text-green-300 truncate max-w-[100px] md:max-w-[120px]">
                                    {formatCurrency(stats.totalPaid)}
                                </p>
                            </div>
                            <div className="bg-green-500/20 p-2 md:p-3 rounded-lg">
                                <FaCheckCircle className="text-lg md:text-xl text-green-300" />
                            </div>
                        </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Pending</p>
                                <p className="text-sm md:text-lg font-bold text-yellow-300 truncate max-w-[100px] md:max-w-[120px]">
                                    {formatCurrency(stats.totalPending)}
                                </p>
                            </div>
                            <div className="bg-yellow-500/20 p-2 md:p-3 rounded-lg">
                                <FaClock className="text-lg md:text-xl text-yellow-300" />
                            </div>
                        </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-xs uppercase">Average</p>
                                <p className="text-sm md:text-lg font-bold text-purple-300 truncate max-w-[100px] md:max-w-[120px]">
                                    {formatCurrency(stats.averageSalary)}
                                </p>
                            </div>
                            <div className="bg-purple-500/20 p-2 md:p-3 rounded-lg">
                                <FaPercentage className="text-lg md:text-xl text-purple-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-white/20">
                    <div className="flex flex-col gap-4">
                        {/* Top Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm md:text-base" />
                                <input
                                    type="text"
                                    placeholder="Search by employee..."
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
                                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
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

                                <button
                                    onClick={clearFilters}
                                    className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
                                    title="Clear filters"
                                >
                                    <FaSync className="text-sm md:text-base" />
                                </button>

                                <button
                                    onClick={openCreateModal}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                                >
                                    <FaFileUpload className="text-sm md:text-base" />
                                    <span className="hidden sm:inline">Add Salary</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
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
                                        <option value="date" className="text-gray-800">Date</option>
                                        <option value="amount" className="text-gray-800">Amount</option>
                                        <option value="name" className="text-gray-800">Employee Name</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Department</label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="" className="text-gray-800">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept._id} className="text-gray-800">
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Min Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Min $"
                                        value={salaryRange.min}
                                        onChange={(e) => setSalaryRange({...salaryRange, min: e.target.value})}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-blue-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-blue-200 mb-1">Max Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Max $"
                                        value={salaryRange.max}
                                        onChange={(e) => setSalaryRange({...salaryRange, max: e.target.value})}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-blue-200"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Export Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={exportToCSV}
                        className="px-3 py-1 md:px-4 md:py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-xs md:text-sm flex items-center gap-2 transition-all duration-200 border border-green-500/30"
                    >
                        <FaDownload />
                        Export CSV
                    </button>
                    <button
                        onClick={printReport}
                        className="px-3 py-1 md:px-4 md:py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs md:text-sm flex items-center gap-2 transition-all duration-200 border border-purple-500/30"
                    >
                        <FaPrint />
                        Print Report
                    </button>
                </div>

                {/* Results count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <p className="text-xs md:text-sm text-blue-200">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSalaries.length)} of {filteredSalaries.length} records
                        {showFavoritesOnly && " (favorites only)"}
                    </p>
                    {filteredSalaries.length > 0 && (
                        <p className="text-xs md:text-sm text-blue-200">
                            Page {currentPage} of {totalPages}
                        </p>
                    )}
                </div>

                {/* Salaries Table - Desktop */}
                <div className="hidden md:block backdrop-blur-xl bg-white/10 rounded-xl shadow-xl overflow-hidden border border-white/20">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Favorite</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Employee</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Department</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Gross</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Deduction</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Net</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Period</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white">Status</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 md:px-6 py-8 text-center text-white">
                                            <div className="flex justify-center items-center">
                                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="ml-3">Loading salaries...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 md:px-6 py-8 text-center text-white">
                                            {searchTerm || selectedMonth || selectedYear || selectedStatus || selectedDepartment || showFavoritesOnly
                                                ? "No salaries match your filters"
                                                : "No salary records found"}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((salary) => {
                                        const employeeName = salary.employeeId 
                                            ? `${salary.employeeId.FirstName || ''} ${salary.employeeId.LastName || ''}`
                                            : getEmployeeName(salary.employeeId);
                                        
                                        const departmentName = salary.employeeId?.departmentId?.departmentName || 
                                            getDepartmentName(salary.employeeId);

                                        return (
                                            <tr 
                                                key={salary._id} 
                                                className="hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                                                onClick={() => openViewModal(salary)}
                                            >
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(salary._id); }}
                                                        className="text-yellow-400 hover:scale-110 transition-transform"
                                                    >
                                                        {favorites.includes(salary._id) ? <FaStar /> : <FaRegStar />}
                                                    </button>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                                                            {salary.employeeId?.FirstName?.charAt(0) || 'E'}
                                                            {salary.employeeId?.LastName?.charAt(0) || ''}
                                                        </div>
                                                        <div className="ml-2 md:ml-3">
                                                            <div className="text-xs md:text-sm font-medium text-white">
                                                                {employeeName.length > 15 ? employeeName.substring(0, 15) + '...' : employeeName}
                                                            </div>
                                                            <div className="text-xs text-blue-300">
                                                                {salary.employeeId?.Position || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                    <span className="px-2 md:px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
                                                        {departmentName.length > 10 ? departmentName.substring(0, 10) + '...' : departmentName}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-white">
                                                    {formatCurrency(salary.GrossSalary)}
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-red-300">
                                                    -{formatCurrency(salary.TotalDeduction)}
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                    <span className="font-semibold text-green-400 text-xs md:text-sm">
                                                        {formatCurrency(salary.NetSalary)}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-blue-300">
                                                    {getMonthName(salary.month).substring(0, 3)} {salary.year}
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(salary.status)}`}>
                                                        {getStatusIcon(salary.status)}
                                                        <span className="hidden lg:inline">{salary.status?.charAt(0).toUpperCase() + salary.status?.slice(1) || 'Pending'}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openEditModal(salary); }}
                                                        className="inline-flex cursor-pointer items-center px-2 md:px-3 py-1 md:py-2 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white rounded-lg text-xs md:text-sm font-medium mr-1 transition-all duration-200 transform hover:scale-105 border border-green-500/30"
                                                    >
                                                        <FaEdit className="text-xs md:text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(salary._id); }}
                                                        className="inline-flex cursor-pointer items-center px-2 md:px-3 py-1 md:py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-red-500/30"
                                                    >
                                                        <FaTrash className="text-xs md:text-sm" />
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="text-center text-white py-8">
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p>Loading salaries...</p>
                        </div>
                    ) : currentItems.length === 0 ? (
                        <div className="text-center text-white py-8 backdrop-blur-xl bg-white/10 rounded-xl p-6">
                            <FaMoneyBillWave className="text-4xl text-blue-300 mx-auto mb-4 opacity-50" />
                            <p className="text-white">
                                {searchTerm || selectedMonth || selectedYear || selectedStatus || selectedDepartment || showFavoritesOnly
                                    ? "No salaries match your filters"
                                    : "No salary records found"}
                            </p>
                        </div>
                    ) : (
                        currentItems.map((salary) => {
                            const employeeName = salary.employeeId 
                                ? `${salary.employeeId.FirstName || ''} ${salary.employeeId.LastName || ''}`
                                : getEmployeeName(salary.employeeId);
                            
                            const departmentName = salary.employeeId?.departmentId?.departmentName || 
                                getDepartmentName(salary.employeeId);

                            return (
                                <div key={salary._id} className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {salary.employeeId?.FirstName?.charAt(0) || 'E'}
                                                {salary.employeeId?.LastName?.charAt(0) || ''}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{employeeName}</h3>
                                                <p className="text-xs text-blue-300">{salary.employeeId?.Position || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleFavorite(salary._id)}
                                            className="text-yellow-400"
                                        >
                                            {favorites.includes(salary._id) ? <FaStar size={18} /> : <FaRegStar size={18} />}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <p className="text-xs text-blue-200">Department</p>
                                            <p className="text-sm font-semibold text-white truncate">{departmentName}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <p className="text-xs text-blue-200">Period</p>
                                            <p className="text-sm font-semibold text-white">{getMonthName(salary.month).substring(0, 3)} {salary.year}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <p className="text-xs text-blue-200">Gross</p>
                                            <p className="text-sm font-semibold text-white">{formatCurrency(salary.GrossSalary)}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <p className="text-xs text-blue-200">Net</p>
                                            <p className="text-sm font-semibold text-green-400">{formatCurrency(salary.NetSalary)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(salary.status)}`}>
                                            {getStatusIcon(salary.status)}
                                            {salary.status?.charAt(0).toUpperCase() + salary.status?.slice(1) || 'Pending'}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-white/10">
                                        <button
                                            onClick={() => openViewModal(salary)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg text-sm transition-all"
                                        >
                                            <FaEye />
                                            View
                                        </button>
                                        <button
                                            onClick={() => openEditModal(salary)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white rounded-lg text-sm transition-all"
                                        >
                                            <FaEdit />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(salary._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-sm transition-all"
                                        >
                                            <FaTrash />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {filteredSalaries.length > 0 && (
                    <div className="mt-4 md:mt-6 backdrop-blur-xl bg-white/10 rounded-xl px-4 md:px-6 py-3 md:py-4 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs md:text-sm text-blue-200 order-2 sm:order-1">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-1 md:gap-2 order-1 sm:order-2">
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

                {/* Create Salary Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                        <FaFileUpload className="text-xl md:text-2xl" />
                                        Add New Salary
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
                                <div className="space-y-3 md:space-y-4">
                                    {/* Employee Selection */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Employee <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.employeeId ? 'border-red-500' : 'border-white/20'} rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="" className="text-gray-800">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id} className="text-gray-800">
                                                    {emp.FirstName} {emp.LastName} - {emp.Position}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.employeeId && (
                                            <p className="mt-1 text-xs text-red-400">{errors.employeeId}</p>
                                        )}
                                    </div>

                                    {/* Gross Salary */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Gross Salary ($) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="GrossSalary"
                                            value={formData.GrossSalary}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.GrossSalary ? 'border-red-500' : 'border-white/20'} rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="5000"
                                            min="0"
                                            step="100"
                                        />
                                        {errors.GrossSalary && (
                                            <p className="mt-1 text-xs text-red-400">{errors.GrossSalary}</p>
                                        )}
                                    </div>

                                    {/* Total Deduction */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Total Deduction ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="TotalDeduction"
                                            value={formData.TotalDeduction}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            min="0"
                                            step="100"
                                        />
                                    </div>

                                    {/* Net Salary (Auto-calculated) */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Net Salary ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.GrossSalary - (formData.TotalDeduction || 0)}
                                            disabled
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-gray-300"
                                        />
                                    </div>

                                    {/* Month and Year */}
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                                Month <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                name="month"
                                                value={formData.month}
                                                onChange={handleChange}
                                                className={`w-full bg-white/10 border ${errors.month ? 'border-red-500' : 'border-white/20'} rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            >
                                                <option value="" className="text-gray-800">Select Month</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <option key={month} value={month} className="text-gray-800">
                                                        {getMonthName(month)}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.month && (
                                                <p className="mt-1 text-xs text-red-400">{errors.month}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                                Year <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                name="year"
                                                value={formData.year}
                                                onChange={handleChange}
                                                className={`w-full bg-white/10 border ${errors.year ? 'border-red-500' : 'border-white/20'} rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            >
                                                <option value="" className="text-gray-800">Select Year</option>
                                                {years.map(year => (
                                                    <option key={year} value={year} className="text-gray-800">
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.year && (
                                                <p className="mt-1 text-xs text-red-400">{errors.year}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="bank transfer" className="text-gray-800">Bank Transfer</option>
                                            <option value="cash" className="text-gray-800">Cash</option>
                                            <option value="check" className="text-gray-800">Check</option>
                                        </select>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Additional notes..."
                                        ></textarea>
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
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-4 md:p-6 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                        <FaEdit className="text-xl md:text-2xl" />
                                        Edit Salary
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
                            <form onSubmit={handleEdit} className="p-4 md:p-6">
                                <div className="space-y-3 md:space-y-4">
                                    {/* Employee (Read-only) */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Employee
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedSalary ? getEmployeeName(selectedSalary.employeeId) : ''}
                                            disabled
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-gray-300"
                                        />
                                    </div>

                                    {/* Gross Salary */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Gross Salary ($) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="GrossSalary"
                                            value={formData.GrossSalary}
                                            onChange={handleChange}
                                            className={`w-full bg-white/10 border ${errors.GrossSalary ? 'border-red-500' : 'border-white/20'} rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                                            min="0"
                                            step="100"
                                        />
                                        {errors.GrossSalary && (
                                            <p className="mt-1 text-xs text-red-400">{errors.GrossSalary}</p>
                                        )}
                                    </div>

                                    {/* Total Deduction */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Total Deduction ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="TotalDeduction"
                                            value={formData.TotalDeduction}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                            min="0"
                                            step="100"
                                        />
                                    </div>

                                    {/* Net Salary */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Net Salary ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.GrossSalary - (formData.TotalDeduction || 0)}
                                            disabled
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-gray-300"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="pending" className="text-gray-800">Pending</option>
                                            <option value="paid" className="text-gray-800">Paid</option>
                                            <option value="cancelled" className="text-gray-800">Cancelled</option>
                                        </select>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="bank transfer" className="text-gray-800">Bank Transfer</option>
                                            <option value="cash" className="text-gray-800">Cash</option>
                                            <option value="check" className="text-gray-800">Check</option>
                                        </select>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-blue-200 mb-1 md:mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="Additional notes..."
                                        ></textarea>
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
                        <div className="backdrop-blur-xl bg-white/10 rounded-2xl w-full max-w-2xl border border-white/20">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 md:p-6 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                        <FaMoneyBillWave className="text-xl md:text-2xl" />
                                        Salary Details
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
                                        {selectedSalary.employeeId?.FirstName?.charAt(0) || 'E'}
                                        {selectedSalary.employeeId?.LastName?.charAt(0) || ''}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-xl md:text-2xl font-bold text-white">
                                            {selectedSalary.employeeId 
                                                ? `${selectedSalary.employeeId.FirstName} ${selectedSalary.employeeId.LastName}`
                                                : getEmployeeName(selectedSalary.employeeId)}
                                        </h3>
                                        <p className="text-sm md:text-base text-blue-200">
                                            {selectedSalary.employeeId?.Position || 'N/A'} • 
                                            #{selectedSalary.employeeId?.employeeNumber || 'N/A'}
                                        </p>
                                        <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedSalary.status)}`}>
                                            {getStatusIcon(selectedSalary.status)}
                                            {selectedSalary.status?.charAt(0).toUpperCase() + selectedSalary.status?.slice(1) || 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                        <p className="text-xs text-blue-200">Department</p>
                                        <p className="text-sm md:text-base font-semibold text-white">
                                            {selectedSalary.employeeId?.departmentId?.departmentName || 
                                             getDepartmentName(selectedSalary.employeeId)}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                        <p className="text-xs text-blue-200">Period</p>
                                        <p className="text-sm md:text-base font-semibold text-white">
                                            {getMonthName(selectedSalary.month)} {selectedSalary.year}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                        <p className="text-xs text-blue-200">Gross Salary</p>
                                        <p className="text-sm md:text-base font-semibold text-green-400">
                                            {formatCurrency(selectedSalary.GrossSalary)}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                        <p className="text-xs text-blue-200">Total Deduction</p>
                                        <p className="text-sm md:text-base font-semibold text-red-400">
                                            -{formatCurrency(selectedSalary.TotalDeduction)}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-3 md:p-4 sm:col-span-2">
                                        <p className="text-xs text-blue-200">Net Salary</p>
                                        <p className="text-xl md:text-2xl font-bold text-green-400">
                                            {formatCurrency(selectedSalary.NetSalary)}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                        <p className="text-xs text-blue-200">Payment Method</p>
                                        <p className="text-sm md:text-base font-semibold text-white capitalize">
                                            {selectedSalary.paymentMethod || 'Bank Transfer'}
                                        </p>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-3 md:p-4">
                                        <p className="text-xs text-blue-200">Payment Date</p>
                                        <p className="text-sm md:text-base font-semibold text-white">
                                            {selectedSalary.paymentDate 
                                                ? new Date(selectedSalary.paymentDate).toLocaleDateString() 
                                                : 'Not paid yet'}
                                        </p>
                                    </div>

                                    {selectedSalary.notes && (
                                        <div className="bg-white/5 rounded-lg p-3 md:p-4 sm:col-span-2">
                                            <p className="text-xs text-blue-200">Notes</p>
                                            <p className="text-sm md:text-base text-white">{selectedSalary.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Status Actions */}
                                {selectedSalary.status === 'pending' && (
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-4 md:pt-6 border-t border-white/20">
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedSalary._id, 'cancelled');
                                                closeModal();
                                            }}
                                            className="w-full sm:w-auto px-4 md:px-6 py-2 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/20 transition-colors duration-200 text-sm md:text-base"
                                        >
                                            Cancel Salary
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedSalary._id, 'paid');
                                                closeModal();
                                            }}
                                            className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 text-sm md:text-base"
                                        >
                                            Mark as Paid
                                        </button>
                                    </div>
                                )}

                                {selectedSalary.status !== 'pending' && (
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-4 md:pt-6 border-t border-white/20">
                                        <button
                                            onClick={closeModal}
                                            className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-white rounded-lg transition-all duration-200 text-sm md:text-base"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                closeModal();
                                                openEditModal(selectedSalary);
                                            }}
                                            className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 text-sm md:text-base"
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

export default Salaries;
