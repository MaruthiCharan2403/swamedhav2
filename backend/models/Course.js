const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    contentPDF: { type: String }, 
    contentVideo: { type: String }, 
    keynotePDF: { type: String } 
});
const TopicSchema = new mongoose.Schema({
    topicName: { type: String, required: true },
    contents: [ContentSchema] 
});
const TermSchema = new mongoose.Schema({
    termName: { type: String, required: true },
    topics: [TopicSchema] 
});
const Courseschema = new mongoose.Schema({
    levelName: { type: String, required: true },
    terms: [TermSchema], 
});
const Course = mongoose.model('Course', Courseschema);

module.exports = Course;