import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "user", required: true},
    departmentCode : { type: String, unique: true, required: true },
    departmentName: { type: String, required: true },
    grossSalary: { type: Number, required: true }
}, { timestamps: true});

const DepartmentModel = mongoose.model('department', departmentSchema);

export default DepartmentModel;