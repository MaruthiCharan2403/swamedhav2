const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Adjust the path to your Course model
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// Add a new level (course)
router.post("/add", async (req, res) => {
    try {
        const { levelName, terms} = req.body;

        // Validate required fields
        if (!levelName || !terms) {
            return res.status(400).json({ message: "levelName, terms, and pricing are required" });
        }

        // Validate that terms is an array and has valid structure
        if (!Array.isArray(terms) || terms.length === 0) {
            return res.status(400).json({ message: "terms must be a non-empty array" });
        }

        

        const newLevel = new Course({ levelName, terms });
        await newLevel.save();

        res.json({ message: "Level added successfully", level: newLevel });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all levels (courses)
router.get("/", async (req, res) => {
    try {
        const levels = await Course.find({});
        res.status(200).json(levels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all levels with filtered data
router.get("/get", async (req, res) => {
    try {
        const levels = await Course.find();
        const filteredLevels = levels.map(level => ({
            _id: level._id,
            levelName: level.levelName,
            terms: level.terms.map(term => ({
                _id: term._id,
                termName: term.termName
            }))
        }));
        res.json(filteredLevels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/getdata", async (req, res) => {
    try {
        const levels = await Course.find();
        const filteredLevels = levels.map(level => ({
            _id: level._id,
            levelName: level.levelName,
        }));

        res.json(filteredLevels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//get all levels and terms of a level

router.get("/getall", async (req, res) => {
    try {
        const levels = await Course.find();
        const filteredLevels = levels.map(level => ({
            _id: level._id,
            levelName: level.levelName,
            terms: level.terms,
        }));

        res.json(filteredLevels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//get the terms of a level
router.get("/terms/:levelId", async (req, res) => {
    try {
        const { levelId } = req.params;
        const level = await Course.findById(levelId);
        if (!level) return res.status(404).json({ message: "Level not found" });
        //only term names and ids are returned
        res.json(level.terms.map(term => ({ _id: term._id, name: term.termName })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//get a specific term of a level
router.get("/terms/:levelId/:termId", async (req, res) => {
    try {
        const {termId } = req.params;
        const level = await Course.findById(req.params.levelId);
        if (!level) return res.status(404).json({ message: "Level not found" });
        res.json(level.terms.id(termId));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific level by ID
router.get("/:levelId", async (req, res) => {
    try {
        const { levelId } = req.params;
        const level = await Course.findById(levelId);
        if (!level) return res.status(404).json({ message: "Level not found" });
        res.json(level);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a specific level by ID
router.put("/:levelId", async (req, res) => {
    try {
        const { levelId } = req.params;
        const { levelName, terms} = req.body;

        // Validate required fields
        if (!levelName || !terms ) {
            return res.status(400).json({ message: "levelName, terms, and pricing are required" });
        }

        const updatedLevel = await Course.findByIdAndUpdate(
            levelId,
            { levelName, terms },
            { new: true } // Return the updated document
        );

        if (!updatedLevel) {
            return res.status(404).json({ message: "Level not found" });
        }

        res.json({ message: "Level updated successfully", level: updatedLevel });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a specific level by ID
router.delete("/:levelId", async (req, res) => {
    try {
        const { levelId } = req.params;
        const deletedLevel = await Course.findByIdAndDelete(levelId);

        if (!deletedLevel) {
            return res.status(404).json({ message: "Level not found" });
        }

        res.json({ message: "Level deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


