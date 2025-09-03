const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["superadmin", "admin", "school", "teacher", "student","studentb2c","trainer"], required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null }, // For schools and teachers
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null }, // For students
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null }, // For teachers
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", default: null }, // For trainers
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
