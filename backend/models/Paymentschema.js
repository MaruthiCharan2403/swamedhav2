const mongoose = require("mongoose");

const InstallmentSchema = new mongoose.Schema({
    installmentNumber: { type: Number, required: true }, 
    dueDate: { type: Date, required: true }, 
    amountDue: { type: Number, required: true }, 
    amountPaid: { type: Number, default: 0 }, 
    utrNumber: { type: String }, 
    status: { type: String, enum: ["pending", "paid", "overdue","pending_approval"], default: "pending" } 
}, { _id: false }); 

const PaymentSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    email: { type: String, required: true },
    courses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        levelName: { type: String, required: true }, 
        pricing: {
            school: { type: Number, required: true }, 
        },
        studentCount: { type: Number }, 
        amountPaid: { type: Number, required: true }, 
    }],
    paymentType: { type: String, enum: ["School", "Student", "StudentB2C"], required: true }, 
    totalAmount: { type: Number, required: true }, 
    totalAmountPaid: { type: Number, default: 0 }, 
    paymentMethod: { type: String, enum: ["full", "emi"], required: true }, 
    emiDetails: {
        numberOfInstallments: { type: Number }, 
        installmentAmount: { type: Number }, 
        installments: [InstallmentSchema], 
    },
    utrNumber: { type: String, unique: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "partially_paid"], default: "pending" } // Payment status
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);