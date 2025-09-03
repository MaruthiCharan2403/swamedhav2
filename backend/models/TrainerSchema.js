const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    schoolIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'School',default: [] }],
    enabledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course',default: [] }],
})

module.exports = mongoose.model('Trainer', TrainerSchema);