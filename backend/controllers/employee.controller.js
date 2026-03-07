// controllers/employee.controller.js
import EmployeeModel from "../models/employeeModel.js";
import DepartmentModel from "../models/departmentModel.js";

// Helper function to check if user owns the department
const checkDepartmentOwnership = async (departmentId, userId) => {
    const department = await DepartmentModel.findOne({
        _id: departmentId,
        userId: userId
    });
    return !!department;
};

export const AddEmployee = async (req, res) => {
    const {
        departmentId,
        employeeNumber,
        FirstName,
        LastName,
        Position,
        Address,
        Telephone,
        Gender,
        email,
        dateHired,
        salary
    } = req.body;

    try {
        // Check if user owns this department
        const hasAccess = await checkDepartmentOwnership(departmentId, req.user._id);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to add employees to this department"
            });
        }

        // Check if employee number already exists in user's departments
        const existingEmployee = await EmployeeModel.findOne({
            employeeNumber,
            departmentId: { $in: await DepartmentModel.find({ userId: req.user._id }).distinct('_id') }
        });

        if (existingEmployee) {
            return res.status(401).json({
                success: false,
                msg: "Employee Number Already Exists"
            });
        }

        const employee = await EmployeeModel.create({
            departmentId,
            employeeNumber,
            FirstName,
            LastName,
            Position,
            Address,
            Telephone,
            Gender,
            email,
            dateHired,
            salary
        });

        if (employee) {
            // Populate department details
            const populatedEmployee = await EmployeeModel.findById(employee._id)
                .populate('departmentId', 'departmentName departmentCode');
            
            return res.status(201).json({
                success: true,
                msg: "Employee Created Successfully",
                employee: populatedEmployee
            });
        } else {
            return res.status(400).json({
                success: false,
                msg: "Error While Creating Employee"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Server Error"
        });
    }
};

export const AllEmployees = async (req, res) => {
    try {
        // Get all departments owned by the user
        const userDepartments = await DepartmentModel.find({ userId: req.user._id }).distinct('_id');
        
        // Get employees only from those departments
        const employees = await EmployeeModel.find({
            departmentId: { $in: userDepartments }
        }).populate('departmentId', 'departmentName departmentCode').sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            employees
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Failed To Fetch Employees"
        });
    }
};

export const getEmployeeById = async (req, res) => {
    const employeeId = req.params.id;
    
    try {
        const employee = await EmployeeModel.findById(employeeId)
            .populate('departmentId', 'departmentName departmentCode');
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                msg: "Employee Not Found"
            });
        }

        // Check if user owns the department this employee belongs to
        const hasAccess = await checkDepartmentOwnership(employee.departmentId, req.user._id);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to view this employee"
            });
        }
        
        return res.status(200).json({
            success: true,
            employee
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Error in fetching"
        });
    }
};

export const updateEmployee = async (req, res) => {
    const employeeId = req.params.id;
    
    try {
        // First get the employee to check department ownership
        const existingEmployee = await EmployeeModel.findById(employeeId);
        
        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                msg: "Employee Not Found"
            });
        }

        // Check if user owns the department
        const hasAccess = await checkDepartmentOwnership(existingEmployee.departmentId, req.user._id);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to update this employee"
            });
        }

        // If department is being changed, check ownership of new department
        if (req.body.departmentId && req.body.departmentId !== existingEmployee.departmentId.toString()) {
            const hasNewDepartmentAccess = await checkDepartmentOwnership(req.body.departmentId, req.user._id);
            if (!hasNewDepartmentAccess) {
                return res.status(403).json({
                    success: false,
                    msg: "You don't have permission to move employee to that department"
                });
            }
        }

        const updated = await EmployeeModel.findByIdAndUpdate(
            employeeId,
            req.body,
            { new: true }
        ).populate('departmentId', 'departmentName departmentCode');

        return res.status(200).json({
            success: true,
            msg: "Employee Updated Successfully",
            employee: updated
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Failed To Update"
        });
    }
};

export const deleteEmployee = async (req, res) => {
    const employeeId = req.params.id;
    
    try {
        // First get the employee to check department ownership
        const existingEmployee = await EmployeeModel.findById(employeeId);
        
        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                msg: "Employee Not Found"
            });
        }

        // Check if user owns the department
        const hasAccess = await checkDepartmentOwnership(existingEmployee.departmentId, req.user._id);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to delete this employee"
            });
        }

        await EmployeeModel.findByIdAndDelete(employeeId);

        return res.status(200).json({
            success: true,
            msg: "Employee Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Failed To Delete Employee"
        });
    }
};

// Get employees by department
export const getEmployeesByDepartment = async (req, res) => {
    const departmentId = req.params.departmentId;
    
    try {
        // Check if user owns this department
        const hasAccess = await checkDepartmentOwnership(departmentId, req.user._id);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                msg: "You don't have permission to view employees in this department"
            });
        }

        const employees = await EmployeeModel.find({ departmentId })
            .populate('departmentId', 'departmentName departmentCode')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            employees
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Failed To Fetch Employees"
        });
    }
};

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
    try {
        // Get all departments owned by the user
        const userDepartments = await DepartmentModel.find({ userId: req.user._id }).distinct('_id');
        
        // Get all employees from those departments
        const employees = await EmployeeModel.find({
            departmentId: { $in: userDepartments }
        });

        // Calculate statistics
        const stats = {
            totalEmployees: employees.length,
            byDepartment: {},
            byGender: {
                male: employees.filter(e => e.Gender === 'male').length,
                female: employees.filter(e => e.Gender === 'female').length,
                other: employees.filter(e => e.Gender === 'other').length
            },
            totalSalary: employees.reduce((sum, e) => sum + (e.salary || 0), 0),
            averageSalary: employees.length > 0 
                ? employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length 
                : 0
        };

        // Get department names
        const departments = await DepartmentModel.find({
            _id: { $in: userDepartments }
        });

        departments.forEach(dept => {
            stats.byDepartment[dept.departmentName] = employees.filter(
                e => e.departmentId.toString() === dept._id.toString()
            ).length;
        });

        return res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Failed To Fetch Statistics"
        });
    }
};