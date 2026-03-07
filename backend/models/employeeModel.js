// models/employeeModel.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    employeeNumber: {
        type: String,
        required: true
    },
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Position: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    Telephone: {
        type: String,
        required: true
    },
    Gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    email: {
        type: String,
        sparse: true
    },
    dateHired: {
        type: Date
    },
    salary: {
        type: Number,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on leave'],
        default: 'active'
    },
    salaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salary'
    }
}, {
    timestamps: true
});

// Compound index to ensure employee number is unique per user
employeeSchema.index({ userId: 1, employeeNumber: 1 }, { unique: true });

const EmployeeModel = mongoose.model('Employee', employeeSchema);
export default EmployeeModel;