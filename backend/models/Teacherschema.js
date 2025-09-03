const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    subject: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    assignedStudents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", TeacherSchema);