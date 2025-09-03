const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    udiseCode: { type: String, unique: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, default: null },
    availableCourses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        levelName: { type: String },
        isAvailable: { type: Boolean, default: true }
    }],
    enabledCourses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        levelName: { type: String },
        enabledTerms: [{ 
            termId: { type: mongoose.Schema.Types.ObjectId },
            termName: { type: String },
            isEnabled: { type: Boolean, default: false }
        }],
        studentcount: { type: Number, default: 0 },
        currentcount: { type: Number, default: 0 }
    }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trainer" }],
}, { timestamps: true });

module.exports = mongoose.model("School", SchoolSchema);