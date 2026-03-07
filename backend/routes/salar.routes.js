// routes/salary.routes.js
import express from "express";
import { 
    getAllSalaries,
    createSalary,
    getSalaryById,
    updateSalary,
    deleteSalary,
    getSalariesByEmployee,
    getSalaryStats
} from "../controllers/salary.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const SalaryRoutes = express.Router();

// Debug middleware to log all requests to salary routes
SalaryRoutes.use((req, res, next) => {
    console.log(`Salary Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
});

// Protect all routes
SalaryRoutes.use(protect);

// Define routes - order matters! More specific routes first
SalaryRoutes.get('/stats', getSalaryStats); // This should come before '/all'
SalaryRoutes.get('/employee/:employeeId', getSalariesByEmployee);
SalaryRoutes.get('/all', getAllSalaries);
SalaryRoutes.get('/single/:id', getSalaryById);
SalaryRoutes.post('/create', createSalary);
SalaryRoutes.put('/edit/:id', updateSalary);
SalaryRoutes.delete('/remove/:id', deleteSalary);

// Export the router
export default SalaryRoutes;