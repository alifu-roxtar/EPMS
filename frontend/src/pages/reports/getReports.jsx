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
    FaRegTimesCircle,
    FaSpinner
} from "react-icons/fa";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function GetReport() {
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
    const [exporting, setExporting] = useState(false);
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

    // Months array
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Years array (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Fetch departments
            const deptRes = await API.get('/departments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(deptRes.data);

            // Fetch employees
            const empRes = await API.get('/employees/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(empRes.data.employees || empRes.data);

            // Fetch salaries
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
        
        try {
            // Filter salaries based on selected period
            let filteredSalaries = salaries.filter(salary => {
                if (reportType === 'weekly') {
                    // For weekly, we need to calculate week of month
                    const salaryDate = new Date(salary.year, salary.month - 1, 1);
                    const weekNumber = Math.ceil(salaryDate.getDate() / 7);
                    return salary.year === selectedYear && 
                           salary.month === selectedMonth &&
                           weekNumber === selectedWeek;
                } else if (reportType === 'monthly') {
                    return salary.year === selectedYear && salary.month === selectedMonth;
                } else if (reportType === 'yearly') {
                    return salary.year === selectedYear;
                } else if (reportType === 'custom' && dateRange.startDate && dateRange.endDate) {
                    const salaryDate = new Date(salary.year, salary.month - 1);
                    const start = new Date(dateRange.startDate);
                    const end = new Date(dateRange.endDate);
                    return salaryDate >= start && salaryDate <= end;
                }
                return false;
            });

            // Apply additional filters
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

            // Create a map of employee IDs for faster lookup
            const employeeIdSet = new Set(filteredEmployees.map(emp => emp._id.toString()));
            
            // Further filter salaries to only include employees from filteredEmployees
            filteredSalaries = filteredSalaries.filter(salary => {
                const salaryEmpId = salary.employeeId?._id || salary.employeeId;
                return salaryEmpId && employeeIdSet.has(salaryEmpId.toString());
            });

            // Employee list with salary info - FIXED VERSION
            const employeeList = filteredEmployees.map(emp => {
                // Find salary for this employee - handle both populated and unpopulated employeeId
                const empSalary = filteredSalaries.find(s => {
                    const salaryEmpId = s.employeeId?._id || s.employeeId;
                    const currentEmpId = emp._id;
                    return salaryEmpId && currentEmpId && salaryEmpId.toString() === currentEmpId.toString();
                });
                
                const deptName = emp.departmentId?.departmentName || 
                    departments.find(d => d._id === emp.departmentId)?.departmentName || 'N/A';
                
                return {
                    id: emp._id,
                    name: `${emp.FirstName || ''} ${emp.LastName || ''}`.trim(),
                    employeeNumber: emp.employeeNumber || 'N/A',
                    position: emp.Position || 'N/A',
                    department: deptName,
                    status: emp.status || 'active',
                    salary: empSalary?.NetSalary || 0,
                    grossSalary: empSalary?.GrossSalary || 0,
                    deduction: empSalary?.TotalDeduction || 0,
                    month: empSalary?.month,
                    year: empSalary?.year,
                    monthName: empSalary?.month ? months[empSalary.month - 1] : '',
                    paymentMethod: empSalary?.paymentMethod,
                    salaryStatus: empSalary?.status,
                    hasSalary: !!empSalary
                };
            }).filter(emp => emp.name); // Remove empty entries

            // Salary transactions - FIXED VERSION
            const salaryTransactions = filteredSalaries.map(salary => {
                // Find employee for this salary - handle both populated and unpopulated employeeId
                const emp = employees.find(e => {
                    const empId = e._id;
                    const salaryEmpId = salary.employeeId?._id || salary.employeeId;
                    return empId && salaryEmpId && empId.toString() === salaryEmpId.toString();
                });
                
                const deptName = emp?.departmentId?.departmentName || 
                    departments.find(d => d._id === emp?.departmentId)?.departmentName || 'N/A';
                
                return {
                    id: salary._id,
                    employeeName: emp ? `${emp.FirstName || ''} ${emp.LastName || ''}`.trim() : 'Unknown',
                    employeeNumber: emp?.employeeNumber || 'N/A',
                    department: deptName,
                    grossSalary: salary.GrossSalary || 0,
                    deduction: salary.TotalDeduction || 0,
                    netSalary: salary.NetSalary || 0,
                    month: salary.month,
                    year: salary.year,
                    monthName: months[salary.month - 1] || 'Unknown',
                    status: salary.status || 'pending',
                    paymentMethod: salary.paymentMethod || 'bank transfer',
                    paymentDate: salary.paymentDate ? new Date(salary.paymentDate).toLocaleDateString() : 'Not paid',
                    notes: salary.notes || ''
                };
            });

            // Calculate summary statistics - FIXED VERSION
            const totalSalaries = salaryTransactions.reduce((sum, s) => sum + (s.netSalary || 0), 0);
            const paidSalaries = salaryTransactions.filter(s => s.status === 'paid')
                .reduce((sum, s) => sum + (s.netSalary || 0), 0);
            const pendingSalaries = salaryTransactions.filter(s => s.status === 'pending')
                .reduce((sum, s) => sum + (s.netSalary || 0), 0);

            // Count employees with salaries
            const employeesWithSalary = employeeList.filter(emp => emp.hasSalary).length;

            // Department-wise breakdown - FIXED VERSION
            const departmentStats = departments.map(dept => {
                const deptEmployees = employeeList.filter(emp => emp.department === dept.departmentName);
                const deptSalaries = salaryTransactions.filter(s => s.department === dept.departmentName);
                const deptTotalSalary = deptSalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);

                return {
                    name: dept.departmentName,
                    code: dept.departmentCode,
                    employees: deptEmployees.length,
                    totalSalary: deptTotalSalary,
                    averageSalary: deptEmployees.length > 0 ? deptTotalSalary / deptEmployees.length : 0
                };
            }).filter(dept => dept.employees > 0 || dept.totalSalary > 0);

            // Monthly breakdown for yearly report
            const monthlyBreakdown = months.map((month, index) => {
                const monthSalaries = salaryTransactions.filter(s => s.month === index + 1);
                const total = monthSalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
                return {
                    month,
                    total,
                    count: monthSalaries.length
                };
            });

            setReportData({
                summary: {
                    totalEmployees: employeeList.length,
                    totalDepartments: departmentStats.length,
                    totalSalaries: employeesWithSalary,
                    totalAmount: totalSalaries,
                    paidAmount: paidSalaries,
                    pendingAmount: pendingSalaries,
                    averageSalary: employeeList.length > 0 ? totalSalaries / employeeList.length : 0,
                    paidPercentage: totalSalaries > 0 ? (paidSalaries / totalSalaries) * 100 : 0,
                    pendingPercentage: totalSalaries > 0 ? (pendingSalaries / totalSalaries) * 100 : 0
                },
                employees: employeeList,
                salaries: salaryTransactions,
                departmentStats,
                monthlyBreakdown,
                period: {
                    type: reportType,
                    month: selectedMonth,
                    year: selectedYear,
                    week: selectedWeek,
                    dateRange,
                    description: getPeriodDescription()
                }
            });

        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const exportToPDF = () => {
        setExporting(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Title
            doc.setFontSize(20);
            doc.setTextColor(33, 150, 243);
            doc.text('Salary Report', pageWidth / 2, 20, { align: 'center' });
            
            // Period
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Period: ${reportData.period.description}`, 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);
            
            // Summary
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Summary', 14, 50);
            
            doc.setFontSize(10);
            doc.text(`Total Employees: ${reportData.summary.totalEmployees}`, 20, 60);
            doc.text(`Total Departments: ${reportData.summary.totalDepartments}`, 20, 67);
            doc.text(`Employees with Salary: ${reportData.summary.totalSalaries}`, 20, 74);
            doc.text(`Total Amount: $${reportData.summary.totalAmount.toLocaleString()}`, 20, 81);
            doc.text(`Paid: $${reportData.summary.paidAmount.toLocaleString()} (${reportData.summary.paidPercentage.toFixed(1)}%)`, 20, 88);
            doc.text(`Pending: $${reportData.summary.pendingAmount.toLocaleString()} (${reportData.summary.pendingPercentage.toFixed(1)}%)`, 20, 95);
            doc.text(`Average Salary: $${reportData.summary.averageSalary.toLocaleString()}`, 20, 102);
            
            // Employee Table
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Employee Details', 14, 20);
            
            const employeeColumns = ['Name', 'Department', 'Position', 'Status', 'Salary'];
            const employeeRows = reportData.employees.slice(0, 20).map(emp => [
                emp.name,
                emp.department,
                emp.position,
                emp.status,
                emp.hasSalary ? `$${emp.salary.toLocaleString()}` : 'No Salary'
            ]);
            
            doc.autoTable({
                startY: 30,
                head: [employeeColumns],
                body: employeeRows,
                theme: 'striped',
                headStyles: { fillColor: [33, 150, 243] }
            });
            
            // Salary Table
            if (reportData.salaries.length > 0) {
                doc.addPage();
                doc.setFontSize(16);
                doc.text('Salary Transactions', 14, 20);
                
                const salaryColumns = ['Employee', 'Period', 'Gross', 'Deduction', 'Net', 'Status'];
                const salaryRows = reportData.salaries.slice(0, 20).map(sal => [
                    sal.employeeName,
                    `${sal.monthName} ${sal.year}`,
                    `$${sal.grossSalary.toLocaleString()}`,
                    `$${sal.deduction.toLocaleString()}`,
                    `$${sal.netSalary.toLocaleString()}`,
                    sal.status
                ]);
                
                doc.autoTable({
                    startY: 30,
                    head: [salaryColumns],
                    body: salaryRows,
                    theme: 'striped',
                    headStyles: { fillColor: [33, 150, 243] }
                });
            }
            
            // Department Statistics
            if (reportData.departmentStats.length > 0) {
                doc.addPage();
                doc.setFontSize(16);
                doc.text('Department Statistics', 14, 20);
                
                const deptColumns = ['Department', 'Employees', 'Total Salary', 'Average'];
                const deptRows = reportData.departmentStats.map(dept => [
                    dept.name,
                    dept.employees.toString(),
                    `$${dept.totalSalary.toLocaleString()}`,
                    `$${dept.averageSalary.toLocaleString()}`
                ]);
                
                doc.autoTable({
                    startY: 30,
                    head: [deptColumns],
                    body: deptRows,
                    theme: 'striped',
                    headStyles: { fillColor: [33, 150, 243] }
                });
            }
            
            // Save PDF
            doc.save(`salary-report-${reportData.period.description.replace(/[/\s]/g, '-')}.pdf`);
            
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Failed to export to PDF. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const exportToExcel = () => {
        setExporting(true);
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Summary sheet
            const summaryData = [
                ['Report Summary'],
                ['Period', reportData.period.description],
                ['Generated On', new Date().toLocaleString()],
                [],
                ['Metric', 'Value'],
                ['Total Employees', reportData.summary.totalEmployees],
                ['Total Departments', reportData.summary.totalDepartments],
                ['Employees with Salary', reportData.summary.totalSalaries],
                ['Total Amount', `$${reportData.summary.totalAmount.toLocaleString()}`],
                ['Paid Amount', `$${reportData.summary.paidAmount.toLocaleString()}`],
                ['Pending Amount', `$${reportData.summary.pendingAmount.toLocaleString()}`],
                ['Average Salary', `$${reportData.summary.averageSalary.toLocaleString()}`],
                ['Paid Percentage', `${reportData.summary.paidPercentage.toFixed(1)}%`],
                ['Pending Percentage', `${reportData.summary.pendingPercentage.toFixed(1)}%`]
            ];
            
            const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
            
            // Employees sheet
            if (reportData.employees.length > 0) {
                const employeeWs = XLSX.utils.json_to_sheet(reportData.employees.map(emp => ({
                    'Name': emp.name,
                    'Employee Number': emp.employeeNumber,
                    'Department': emp.department,
                    'Position': emp.position,
                    'Status': emp.status,
                    'Salary': emp.hasSalary ? emp.salary : 0,
                    'Has Salary': emp.hasSalary ? 'Yes' : 'No'
                })));
                XLSX.utils.book_append_sheet(wb, employeeWs, 'Employees');
            }
            
            // Salaries sheet
            if (reportData.salaries.length > 0) {
                const salaryWs = XLSX.utils.json_to_sheet(reportData.salaries.map(sal => ({
                    'Employee': sal.employeeName,
                    'Employee Number': sal.employeeNumber,
                    'Department': sal.department,
                    'Period': `${sal.monthName} ${sal.year}`,
                    'Gross Salary': sal.grossSalary,
                    'Deduction': sal.deduction,
                    'Net Salary': sal.netSalary,
                    'Status': sal.status,
                    'Payment Method': sal.paymentMethod,
                    'Payment Date': sal.paymentDate
                })));
                XLSX.utils.book_append_sheet(wb, salaryWs, 'Salaries');
            }
            
            // Departments sheet
            if (reportData.departmentStats.length > 0) {
                const deptWs = XLSX.utils.json_to_sheet(reportData.departmentStats.map(dept => ({
                    'Department': dept.name,
                    'Code': dept.code,
                    'Employees': dept.employees,
                    'Total Salary': dept.totalSalary,
                    'Average Salary': dept.averageSalary
                })));
                XLSX.utils.book_append_sheet(wb, deptWs, 'Departments');
            }
            
            // Save Excel file
            XLSX.writeFile(wb, `salary-report-${reportData.period.description.replace(/[/\s]/g, '-')}.xlsx`);
            
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("Failed to export to Excel. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const exportToCSV = () => {
        setExporting(true);
        try {
            // Create CSV for each section
            if (reportData.employees.length > 0) {
                const employeeCsv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(reportData.employees.map(emp => ({
                    Name: emp.name,
                    EmployeeNumber: emp.employeeNumber,
                    Department: emp.department,
                    Position: emp.position,
                    Status: emp.status,
                    Salary: emp.salary,
                    HasSalary: emp.hasSalary ? 'Yes' : 'No'
                }))));
                downloadCSV(employeeCsv, `employees-${reportData.period.description.replace(/[/\s]/g, '-')}.csv`);
            }
            
            if (reportData.salaries.length > 0) {
                const salaryCsv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(reportData.salaries.map(sal => ({
                    Employee: sal.employeeName,
                    EmployeeNumber: sal.employeeNumber,
                    Department: sal.department,
                    Period: `${sal.monthName} ${sal.year}`,
                    GrossSalary: sal.grossSalary,
                    Deduction: sal.deduction,
                    NetSalary: sal.netSalary,
                    Status: sal.status,
                    PaymentMethod: sal.paymentMethod,
                    PaymentDate: sal.paymentDate
                }))));
                downloadCSV(salaryCsv, `salaries-${reportData.period.description.replace(/[/\s]/g, '-')}.csv`);
            }
            
            if (reportData.departmentStats.length > 0) {
                const deptCsv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(reportData.departmentStats.map(dept => ({
                    Department: dept.name,
                    Code: dept.code,
                    Employees: dept.employees,
                    TotalSalary: dept.totalSalary,
                    AverageSalary: dept.averageSalary
                }))));
                downloadCSV(deptCsv, `departments-${reportData.period.description.replace(/[/\s]/g, '-')}.csv`);
            }
            
        } catch (error) {
            console.error("Error exporting to CSV:", error);
            alert("Failed to export to CSV. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const downloadCSV = (csv, filename) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Salary Report - ${reportData.period.description}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #2196F3; }
                        h2 { color: #333; margin-top: 20px; }
                        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
                        th { background-color: #2196F3; color: white; padding: 10px; text-align: left; }
                        td { border: 1px solid #ddd; padding: 8px; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
                        .summary-card { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
                        .summary-card h3 { margin: 0; color: #666; }
                        .summary-card p { margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #2196F3; }
                        .no-salary { color: #999; font-style: italic; }
                    </style>
                </head>
                <body>
                    <h1>Salary Report</h1>
                    <p><strong>Period:</strong> ${reportData.period.description}</p>
                    <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
                    
                    <div class="summary">
                        <div class="summary-card">
                            <h3>Total Employees</h3>
                            <p>${reportData.summary.totalEmployees}</p>
                        </div>
                        <div class="summary-card">
                            <h3>Employees with Salary</h3>
                            <p>${reportData.summary.totalSalaries}</p>
                        </div>
                        <div class="summary-card">
                            <h3>Total Amount</h3>
                            <p>$${reportData.summary.totalAmount.toLocaleString()}</p>
                        </div>
                        <div class="summary-card">
                            <h3>Average Salary</h3>
                            <p>$${reportData.summary.averageSalary.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <h2>Employee Details</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Employee #</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Status</th>
                                <th>Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.employees.map(emp => `
                                <tr>
                                    <td>${emp.name}</td>
                                    <td>${emp.employeeNumber}</td>
                                    <td>${emp.department}</td>
                                    <td>${emp.position}</td>
                                    <td>${emp.status}</td>
                                    <td>${emp.hasSalary ? `$${emp.salary.toLocaleString()}` : '<span class="no-salary">No salary record</span>'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    ${reportData.salaries.length > 0 ? `
                        <h2>Salary Transactions</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Period</th>
                                    <th>Gross</th>
                                    <th>Deduction</th>
                                    <th>Net</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.salaries.map(sal => `
                                    <tr>
                                        <td>${sal.employeeName}</td>
                                        <td>${sal.monthName} ${sal.year}</td>
                                        <td>$${sal.grossSalary.toLocaleString()}</td>
                                        <td>$${sal.deduction.toLocaleString()}</td>
                                        <td>$${sal.netSalary.toLocaleString()}</td>
                                        <td>${sal.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}
                    
                    ${reportData.departmentStats.length > 0 ? `
                        <h2>Department Statistics</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Code</th>
                                    <th>Employees</th>
                                    <th>Total Salary</th>
                                    <th>Average Salary</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.departmentStats.map(dept => `
                                    <tr>
                                        <td>${dept.name}</td>
                                        <td>${dept.code}</td>
                                        <td>${dept.employees}</td>
                                        <td>$${dept.totalSalary.toLocaleString()}</td>
                                        <td>$${dept.averageSalary.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExport = () => {
        if (!reportData) {
            alert("Please generate a report first.");
            return;
        }
        
        switch(exportFormat) {
            case 'pdf':
                exportToPDF();
                break;
            case 'excel':
                exportToExcel();
                break;
            case 'csv':
                exportToCSV();
                break;
            default:
                exportToPDF();
        }
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

    // Get month name
    const getMonthName = (monthNumber) => {
        return months[monthNumber - 1] || "Unknown";
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 min-h-screen">
            <SideBar />
            
            {/* Main Content */}
            <div className="ml-80 p-8">
                {/* Header */}
                <div className="mb-8 animate-fadeIn">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <FaFileAlt className="text-green-400 animate-pulse" />
                        Reports & Analytics
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Generate comprehensive reports and analyze your organization's performance
                    </p>
                </div>

                {/* Report Configuration Card */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <FaFilter className="text-white" />
                        </div>
                        Report Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                <FaRegClock className="inline mr-2" />
                                Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500 transition-all duration-300"
                            >
                                <option value="weekly" className="text-gray-800">📊 Weekly Report</option>
                                <option value="monthly" className="text-gray-800">📅 Monthly Report</option>
                                <option value="yearly" className="text-gray-800">📈 Yearly Report</option>
                                <option value="custom" className="text-gray-800">⚡ Custom Range</option>
                            </select>
                        </div>

                        {/* Month Selection */}
                        {(reportType === 'weekly' || reportType === 'monthly') && (
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    <FaRegCalendarAlt className="inline mr-2" />
                                    Month
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    <FaRegCalendarAlt className="inline mr-2" />
                                    Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    <FaRegClock className="inline mr-2" />
                                    Week
                                </label>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
                                >
                                    {[1, 2, 3, 4].map(week => (
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
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-2">
                                        <FaRegCalendarAlt className="inline mr-2" />
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                        className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-200 mb-2">
                                        <FaRegCalendarAlt className="inline mr-2" />
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                        className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                        <div className={`p-2 rounded-lg transition-all duration-300 ${showFilters ? 'bg-green-500' : 'bg-blue-500/50 group-hover:bg-blue-500'}`}>
                            <FaFilter />
                        </div>
                        {showFilters ? 'Hide' : 'Show'} Advanced Filters
                    </button>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10">
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    <FaRegBuilding className="inline mr-2" />
                                    Department
                                </label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                                    className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
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
                            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <FaSpinner className="animate-spin text-xl" />
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
                                    onClick={handleExport}
                                    disabled={exporting}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                >
                                    {exporting ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <FaDownload />
                                    )}
                                    Export
                                </button>
                                <select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="px-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-green-500"
                                >
                                    <option value="pdf" className="text-gray-800">📄 PDF Document</option>
                                    <option value="excel" className="text-gray-800">📊 Excel Spreadsheet</option>
                                    <option value="csv" className="text-gray-800">📈 CSV File</option>
                                </select>
                                <button
                                    onClick={printReport}
                                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105"
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
                                        {reportData.period.description}
                                    </p>
                                </div>
                                <div className="text-right bg-white/5 p-4 rounded-2xl">
                                    <p className="text-sm text-blue-200">Generated on</p>
                                    <p className="font-semibold text-white text-lg">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaUsers className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-white/80 text-sm">Total Employees</p>
                                    <p className="text-4xl font-bold text-white">{formatNumber(reportData.summary.totalEmployees)}</p>
                                    <p className="text-sm text-white/60 mt-2">{reportData.summary.totalSalaries} with salary</p>
                                </div>

                                <div className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaMoneyBillWave className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-white/80 text-sm">Total Payroll</p>
                                    <p className="text-3xl font-bold text-white">{formatCurrency(reportData.summary.totalAmount)}</p>
                                    <p className="text-sm text-white/60 mt-2">Average: {formatCurrency(reportData.summary.averageSalary)}</p>
                                </div>

                                <div className="group bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaCheckCircle className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-white/80 text-sm">Paid Amount</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(reportData.summary.paidAmount)}</p>
                                    <p className="text-sm text-white/60 mt-2">{reportData.summary.paidPercentage.toFixed(1)}% of total</p>
                                </div>

                                <div className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <FaClock className="text-4xl text-white/80 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-white/80 text-sm">Pending Amount</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(reportData.summary.pendingAmount)}</p>
                                    <p className="text-sm text-white/60 mt-2">{reportData.summary.pendingPercentage.toFixed(1)}% of total</p>
                                </div>
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
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employee #</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Position</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {reportData.employees.slice(0, 10).map((emp, index) => (
                                            <tr key={index} className="hover:bg-white/5 transition-all duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                            {emp.name?.charAt(0) || 'E'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{emp.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-blue-200">{emp.employeeNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-blue-200">{emp.department}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-white">{emp.position}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        emp.status === 'active' 
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                            : emp.status === 'on leave'
                                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                    }`}>
                                                        {emp.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                                    {emp.hasSalary ? (
                                                        <span className="text-green-400">{formatCurrency(emp.salary)}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No salary</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {reportData.employees.length > 10 && (
                                    <p className="text-center text-blue-200 mt-4">
                                        Showing 10 of {reportData.employees.length} employees
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Salary Transactions */}
                        {reportData.salaries.length > 0 && (
                            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <FaMoneyBillWave className="text-yellow-400" />
                                    Salary Transactions
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5 rounded-xl">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employee</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Period</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Gross</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Deduction</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Net</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {reportData.salaries.slice(0, 10).map((sal, index) => (
                                                <tr key={index} className="hover:bg-white/5 transition-all duration-300">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <p className="font-medium text-white">{sal.employeeName}</p>
                                                            <p className="text-xs text-blue-200">{sal.employeeNumber}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-blue-200">{sal.department}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-blue-200">
                                                        {sal.monthName} {sal.year}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-white">
                                                        {formatCurrency(sal.grossSalary)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-red-400">
                                                        -{formatCurrency(sal.deduction)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-400">
                                                        {formatCurrency(sal.netSalary)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                                                            sal.status === 'paid' 
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : sal.status === 'pending'
                                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                                : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {sal.status === 'paid' && <FaCheckCircle />}
                                                            {sal.status === 'pending' && <FaClock />}
                                                            {sal.status === 'cancelled' && <FaTimes />}
                                                            {sal.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {reportData.salaries.length > 10 && (
                                        <p className="text-center text-blue-200 mt-4">
                                            Showing 10 of {reportData.salaries.length} transactions
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Department Statistics */}
                        {reportData.departmentStats.length > 0 && (
                            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <FaBuilding className="text-indigo-400" />
                                    Department Statistics
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
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {reportData.departmentStats.map((dept, index) => (
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
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
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }
            `}</style>
        </div>
    );
}

export default GetReport;