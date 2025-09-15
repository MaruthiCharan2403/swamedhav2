const express = require('express');
const Content = require('../models/Content');
const router = express.Router();

router.post('/postdata', async (req, res) => {
    try {
        const { coursename, topicname, subtopicname,classnumber, contentname, content } = req.body;
        const newCourse = new Content({
            coursename,
            topicname,
            subtopicname,
            contentname,
            classnumber,
            content
        });
        await newCourse.save();
        res.status(201).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);  

router.get('/getdata', async (req, res) => {
    try {
        const data = await Content.find();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);

router.get('/getdata/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Content.findById(id);
        if (!data) {
            return res.status(404).json({ error: 'Data not found' });
        }
        res.status(200).json({content: data.content});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContent = await Content.findByIdAndDelete(id);
        if (!deletedContent) {
            return res.status(404).json({ error: 'Content not found' });
        }
        res.status(200).json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);

module.exports = router;