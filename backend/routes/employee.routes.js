// routes/employee.routes.js
import express from "express";
import {
    AddEmployee,
    AllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getEmployeesByDepartment,
    getEmployeeStats
} from "../controllers/employee.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const EmployeeRouter = express.Router();

// Protect all routes
EmployeeRouter.use(protect);

// Employee CRUD operations
EmployeeRouter.post('/create', AddEmployee);
EmployeeRouter.get('/all', AllEmployees);
EmployeeRouter.get('/stats', getEmployeeStats);
EmployeeRouter.get('/department/:departmentId', getEmployeesByDepartment);
EmployeeRouter.get('/:id', getEmployeeById);
EmployeeRouter.put('/update/:id', updateEmployee);
EmployeeRouter.delete('/delete/:id', deleteEmployee);

export default EmployeeRouter;