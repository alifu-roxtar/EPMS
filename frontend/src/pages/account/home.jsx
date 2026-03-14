// home.jsx
import SideBar from "./sidebar";
import API from "../../components/api";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    FaBuilding, 
    FaUsers, 
    FaArrowCircleRight, 
    FaCopyright,
    FaMoneyBillWave,
    FaChartLine,
    FaUserTie,
    FaClock,
    FaCheckCircle,
    FaBars,
    FaTimes
} from "react-icons/fa";
import { FaMoneyBill1Wave } from "react-icons/fa6";

function HomePage() {
    const [user, setUser] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [salaryStats, setSalaryStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        departments: 0,
        employees: 0,
        totalSalary: 0,
        pendingSalary: 0,
        paidSalary: 0,
        activeEmployees: 0
    });
    
    const navigate = useNavigate();

    console.log(salaryStats);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch user data
                const userRes = await API.get("/users/getme", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(userRes.data);

                // Fetch departments
                const deptRes = await API.get("/departments/all", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDepartments(deptRes.data);

                // Fetch employees
                const empRes = await API.get("/employees/all", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const employeesData = empRes.data.employees || empRes.data;
                setEmployees(employeesData);

                // Fetch salaries
                const salaryRes = await API.get("/salaries/all", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const salariesData = salaryRes.data.salaries || salaryRes.data;
                setSalaries(salariesData);

                // Fetch salary stats if endpoint exists
                try {
                    const statsRes = await API.get("/salaries/stats", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (statsRes.data.success) {
                        setSalaryStats(statsRes.data.stats);
                    }
                } catch (statsError) {
                    console.log("Stats endpoint not available, calculating locally", statsError);
                }

                // Calculate real statistics
                const totalSalary = salariesData.reduce((sum, salary) => sum + (Number(salary.NetSalary) || 0), 0);
                const pendingSalary = salariesData
                    .filter(s => s.status === 'pending')
                    .reduce((sum, salary) => sum + (Number(salary.NetSalary) || 0), 0);
                const paidSalary = salariesData
                    .filter(s => s.status === 'paid')
                    .reduce((sum, salary) => sum + (Number(salary.NetSalary) || 0), 0);
                
                const activeEmployees = employeesData.filter(emp => emp.status === 'active').length;

                setStats({
                    departments: deptRes.data.length,
                    employees: employeesData.length,
                    totalSalary: totalSalary,
                    pendingSalary: pendingSalary,
                    paidSalary: paidSalary,
                    activeEmployees: activeEmployees
                });

            } catch (error) {
                console.error("Error fetching data:", error);
                
                if (error.response) {
                    if (error.response.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('uid');
                        setError("Your session has expired. Please login again.");
                        setTimeout(() => navigate('/login'), 2000);
                    } else if (error.response.status === 404) {
                        setError("Resource not found");
                    } else {
                        setError(error.response.data?.msg || "An error occurred");
                    }
                } else if (error.request) {
                    setError("Cannot connect to server. Please check your internet connection.");
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

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

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
                <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Loading your dashboard...</p>
                    <p className="text-blue-200 mt-2">Fetching your data</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl md:text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
                    <p className="text-blue-200 mb-6 text-sm md:text-base">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-green-500 hover:bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                    {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            </div>

            {/* Sidebar - Hidden on mobile, shown when menu is open */}
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
            <div className={`${mobileMenuOpen ? 'blur-sm' : ''} lg:blur-none transition-all duration-300 min-h-screen bg-gradient-to-br from-blue-900 to-blue-800`}>
                {/* Content wrapper with responsive padding */}
                <div className="lg:ml-80 p-4 sm:p-6 md:p-8">
                    {/* User Profile Circle - Repositioned for mobile */}
                    <div className="flex justify-end mb-4 md:mb-8">
                        <Link 
                            to={`/profile/${user?._id}`}
                            className="group relative"
                        >
                            <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg ring-2 md:ring-4 ring-white/20">
                                <span className="text-xl md:text-2xl font-bold text-white">
                                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="absolute -bottom-1 right-0 h-2 w-2 md:h-4 md:w-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                        </Link>
                    </div>

                    {/* Welcome Section */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                            {getGreeting()}, {user?.username?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p className="text-base md:text-xl text-blue-200">
                            Here's what's happening with your organization today.
                        </p>
                    </div>

                    {/* Quick Stats Row - Responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-xs uppercase">Total Employees</p>
                                    <p className="text-xl md:text-2xl font-bold text-white">{formatNumber(stats.employees)}</p>
                                </div>
                                <div className="bg-blue-500/20 p-2 md:p-3 rounded-lg">
                                    <FaUsers className="text-lg md:text-xl text-blue-300" />
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-blue-300">
                                {stats.activeEmployees} active
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-xs uppercase">Departments</p>
                                    <p className="text-xl md:text-2xl font-bold text-white">{formatNumber(stats.departments)}</p>
                                </div>
                                <div className="bg-purple-500/20 p-2 md:p-3 rounded-lg">
                                    <FaBuilding className="text-lg md:text-xl text-purple-300" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-xs uppercase">Monthly Payroll</p>
                                    <p className="text-base md:text-xl font-bold text-white truncate max-w-[120px] md:max-w-none">
                                        {formatCurrency(stats.totalSalary)}
                                    </p>
                                </div>
                                <div className="bg-green-500/20 p-2 md:p-3 rounded-lg">
                                    <FaMoneyBillWave className="text-lg md:text-xl text-green-300" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-xs uppercase">Pending Payments</p>
                                    <p className="text-base md:text-xl font-bold text-yellow-300 truncate max-w-[120px] md:max-w-none">
                                        {formatCurrency(stats.pendingSalary)}
                                    </p>
                                </div>
                                <div className="bg-yellow-500/20 p-2 md:p-3 rounded-lg">
                                    <FaClock className="text-lg md:text-xl text-yellow-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Stats Cards - Responsive grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
                        {/* Departments Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-6 md:p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group border border-white/10">
                            <div className="bg-blue-600 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                                <FaBuilding className="text-2xl md:text-3xl text-white" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Departments</h3>
                            <p className="text-sm md:text-base text-blue-200 mb-4">Manage your departments</p>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-3xl md:text-4xl font-bold text-white">{stats.departments}</span>
                                    <span className="text-blue-200 ml-2 text-sm md:text-base">total</span>
                                </div>
                                <Link 
                                    to="/departments" 
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg text-sm md:text-base"
                                >
                                    View All
                                    <FaArrowCircleRight className="text-base md:text-lg group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Employees Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-6 md:p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group border border-white/10">
                            <div className="bg-purple-600 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                                <FaUsers className="text-2xl md:text-3xl text-white" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Employees</h3>
                            <p className="text-sm md:text-base text-blue-200 mb-4">Your workforce</p>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-3xl md:text-4xl font-bold text-white">{stats.employees}</span>
                                    <span className="text-blue-200 ml-2 text-sm md:text-base">total</span>
                                </div>
                                <Link 
                                    to="/employees" 
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg text-sm md:text-base"
                                >
                                    View All
                                    <FaArrowCircleRight className="text-base md:text-lg group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-blue-200">{stats.activeEmployees} Active</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    <span className="text-blue-200">{stats.employees - stats.activeEmployees} Inactive</span>
                                </div>
                            </div>
                        </div>

                        {/* Salaries Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-6 md:p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group border border-white/10">
                            <div className="bg-green-600 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                                <FaMoneyBill1Wave className="text-2xl md:text-3xl text-white" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Salaries</h3>
                            <p className="text-sm md:text-base text-blue-200 mb-4">Payroll management</p>
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-center justify-between text-sm md:text-base">
                                    <span className="text-blue-200">Total Payroll:</span>
                                    <span className="text-lg md:text-xl font-bold text-white">{formatCurrency(stats.totalSalary)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm md:text-base">
                                    <span className="text-blue-200">Paid:</span>
                                    <span className="text-green-400 font-semibold">{formatCurrency(stats.paidSalary)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm md:text-base">
                                    <span className="text-blue-200">Pending:</span>
                                    <span className="text-yellow-400 font-semibold">{formatCurrency(stats.pendingSalary)}</span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-6">
                                <Link 
                                    to="/salaries" 
                                    className="w-full bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg text-sm md:text-base"
                                >
                                    Manage Salaries
                                    <FaArrowCircleRight className="text-base md:text-lg group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Section - Responsive grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8">
                        {/* Recent Employees */}
                        {employees.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border border-white/10">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                        <FaUserTie className="text-blue-300" />
                                        Recent Employees
                                    </h2>
                                    <Link 
                                        to="/employees" 
                                        className="text-blue-200 hover:text-white transition-colors duration-200 text-xs md:text-sm"
                                    >
                                        View All →
                                    </Link>
                                </div>
                                
                                <div className="space-y-3 md:space-y-4">
                                    {employees.slice(0, 5).map((emp) => (
                                        <Link 
                                            to={`/employee/${emp._id}`}
                                            key={emp._id} 
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm md:text-base">
                                                    {emp.FirstName?.charAt(0)}{emp.LastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm md:text-base text-white font-semibold">
                                                        {emp.FirstName} {emp.LastName}
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-blue-200">{emp.Position}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs w-fit ${
                                                emp.status === 'active' 
                                                    ? 'bg-green-500/20 text-green-300' 
                                                    : 'bg-gray-500/20 text-gray-300'
                                            }`}>
                                                {emp.status || 'active'}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Salaries */}
                        {salaries.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border border-white/10">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                        <FaMoneyBillWave className="text-green-300" />
                                        Recent Salaries
                                    </h2>
                                    <Link 
                                        to="/salaries" 
                                        className="text-blue-200 hover:text-white transition-colors duration-200 text-xs md:text-sm"
                                    >
                                        View All →
                                    </Link>
                                </div>
                                
                                <div className="space-y-3 md:space-y-4">
                                    {salaries.slice(0, 5).map((salary) => {
                                        const employeeName = salary.employeeId 
                                            ? `${salary.employeeId.FirstName || ''} ${salary.employeeId.LastName || ''}`
                                            : 'Unknown Employee';
                                        
                                        return (
                                            <Link 
                                                to={`/salary/${salary._id}`}
                                                key={salary._id} 
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1 md:p-2 rounded-lg ${
                                                        salary.status === 'paid' 
                                                            ? 'bg-green-500/20' 
                                                            : salary.status === 'pending'
                                                            ? 'bg-yellow-500/20'
                                                            : 'bg-red-500/20'
                                                    }`}>
                                                        {salary.status === 'paid' 
                                                            ? <FaCheckCircle className="text-green-400 text-xs md:text-sm" />
                                                            : salary.status === 'pending'
                                                            ? <FaClock className="text-yellow-400 text-xs md:text-sm" />
                                                            : <FaClock className="text-red-400 text-xs md:text-sm" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm md:text-base text-white font-semibold">
                                                            {employeeName.length > 20 ? employeeName.substring(0, 20) + '...' : employeeName}
                                                        </h3>
                                                        <p className="text-xs md:text-sm text-blue-200">
                                                            {formatCurrency(salary.NetSalary)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right ml-12 sm:ml-0">
                                                    <p className="text-xs md:text-sm text-white font-semibold">
                                                        {salary.month}/{salary.year}
                                                    </p>
                                                    <span className={`text-xs ${
                                                        salary.status === 'paid' 
                                                            ? 'text-green-400' 
                                                            : salary.status === 'pending'
                                                            ? 'text-yellow-400'
                                                            : 'text-red-400'
                                                    }`}>
                                                        {salary.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Departments Section */}
                    {departments.length > 0 ? (
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border border-white/10 mb-8">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                    <FaBuilding className="text-purple-300" />
                                    Recent Departments
                                </h2>
                                <Link 
                                    to="/departments" 
                                    className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center gap-1 text-xs md:text-sm"
                                >
                                    View All <span className="text-base md:text-lg">→</span>
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {departments.slice(0, 3).map((dept) => {
                                    const deptEmployees = employees.filter(emp => 
                                        emp.departmentId === dept._id || emp.departmentId?._id === dept._id
                                    ).length;
                                    
                                    return (
                                        <Link 
                                            to={`/department/${dept._id}`} 
                                            key={dept._id} 
                                            className="bg-white/5 rounded-lg p-3 md:p-4 hover:bg-white/10 transition-all duration-200 group cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-blue-200 text-xs md:text-sm font-mono bg-blue-500/20 px-2 py-1 rounded">
                                                    {dept.departmentCode}
                                                </span>
                                                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-semibold">
                                                    {deptEmployees} employees
                                                </span>
                                            </div>
                                            <h3 className="text-sm md:text-base text-white font-semibold group-hover:text-blue-200 transition-colors mb-2">
                                                {dept.departmentName.length > 20 ? dept.departmentName.substring(0, 20) + '...' : dept.departmentName}
                                            </h3>
                                            <div className="flex justify-between items-center text-xs md:text-sm">
                                                <span className="text-blue-200">Budget:</span>
                                                <span className="text-green-300 font-semibold">
                                                    {formatCurrency(dept.grossSalary)}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-6 md:p-12 text-center border border-white/10 mb-8">
                            <FaBuilding className="text-4xl md:text-6xl text-blue-300 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">No Departments Yet</h3>
                            <p className="text-sm md:text-base text-blue-200 mb-6">Get started by creating your first department</p>
                            <Link
                                to="/createDepartment"
                                className="inline-block cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg text-sm md:text-base"
                            >
                                Create Department
                            </Link>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 md:mt-8 text-center text-blue-200 text-xs md:text-sm border-t border-white/10 pt-4 md:pt-6">
                        <FaCopyright className="inline mr-1 text-blue-300" />
                        EPMS Employee Performance Management System. All rights reserved {new Date().getFullYear()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;
