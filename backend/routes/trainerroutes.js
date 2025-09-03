const express = require('express');
const router = express.Router();
const Trainer = require('../models/TrainerSchema');
const Course = require('../models/Course');
const auth = require('../middleware/auth');


// assign courses to a trainer
router.put('/assignCourses/:trainerId',auth, async (req, res) => {
    const { courseIds } = req.body;
    try {
        const trainer = await Trainer.findByIdAndUpdate(
            req.params.trainerId,
            { $set: { enabledCourses: courseIds } },
            { new: true }
        ).populate('enabledCourses');
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }
        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//view assigned courses of a trainer
router.get('/viewAssignedCourses/:trainerId',auth, async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.trainerId).populate('enabledCourses');
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }
        res.status(200).json(trainer.enabledCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const trainers = await Trainer.find().populate('enabledCourses');
        res.status(200).json(trainers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//get only the enabled courses of a trainer

router.get('/getlevels', auth, async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.user.trainerId).populate('enabledCourses');
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }
        const enabledCourses = trainer.enabledCourses.map(course => ({
            _id: course._id,
            levelName: course.levelName,
            terms: course.terms.map(term => ({
                termName: term.termName,
                termId: term._id,
                topics: term.topics.map(topic => ({
                    topicName: topic.topicName,
                    contents: topic.contents
                }))
            })),
            pricing: course.pricing
        }));
        res.status(200).json(enabledCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;