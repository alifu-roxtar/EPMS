import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import DepartmentRoutes from "./routes/department.routes.js";
import EmployeeRouter from "./routes/employee.routes.js";
import SalaryRoutes from "./routes/salar.routes.js";


import { devLiteMonitorRealtime } from "devlite-monitor";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use(devLiteMonitorRealtime({
    apiKey: ''
}))

connectDB();

app.get('/', (req,res)=>{
    res.send('Server Is Running')
});

app.use('/api/users', userRouter);
app.use('/api/departments', DepartmentRoutes);
app.use('/api/employees', EmployeeRouter);
app.use('/api/salaries', SalaryRoutes);

app.listen(port, ()=>{
    console.log(`App Connection Port: http://localhost:${port}`);
})