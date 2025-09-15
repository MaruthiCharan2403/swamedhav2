const mongoose = require("mongoose");

const Csschema = new mongoose.Schema({
    coursename: { type: String, required: true },
    classnumber: { type: Number, required: true },
    topicname: { type: String, required: true },
    subtopicname: { type: String, required: true },
    contentname: { type: String, required: true },
    content: { type: String, required: true },
});

const Content = mongoose.model("Ganitacontent", Csschema);
module.exports = Content;

