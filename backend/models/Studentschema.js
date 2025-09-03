const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    dateSubmitted: { type: Date, default: Date.now }
});

const DoubtSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    termId: { type: mongoose.Schema.Types.ObjectId },
    topicId: { type: mongoose.Schema.Types.ObjectId },
    question: { type: String, required: true },
    datePosted: { type: Date, default: Date.now },
    answer: { type: String, default: null },
    dateAnswered: { type: Date, default: null },
    status: { type: String, enum: ["pending", "answered"], default: "pending" }
});

const StudentProgressSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    termId: { type: mongoose.Schema.Types.ObjectId },
    topicId: { type: mongoose.Schema.Types.ObjectId },
    completed: { type: Boolean, default: false },
    finalsubmission: { type: String, default: null },
    programs: [ProgramSchema],
    doubts: [DoubtSchema]
});

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String },
    class: { type: String },
    section: { type: String },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedCourses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        levelName: { type: String },
        assignedTerms: [{ 
            termId: { type: mongoose.Schema.Types.ObjectId },
            termName: { type: String }
        }]
    }],
    progress: [StudentProgressSchema]
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema);