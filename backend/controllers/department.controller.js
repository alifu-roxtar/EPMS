// department.controller.js
import DepartmentModel from "../models/departmentModel.js";

export const addDepartment = async (req, res) => {
    const { departmentCode, departmentName, grossSalary } = req.body;
    
    try {
        // Get userId from the authenticated user (set by auth middleware)
        const userId = req.user._id;
        
        const exists = await DepartmentModel.findOne({ 
            departmentCode,
            userId 
        });
        
        if (exists) {
            return res.status(401).json({ 
                msg: "Department Code Already Exists for this User" 
            });
        }

        const department = await DepartmentModel.create({ 
            userId, 
            departmentCode, 
            departmentName, 
            grossSalary 
        });
        
        if (department) {
            return res.status(201).json({ 
                msg: "Department Created Successfully", 
                department 
            });
        } else {
            return res.status(401).json({ 
                msg: "Failed To Create Department" 
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            msg: "Server Error" 
        });
    }
}

export const AllDepartments = async (req, res) => {
    try {
        // Get userId from authenticated user instead of params
        const userId = req.user._id;
        
        const departments = await DepartmentModel.find({ userId })
            .sort({ createdAt: -1 }); // Sort by newest first
            
        return res.status(200).json(departments);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            msg: "Failed To Fetch Departments" 
        });
    }
}

export const getDepartment = async (req, res) => {
    const departmentId = req.params.id;
    
    try {
        const department = await DepartmentModel.findOne({ 
            _id: departmentId,
            userId: req.user._id // Ensure user owns this department
        });
        
        if (department) {
            return res.status(200).json(department);
        } else {
            return res.status(404).json({ 
                msg: "Department Not Found" 
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            msg: "Failed To Fetch Department" 
        });
    }
}

export const editDepartment = async (req, res) => {
    const departmentId = req.params.id;
    
    try {
        const updated = await DepartmentModel.findOneAndUpdate(
            { 
                _id: departmentId,
                userId: req.user._id // Ensure user owns this department
            }, 
            req.body,
            { new: true } // Return updated document
        );
        
        if (updated) {
            return res.status(200).json({ 
                msg: "Department Updated Successfully", 
                department: updated 
            });
        } else {
            return res.status(404).json({ 
                msg: "Department Not Found" 
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            msg: "Failed To Update Department" 
        });
    }
}

export const DeleteDepartment = async (req, res) => {
    const departmentId = req.params.id;
    
    try {
        const deleted = await DepartmentModel.findOneAndDelete({ 
            _id: departmentId,
            userId: req.user._id // Ensure user owns this department
        });
        
        if (deleted) {
            return res.status(200).json({ 
                msg: "Department Deleted Successfully" 
            });
        } else {
            return res.status(404).json({ 
                msg: "Department Not Found" 
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            msg: "Failed To Delete Department" 
        });
    }
}