const express = require('express');
const router = express.Router();
const School = require('../models/Schoolschema'); 
const Student = require('../models/Studentschema'); 
const Teacher = require('../models/Teacherschema'); 
const Course = require('../models/Course'); 
const auth = require('../middleware/auth');

router.get('/school/purchases',auth, async (req, res) => {
    if (req.user.role !== 'school') return res.status(401).json({ message: 'Unauthorized' });
    try {
        const schoolId = req.user.schoolId;
        const school = await School.findById(schoolId)
            .populate('coursesBoughtforstudents.courseId')
            .populate('coursesBoughtforschool.courseId');

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Map through the coursesBoughtforstudents to include individual class counts
        const studentPurchases = school.coursesBoughtforstudents.map(purchase => {
            const classDetails = purchase.classDetails.map(classDetail => {
                return {
                    classNumber: classDetail.classNumber,
                    studentLimit: classDetail.studentLimit,
                    currentStudents: classDetail.currentStudents
                };
            });

            return {
                ...purchase.toObject(),
                classDetails: classDetails
            };
        });

        const purchases = {
            studentPurchases: studentPurchases,
            schoolPurchases: school.coursesBoughtforschool
        };

        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get the total count of students associated with a school
router.get('/school/students/count',auth, async (req, res) => {
    if (req.user.role !== 'school') return res.status(401).json({ message: 'Unauthorized' });
    try {
        const schoolId = req.user.schoolId;
        const studentCount = await Student.countDocuments({ schoolId: schoolId });

        res.status(200).json({ studentCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
        const totalSchools = await School.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const totalCourses = await Course.countDocuments();

        const stats = {
            totalSchools,
            totalStudents,
            totalTeachers,
            totalCourses
        };

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get the total count of teachers associated with a school
router.get('/school/teachers/count',auth, async (req, res) => {
    if (req.user.role !== 'school') return res.status(401).json({ message: 'Unauthorized' });
    try {
        const schoolId = req.user.schoolId;
        const teacherCount = await Teacher.countDocuments({ schoolId: schoolId });
        res.status(200).json({ teacherCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get schools by status
router.get('/schools/status',auth, async (req, res) => {
    try {
        const activeSchools = await School.find({ status: 'active' });
        const holdSchools = await School.find({ status: 'hold' });
        const blockedSchools = await School.find({ status: 'blocked' });

        res.status(200).json({
            active: activeSchools,
            hold: holdSchools,
            blocked: blockedSchools
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get schools registered per day (last 30 days)
router.get('/schools/registration-trend',auth, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const registrationTrend = await School.aggregate([
            {
                $match: { createdAt: { $gte: thirtyDaysAgo } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    date: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json(registrationTrend);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get student and teacher growth trends

// Get student and teacher growth trends
router.get('/growth-trend',auth, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const studentTrend = await Student.aggregate([
            {
                $match: { createdAt: { $gte: thirtyDaysAgo } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    students: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    date: "$_id",
                    students: 1,
                    _id: 0
                }
            }
        ]);

        const teacherTrend = await Teacher.aggregate([
            {
                $match: { createdAt: { $gte: thirtyDaysAgo } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    teachers: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    date: "$_id",
                    teachers: 1,
                    _id: 0
                }
            }
        ]);

        // Merge student and teacher trends
        const growthTrend = studentTrend.map(studentDay => {
            const teacherDay = teacherTrend.find(t => t.date === studentDay.date);
            return {
                date: studentDay.date,
                students: studentDay.students,
                teachers: teacherDay ? teacherDay.teachers : 0
            };
        });

        res.status(200).json(growthTrend);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;