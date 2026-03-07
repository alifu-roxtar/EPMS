// controllers/salary.controller.js
import SalaryModel from "../models/salaryModel.js";
import EmployeeModel from "../models/employeeModel.js";
import DepartmentModel from "../models/departmentModel.js";

// Helper function to check if user owns the employee
const checkEmployeeOwnership = async (employeeId, userId) => {
    try {
        console.log(`Checking ownership for employee: ${employeeId}, user: ${userId}`);
        
        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) {
            console.log(`Employee not found: ${employeeId}`);
            return false;
        }
        
        console.log(`Employee found, departmentId: ${employee.departmentId}`);
        
        const department = await DepartmentModel.findOne({
            _id: employee.departmentId,
            userId: userId
        });
        
        console.log(`Department ownership check: ${!!department}`);
        return !!department;
    } catch (error) {
        console.error("Error in checkEmployeeOwnership:", error);
        return false;
    }
};

// Get all salaries for logged-in user
export const getAllSalaries = async (req, res) => {
    try {
        console.log("Fetching salaries for user:", req.user._id);
        
        // Get all employees from user's departments
        const userDepartments = await DepartmentModel.find({ userId: req.user._id }).distinct('_id');
        console.log(`User departments: ${userDepartments.length}`);
        
        const employees = await EmployeeModel.find({ 
            departmentId: { $in: userDepartments } 
        }).distinct('_id');
        console.log(`Employees in user's departments: ${employees.length}`);
        
        // Get salaries for those employees
        const salaries = await SalaryModel.find({ 
            employeeId: { $in: employees } 
        })
        .populate({
            path: 'employeeId',
            populate: {
                path: 'departmentId',
                select: 'departmentName departmentCode'
            }
        })
        .sort({ year: -1, month: -1, createdAt: -1 });

        console.log(`Found ${salaries.length} salaries`);

        return res.status(200).json({
            success: true,
            salaries
        });
    } catch (error) {
        console.error("Error in getAllSalaries:", error);
        return res.status(500).json({ 
            success: false,
            msg: "Failed To Fetch Salaries",
            error: error.message 
        });
    }
};

// Create salary - FIXED VERSION
export const createSalary = async (req, res) => {
    console.log("Create salary request received");
    console.log("Request body:", req.body);
    console.log("User:", req.user?._id);

    const {
        employeeId,
        GrossSalary,
        TotalDeduction,
        month,
        year,
        paymentMethod,
        notes,
        status
    } = req.body;

    // Validate required fields
    if (!employeeId) {
        console.log("Missing employeeId");
        return res.status(400).json({
            success: false,
            msg: "Employee ID is required"
        });
    }

    if (!GrossSalary) {
        console.log("Missing GrossSalary");
        return res.status(400).json({
            success: false,
            msg: "Gross salary is required"
        });
    }

    if (!month) {
        console.log("Missing month");
        return res.status(400).json({
            success: false,
            msg: "Month is required"
        });
    }

    if (!year) {
        console.log("Missing year");
        return res.status(400).json({
            success: false,
            msg: "Year is required"
        });
    }

    try {
        // Check if employee exists and user owns it
        console.log(`Checking employee ownership for ID: ${employeeId}`);
        
        // First, check if employee exists
        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) {
            console.log(`Employee not found with ID: ${employeeId}`);
            return res.status(404).json({
                success: false,
                msg: "Employee not found"
            });
        }
        
        console.log(`Employee found: ${employee.FirstName} ${employee.LastName}`);
        console.log(`Employee department: ${employee.departmentId}`);

        console.log("Department ownership verified");

        // Calculate Net Salary
        const deductionAmount = TotalDeduction || 0;
        const NetSalary = Number(GrossSalary) - Number(deductionAmount);

        // Check if salary already exists for this employee in the same month/year
        const existingSalary = await SalaryModel.findOne({
            employeeId,
            month: Number(month),
            year: Number(year)
        });

        if (existingSalary) {
            console.log(`Salary already exists for employee ${employeeId} in ${month}/${year}`);
            return res.status(400).json({
                success: false,
                msg: "Salary already exists for this employee in the specified month/year"
            });
        }

        // Create the salary - NOW INCLUDING departmentId from the employee
        const salaryData = {
            employeeId,
            departmentId: employee.departmentId, // Add this line to include departmentId
            userId: req.user._id,
            GrossSalary: Number(GrossSalary),
            TotalDeduction: Number(deductionAmount),
            NetSalary: Number(NetSalary),
            month: Number(month),
            year: Number(year),
            paymentMethod: paymentMethod || 'bank transfer',
            notes: notes || '',
            status: status || 'pending',
            paymentDate: status === 'paid' ? new Date() : null
        };

        console.log("Creating salary with data:", salaryData);

        const salary = await SalaryModel.create(salaryData);

        // Populate the created salary
        const populatedSalary = await SalaryModel.findById(salary._id)
            .populate({
                path: 'employeeId'
            })

        console.log("Salary created successfully:", populatedSalary._id);

        return res.status(201).json({
            success: true,
            msg: "Salary Created Successfully",
            salary: populatedSalary
        });
    } catch (error) {
        console.error("Error in createSalary:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "Salary already exists for this employee in the specified month/year"
            });
        }

        return res.status(500).json({ 
            success: false,
            msg: "Failed To Create Salary",
            error: error.message 
        });
    }
};
// Get salary by ID
export const getSalaryById = async (req, res) => {
    const salaryId = req.params.id;
    console.log(`Fetching salary by ID: ${salaryId}`);
    
    try {
        const salary = await SalaryModel.findById(salaryId)
            .populate({
                path: 'employeeId',
                populate: {
                    path: 'departmentId',
                    select: 'departmentName departmentCode'
                }
            });

        if (!salary) {
            console.log(`Salary not found with ID: ${salaryId}`);
            return res.status(404).json({ 
                success: false,
                msg: "Salary Not Found" 
            });
        }

        // Check if user owns this salary
        if (salary.userId.toString() !== req.user._id.toString()) {
            console.log(`User ${req.user._id} does not own salary ${salaryId}`);
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to view this salary"
            });
        }

        console.log(`Salary found: ${salary._id}`);
        return res.status(200).json({
            success: true,
            salary
        });
    } catch (error) {
        console.error("Error in getSalaryById:", error);
        return res.status(500).json({ 
            success: false,
            msg: "Failed To Fetch Salary",
            error: error.message 
        });
    }
};

// Get salaries by employee
export const getSalariesByEmployee = async (req, res) => {
    const employeeId = req.params.employeeId;
    console.log(`Fetching salaries for employee: ${employeeId}`);
    
    try {
        // Check if user owns this employee
        const hasAccess = await checkEmployeeOwnership(employeeId, req.user._id);
        if (!hasAccess) {
            console.log(`User does not have access to employee: ${employeeId}`);
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to view salaries for this employee"
            });
        }

        const salaries = await SalaryModel.find({ employeeId })
            .populate({
                path: 'employeeId',
                populate: {
                    path: 'departmentId',
                    select: 'departmentName departmentCode'
                }
            })
            .sort({ year: -1, month: -1 });

        console.log(`Found ${salaries.length} salaries for employee ${employeeId}`);
        return res.status(200).json({
            success: true,
            salaries
        });
    } catch (error) {
        console.error("Error in getSalariesByEmployee:", error);
        return res.status(500).json({ 
            success: false,
            msg: "Failed To Fetch Salaries",
            error: error.message 
        });
    }
};

// Get salary statistics
export const getSalaryStats = async (req, res) => {
    console.log("Fetching salary stats for user:", req.user._id);
    
    try {
        // Get all employees from user's departments
        const userDepartments = await DepartmentModel.find({ userId: req.user._id }).distinct('_id');
        const employees = await EmployeeModel.find({ 
            departmentId: { $in: userDepartments } 
        }).distinct('_id');
        
        // Get salaries for those employees
        const salaries = await SalaryModel.find({ 
            employeeId: { $in: employees } 
        });

        // Calculate statistics
        const totalPaid = salaries
            .filter(s => s.status === 'paid')
            .reduce((sum, s) => sum + s.NetSalary, 0);
        
        const totalPending = salaries
            .filter(s => s.status === 'pending')
            .reduce((sum, s) => sum + s.NetSalary, 0);

        const stats = {
            totalSalaries: salaries.length,
            totalAmount: salaries.reduce((sum, s) => sum + s.NetSalary, 0),
            totalPaid,
            totalPending,
            averageSalary: salaries.length > 0 
                ? salaries.reduce((sum, s) => sum + s.NetSalary, 0) / salaries.length 
                : 0,
            byMonth: {},
            byStatus: {
                paid: salaries.filter(s => s.status === 'paid').length,
                pending: salaries.filter(s => s.status === 'pending').length,
                cancelled: salaries.filter(s => s.status === 'cancelled').length
            }
        };

        console.log("Stats calculated successfully");
        return res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("Error in getSalaryStats:", error);
        return res.status(500).json({ 
            success: false,
            msg: "Failed To Fetch Statistics",
            error: error.message 
        });
    }
};

// Update salary
export const updateSalary = async (req, res) => {
    const salaryId = req.params.id;
    console.log(`Updating salary: ${salaryId}`);
    console.log("Update data:", req.body);
    
    try {
        const existingSalary = await SalaryModel.findById(salaryId);

        if (!existingSalary) {
            console.log(`Salary not found: ${salaryId}`);
            return res.status(404).json({ 
                success: false,
                msg: "Salary Not Found" 
            });
        }

        // Check if user owns this salary
        if (existingSalary.userId.toString() !== req.user._id.toString()) {
            console.log(`User ${req.user._id} does not own salary ${salaryId}`);
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to update this salary"
            });
        }

        // Calculate new Net Salary if Gross or Deduction changed
        const GrossSalary = req.body.GrossSalary || existingSalary.GrossSalary;
        const TotalDeduction = req.body.TotalDeduction || existingSalary.TotalDeduction;
        const NetSalary = GrossSalary - TotalDeduction;

        const updated = await SalaryModel.findByIdAndUpdate(
            salaryId,
            {
                ...req.body,
                NetSalary,
                userId: req.user._id // Ensure userId remains the same
            },
            { new: true }
        ).populate({
            path: 'employeeId',
            populate: {
                path: 'departmentId',
                select: 'departmentName departmentCode'
            }
        });

        console.log("Salary updated successfully:", updated._id);
        return res.status(200).json({
            success: true,
            msg: "Salary Updated Successfully",
            salary: updated
        });
    } catch (error) {
        console.error("Error in updateSalary:", error);
        return res.status(500).json({ 
            success: false,
            msg: "Failed To Update Salary",
            error: error.message 
        });
    }
};

// Delete salary
export const deleteSalary = async (req, res) => {
    const salaryId = req.params.id;
    console.log(`Deleting salary: ${salaryId}`);
    
    try {
        const salary = await SalaryModel.findById(salaryId);

        if (!salary) {
            console.log(`Salary not found: ${salaryId}`);
            return res.status(404).json({ 
                success: false,
                msg: "Salary Not Found" 
            });
        }

        // Check if user owns this salary
        if (salary.userId.toString() !== req.user._id.toString()) {
            console.log(`User ${req.user._id} does not own salary ${salaryId}`);
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to delete this salary"
            });
        }

        await SalaryModel.findByIdAndDelete(salaryId);

        console.log("Salary deleted successfully");
        return res.status(200).json({
            success: true,
            msg: "Salary Deleted Successfully"
        });
    } catch (error) {
        console.error("Error in deleteSalary:", error);
        return res.status(500).json({ 
            success: false,
            msg: "Failed To Delete Salary",
            error: error.message 
        });
    }
};