const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true},
    phone: { type: String, required: true },
    Class: { type: String, required: true },
    fathername: { type: String, required: true },
    dob: { type: Date, required: true },
    coursesBought: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
        classDetails: [{
            classNumber: { type: Number, required: true },
            status: { type: String, enum: ["active", "hold", "blocked"], default: "hold" },
        }],
        expiryDate: { type: Date, required: true }
    }],
}, { timestamps: true });

module.exports = mongoose.model("Studentb2c", StudentSchema);
