import SideBar from "../account/sidebar";
import { useState, useEffect } from "react";
import API from "../../components/api";
import { 
    FaFileAlt, 
    FaDownload, 
    FaCalendarAlt,
    FaChartBar,
    FaChartPie,
    FaChartLine,
    FaUsers,
    FaBuilding,
    FaMoneyBillWave,
    FaPrint,
    FaFilePdf,
    FaFileExcel,
    FaFilter,
    FaSync,
    FaEye,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaCheckCircle,
    FaClock,
    FaUserTie,
    FaBriefcase,
    FaDollarSign,
    FaPercentage,
    FaRegCalendarAlt,
    FaRegChartBar,
    FaRegClock,
    FaRegUser,
    FaRegBuilding,
    FaFileExport,
    FaFileInvoice,
    FaHistory,
    FaRegFileAlt,
    FaRegMoneyBillAlt,
    FaRegCheckCircle,
    FaRegTimesCircle
} from "react-icons/fa";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart, Scatter
} from 'recharts';

function GetReport() {
    const [activeTab, setActiveTab] = useState('overview');
    const [reportType, setReportType] = useState('monthly');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        employee: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf');
    const [chartType, setChartType] = useState('bar');
    const [selectedChart, setSelectedChart] = useState('department');

    // Colors for charts
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
    const GRADIENT_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD'];

    // Months array
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Years array (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Weeks in month
    const weeksInMonth = [1, 2, 3, 4];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const deptRes = await API.get('/departments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(deptRes.data);

            const empRes = await API.get('/employees/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(empRes.data.employees || empRes.data);

            const salRes = await API.get('/salaries/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSalaries(salRes.data.salaries || salRes.data);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setGenerating(true);
        
        let filteredData = {
            departments: [],
            employees: [],
            salaries: [],
            summary: {}
        };


        try {
            const filteredSalaries = salaries.filter(salary => {
                const salaryDate = new Date(salary.year, salary.month - 1);
                
                if (reportType === 'weekly') {
                    return salary.year === selectedYear && 
                           salary.month === selectedMonth &&
                           Math.ceil(salaryDate.getDate() / 7) === selectedWeek;
                } else if (reportType === 'monthly') {
                    return salary.year === selectedYear && salary.month === selectedMonth;
                } else if (reportType === 'yearly') {
                    return salary.year === selectedYear;
                } else if (reportType === 'custom' && dateRange.startDate && dateRange.endDate) {
                    const start = new Date(dateRange.startDate);
                    const end = new Date(dateRange.endDate);
                    return salaryDate >= start && salaryDate <= end;
                }
                return false;
            });

            let filteredEmployees = [...employees];
            if (filters.department) {
                filteredEmployees = filteredEmployees.filter(emp => 
                    emp.departmentId === filters.department || emp.departmentId?._id === filters.department
                );
            }
            if (filters.status) {
                filteredEmployees = filteredEmployees.filter(emp => emp.status === filters.status);
            }
            if (filters.employee) {
                filteredEmployees = filteredEmployees.filter(emp => emp._id === filters.employee);
            }

            const totalSalaries = filteredSalaries.reduce((sum, s) => sum + s.NetSalary, 0);
            const paidSalaries = filteredSalaries.filter(s => s.status === 'paid')
                .reduce((sum, s) => sum + s.NetSalary, 0);
            const pendingSalaries = filteredSalaries.filter(s => s.status === 'pending')
                .reduce((sum, s) => sum + s.NetSalary, 0);

            const departmentStats = departments.map(dept => {
                const deptEmployees = filteredEmployees.filter(emp => 
                    emp.departmentId === dept._id || emp.departmentId?._id === dept._id
                );
                const deptSalaries = filteredSalaries.filter(s => {
                    const emp = employees.find(e => e._id === s.employeeId);
                    return emp && (emp.departmentId === dept._id || emp.departmentId?._id === dept._id);
                });
                const deptTotalSalary = deptSalaries.reduce((sum, s) => sum + s.NetSalary, 0);

                return {
                    name: dept.departmentName,
                    code: dept.departmentCode,
                    employees: deptEmployees.length,
                    totalSalary: deptTotalSalary,
                    averageSalary: deptEmployees.length > 0 ? deptTotalSalary / deptEmployees.length : 0,
                    color: COLORS[departments.indexOf(dept) % COLORS.length]
                };
            });

            const monthlyBreakdown = months.map((month, index) => {
                const monthSalaries = filteredSalaries.filter(s => s.month === index + 1);
                const total = monthSalaries.reduce((sum, s) => sum + s.NetSalary, 0);
                return {
                    month,
                    shortMonth: month.substring(0, 3),
                    total,
                    count: monthSalaries.length,
                    paid: monthSalaries.filter(s => s.status === 'paid').length,
                    pending: monthSalaries.filter(s => s.status === 'pending').length
                };
            });

            const salaryStatus = [
                { name: 'Paid', value: filteredSalaries.filter(s => s.status === 'paid').length, color: '#10B981' },
                { name: 'Pending', value: filteredSalaries.filter(s => s.status === 'pending').length, color: '#F59E0B' },
                { name: 'Cancelled', value: filteredSalaries.filter(s => s.status === 'cancelled').length, color: '#EF4444' }
            ];

            const employeeStatus = [
                { name: 'Active', value: filteredEmployees.filter(e => e.status === 'active').length, color: '#10B981' },
                { name: 'Inactive', value: filteredEmployees.filter(e => e.status === 'inactive').length, color: '#EF4444' },
                { name: 'On Leave', value: filteredEmployees.filter(e => e.status === 'on leave').length, color: '#F59E0B' }
            ];

            const genderDistribution = [
                { name: 'Male', value: filteredEmployees.filter(e => e.Gender === 'male').length, color: '#3B82F6' },
                { name: 'Female', value: filteredEmployees.filter(e => e.Gender === 'female').length, color: '#EC4899' },
                { name: 'Other', value: filteredEmployees.filter(e => e.Gender === 'other').length, color: '#8B5CF6' }
            ];

            setReportData({
                summary: {
                    totalEmployees: filteredEmployees.length,
                    totalDepartments: departments.length,
                    totalSalaries: filteredSalaries.length,
                    totalAmount: totalSalaries,
                    paidAmount: paidSalaries,
                    pendingAmount: pendingSalaries,
                    averageSalary: filteredEmployees.length > 0 ? totalSalaries / filteredEmployees.length : 0,
                    paidPercentage: totalSalaries > 0 ? (paidSalaries / totalSalaries) * 100 : 0,
                    pendingPercentage: totalSalaries > 0 ? (pendingSalaries / totalSalaries) * 100 : 0
                },
                employees: filteredEmployees,
                salaries: filteredSalaries,
                departmentStats,
                monthlyBreakdown,
                salaryStatus,
                employeeStatus,
                genderDistribution,
                period: {
                    type: reportType,
                    month: selectedMonth,
                    year: selectedYear,
                    week: selectedWeek,
                    dateRange
                }
            });

        } catch (error) {
            console.error("Error generating report:", error);
        } finally {
            setGenerating(false);
        }
    };

    const exportReport = (format) => {
        console.log(`Exporting report as ${format}`);
        alert(`Report exported as ${format.toUpperCase()} successfully!`);
    };

    const printReport = () => {
        window.print();
    };

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.name.includes('Salary') ? formatCurrency(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
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

    // Format number with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num || 0);
    };

    // Get period description
    const getPeriodDescription = () => {
        if (reportType === 'weekly') {
            return `Week ${selectedWeek} of ${months[selectedMonth - 1]} ${selectedYear}`;
        } else if (reportType === 'monthly') {
            return `${months[selectedMonth - 1]} ${selectedYear}`;
        } else if (reportType === 'yearly') {
            return `Year ${selectedYear}`;
        } else if (reportType === 'custom') {
            return `${dateRange.startDate} to ${dateRange.endDate}`;
        }
        return '';
    };

    return (
        <div className="bg-linear-to-br from-indigo-900 via-blue-900 to-purple-900 min-h-screen">
            <SideBar />
            
            {/* Main Content */}
            <div className="ml-80 p-8">
                {/* Header with animation */}
                <div className="mb-8 animate-fadeIn">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <FaFileAlt className="text-green-400 animate-pulse" />
                        Reports & Analytics Dashboard
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Generate comprehensive reports and visualize your organization's performance metrics
                    </p>
                </div>

                {/* Report Configuration Card - Glassmorphism */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-3 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl">
                            <FaFilter className="text-white" />
                        </div>
                        Report Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Report Type */}
                        <div className="group">
                            <label className="block text-sm font-medium text-blue-200 mb-2 group-hover:text-white transition-colors">
                                <FaRegClock className="inline mr-2" />
                                Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300 hover:bg-white/20"
                            >
                                <option value="weekly" className="text-gray-800">📊 Weekly Report</option>
                                <option value="monthly" className="text-gray-800">📅 Monthly Report</option>
                                <option value="yearly" className="text-gray-800">📈 Yearly Report</option>
                                <option value="custom" className="text-gray-800">⚡ Custom Range</option>
                            </select>
                        </div>

                        {/* Month Selection */}
                        {(reportType === 'weekly' || reportType === 'monthly') && (
                            <div className="group">
                                <label className="block text-sm font-medium text-blue-200 mb-2 group-hover:text-white transition-colors">
                                    <FaRegCalendarAlt className="inline mr-2" />
                                    Month
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300 hover:bg-white/20"
                                >
                                    {months.map((month, index) => (
                                        <option key={index + 1} value={index + 1} className="text-gray-800">
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Year Selection */}
                        {(reportType === 'weekly' || reportType === 'monthly' || reportType === 'yearly') && (
                            <div className="group">
                                <label className="block text-sm font-medium text-blue-200 mb-2 group-hover:text-white transition-colors">
                                    <FaRegCalendarAlt className="inline mr-2" />
                                    Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300 hover:bg-white/20"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year} className="text-gray-800">
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Week Selection */}
                        {reportType === 'weekly' && (
                            <div className="group">
                                <label className="block text-sm font-medium text-blue-200 mb-2 group-hover:text-white transition-colors">
                                    <FaRegClock className="inline mr-2" />
                                    Week
                                </label>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300 hover:bg-white/20"
                                >
                                    {weeksInMonth.map(week => (
                                        <option key={week} value={week} className="text-gray-800">
                                            Week {week}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Custom Date Range */}
                        {reportType === 'custom' && (
                            <>
                                <div className="group">
                                    <label className="block text-sm font-medium text-blue-200 mb-2 group-hover:text-white transition-colors">
                                        <FaRegCalendarAlt className="inline mr-2" />
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                        className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300 hover:bg-white/20"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-blue-200 mb-2 group-hover:text-white transition-colors">
                                        <FaRegCalendarAlt className="inline mr-2" />
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                        className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300 hover:bg-white/20"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Advanced Filters Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-blue-200 hover:text-white transition-all duration-300 mb-4 group"
                    >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${showFilters ? 'bg-green-500 rotate-180' : 'bg-blue-500/50 group-hover:bg-blue-500'}`}>
                            <FaFilter className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                        </div>
                        {showFilters ? 'Hide' : 'Show'} Advanced Filters
                    </button>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 bg-linear-to-r from-white/5 to-white/10 rounded-2xl border border-white/10 animate-slideDown">
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    <FaRegBuilding className="inline mr-2" />
                                    Department
                                </label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300"
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
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    <FaRegUser className="inline mr-2" />
                                    Employee Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300"
                                >
                                    <option value="" className="text-gray-800">All Status</option>
                                    <option value="active" className="text-gray-800">Active</option>
                                    <option value="inactive" className="text-gray-800">Inactive</option>
                                    <option value="on leave" className="text-gray-800">On Leave</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    <FaUserTie className="inline mr-2" />
                                    Specific Employee
                                </label>
                                <select
                                    value={filters.employee}
                                    onChange={(e) => setFilters({...filters, employee: e.target.value})}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300"
                                >
                                    <option value="" className="text-gray-800">All Employees</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id} className="text-gray-800">
                                            {emp.FirstName} {emp.LastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <button
                            onClick={generateReport}
                            disabled={generating}
                            className="group relative overflow-hidden bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            {generating ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <FaEye className="text-xl" />
                                    Generate Report
                                </>
                            )}
                        </button>

                        {reportData && (
                            <>
                                <button
                                    onClick={() => exportReport(exportFormat)}
                                    className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105"
                                >
                                    <FaDownload />
                                    Export
                                </button>
                                <select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="px-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
                                >
                                    <option value="pdf" className="text-gray-800">📄 PDF</option>
                                    <option value="excel" className="text-gray-800">📊 Excel</option>
                                    <option value="csv" className="text-gray-800">📈 CSV</option>
                                </select>
                                <button
                                    onClick={printReport}
                                    className="bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105"
                                >
                                    <FaPrint />
                                    Print
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Report Results */}
                {reportData && (
                    <div className="space-y-8 animate-fadeInUp">
                        {/* Report Header */}
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                        <FaFileInvoice className="text-green-400" />
                                        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                                    </h2>
                                    <p className="text-blue-200 text-lg flex items-center gap-2">
                                        <FaRegCalendarAlt />
                                        {getPeriodDescription()}
                                    </p>
                                </div>
                                <div className="text-right bg-white/5 p-4 rounded-2xl">
                                    <p className="text-sm text-blue-200">Generated on</p>
                                    <p className="font-semibold text-white text-lg">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Summary Cards with animations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="group bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaUsers className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                        <span className="text-white/60 text-sm">Total</span>
                                    </div>
                                    <p className="text-white/80 text-sm">Total Employees</p>
                                    <p className="text-4xl font-bold text-white">{formatNumber(reportData.summary.totalEmployees)}</p>
                                </div>

                                <div className="group bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaMoneyBillWave className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                        <span className="text-white/60 text-sm">Total</span>
                                    </div>
                                    <p className="text-white/80 text-sm">Total Payroll</p>
                                    <p className="text-4xl font-bold text-white">{formatCurrency(reportData.summary.totalAmount)}</p>
                                </div>

                                <div className="group bg-linear-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaCheckCircle className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                        <span className="text-white/60 text-sm">Paid</span>
                                    </div>
                                    <p className="text-white/80 text-sm">Paid Amount</p>
                                    <p className="text-3xl font-bold text-white">{formatCurrency(reportData.summary.paidAmount)}</p>
                                    <p className="text-sm text-white/80 mt-2">{reportData.summary.paidPercentage.toFixed(1)}% of total</p>
                                </div>

                                <div className="group bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaClock className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                        <span className="text-white/60 text-sm">Pending</span>
                                    </div>
                                    <p className="text-white/80 text-sm">Pending Amount</p>
                                    <p className="text-3xl font-bold text-white">{formatCurrency(reportData.summary.pendingAmount)}</p>
                                    <p className="text-sm text-white/80 mt-2">{reportData.summary.pendingPercentage.toFixed(1)}% of total</p>
                                </div>
                            </div>
                        </div>

                        {/* Chart Type Selector */}
                        <div className="flex gap-4 mb-4">
                            {['department', 'salary', 'status', 'gender'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedChart(type)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                        selectedChart === type
                                            ? 'bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                                            : 'bg-white/10 text-blue-200 hover:bg-white/20'
                                    }`}
                                >
                                    {type === 'department' && '📊 Department'}
                                    {type === 'salary' && '💰 Salary'}
                                    {type === 'status' && '⚡ Status'}
                                    {type === 'gender' && '👥 Gender'}
                                </button>
                            ))}
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Department Distribution Chart */}
                            {selectedChart === 'department' && (
                                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <FaChartPie className="text-blue-400" />
                                        Employee Distribution by Department
                                    </h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.departmentStats}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="employees"
                                            >
                                                {reportData.departmentStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Salary Status Chart */}
                            {selectedChart === 'status' && (
                                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <FaChartPie className="text-yellow-400" />
                                        Salary Status Distribution
                                    </h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.salaryStatus}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {reportData.salaryStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Gender Distribution Chart */}
                            {selectedChart === 'gender' && (
                                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <FaChartPie className="text-pink-400" />
                                        Gender Distribution
                                    </h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.genderDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {reportData.genderDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Monthly Trend Chart */}
                            {reportType === 'yearly' && (
                                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 lg:col-span-2">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <FaChartLine className="text-green-400" />
                                        Monthly Salary Trend
                                    </h3>
                                    <div className="flex gap-4 mb-6">
                                        <button
                                            onClick={() => setChartType('bar')}
                                            className={`px-4 py-2 rounded-lg transition-all ${
                                                chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-200'
                                            }`}
                                        >
                                            Bar Chart
                                        </button>
                                        <button
                                            onClick={() => setChartType('line')}
                                            className={`px-4 py-2 rounded-lg transition-all ${
                                                chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-200'
                                            }`}
                                        >
                                            Line Chart
                                        </button>
                                        <button
                                            onClick={() => setChartType('area')}
                                            className={`px-4 py-2 rounded-lg transition-all ${
                                                chartType === 'area' ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-200'
                                            }`}
                                        >
                                            Area Chart
                                        </button>
                                    </div>
                                    <ResponsiveContainer width="100%" height={400}>
                                        {chartType === 'bar' ? (
                                            <BarChart data={reportData.monthlyBreakdown}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                                <XAxis dataKey="shortMonth" stroke="#ffffff80" />
                                                <YAxis stroke="#ffffff80" />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Bar dataKey="total" fill="#3B82F6" name="Total Salary" />
                                                <Bar dataKey="count" fill="#10B981" name="Number of Salaries" />
                                            </BarChart>
                                        ) : chartType === 'line' ? (
                                            <LineChart data={reportData.monthlyBreakdown}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                                <XAxis dataKey="shortMonth" stroke="#ffffff80" />
                                                <YAxis stroke="#ffffff80" />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} name="Total Salary" />
                                                <Line type="monotone" dataKey="paid" stroke="#10B981" strokeWidth={3} name="Paid" />
                                                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={3} name="Pending" />
                                            </LineChart>
                                        ) : (
                                            <AreaChart data={reportData.monthlyBreakdown}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                                <XAxis dataKey="shortMonth" stroke="#ffffff80" />
                                                <YAxis stroke="#ffffff80" />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F680" name="Total Salary" />
                                            </AreaChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Department-wise Breakdown */}
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <FaBuilding className="text-indigo-400" />
                                Department-wise Breakdown
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 rounded-xl">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Code</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employees</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total Salary</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Average Salary</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {reportData.departmentStats.map((dept, index) => {
                                            const maxSalary = Math.max(...reportData.departmentStats.map(d => d.totalSalary));
                                            const percentage = (dept.totalSalary / maxSalary) * 100;
                                            
                                            return (
                                                <tr key={index} className="hover:bg-white/5 transition-all duration-300">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{dept.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-blue-200">{dept.code}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">{dept.employees}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">
                                                        {formatCurrency(dept.totalSalary)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-yellow-400">
                                                        {formatCurrency(dept.averageSalary)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-32 bg-white/20 rounded-full h-2">
                                                            <div 
                                                                className="bg-linear-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Employee List */}
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <FaUsers className="text-green-400" />
                                Employee Details
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 rounded-xl">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employee</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Position</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {reportData.employees.slice(0, 10).map((emp) => {
                                            const empSalary = reportData.salaries.find(s => s.employeeId === emp._id);
                                            const deptName = emp.departmentId?.departmentName || 
                                                departments.find(d => d._id === emp.departmentId)?.departmentName || 'N/A';
                                            
                                            return (
                                                <tr key={emp._id} className="hover:bg-white/5 transition-all duration-300">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                                {emp.FirstName?.charAt(0)}{emp.LastName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-white">{emp.FirstName} {emp.LastName}</p>
                                                                <p className="text-sm text-blue-200">{emp.employeeNumber}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-blue-200">{deptName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">{emp.Position}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            emp.status === 'active' 
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                                : emp.status === 'on leave'
                                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                        }`}>
                                                            {emp.status || 'active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-400">
                                                        {formatCurrency(empSalary?.NetSalary || 0)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add custom animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}

export default GetReport;