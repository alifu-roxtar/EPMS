// models/salaryModel.js
import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    employeeId: { 
        type: mongoose.Types.ObjectId, 
        ref: "Employee",
        required: true
    },
    userId: { 
        type: mongoose.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    GrossSalary: { 
        type: Number, 
        required: true,
        min: 0 
    },
    TotalDeduction: { 
        type: Number, 
        required: true,
        min: 0,
        default: 0
    },
    NetSalary: { 
        type: Number, 
        required: true,
        min: 0 
    },
    month: { 
        type: Number, 
        required: true,
        min: 1,
        max: 12
    },
    year: { 
        type: Number, 
        required: true,
        default: new Date().getFullYear()
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['bank transfer', 'cash', 'check'],
        default: 'bank transfer'
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, { 
    timestamps: true 
});

// Compound index to ensure no duplicate salary for same employee in same month/year
salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const SalaryModel = mongoose.model('Salary', salarySchema);
export default SalaryModel;