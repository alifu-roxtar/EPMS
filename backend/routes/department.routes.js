// routes/department.routes.js
import express from "express";
import {
    addDepartment,
    AllDepartments,
    getDepartment,
    editDepartment,
    DeleteDepartment
} from "../controllers/department.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const DepartmentRoutes = express.Router();

// Protect all routes with authentication middleware
DepartmentRoutes.use(protect);

DepartmentRoutes.post('/add', addDepartment);
DepartmentRoutes.put('/edit/:id', editDepartment);
DepartmentRoutes.get('/all', AllDepartments);
DepartmentRoutes.get('/one/:id', getDepartment);
DepartmentRoutes.delete('/remove/:id', DeleteDepartment);

export default DepartmentRoutes;