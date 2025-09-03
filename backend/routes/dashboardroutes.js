const express = require('express');
const router = express.Router();
const School = require('../models/Schoolschema');
const Student = require('../models/Studentschema');
const Teacher = require('../models/Teacherschema');
const auth = require('../middleware/auth');

// Get all schools
router.get('/schools', async (req, res) => {
    try {
        const schools = await School.find().populate('userId').populate('students').populate('teachers');
        res.json(schools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const students = await Student.find().populate('schoolId').populate('assignedTeacher').populate('userId');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all teachers
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('schoolId').populate('userId');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/schooldata',auth, async (req, res) => {
    try {
      const schoolId  = req.user.schoolId;
      // Get school details
      const school = await School.findById(schoolId)
        .populate('userId', 'name email')
        .lean();
      
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
  
      // Get students for this school
      const students = await Student.find({ schoolId })
        .populate('assignedTeacher', 'name email')
        .lean();
  
      // Get teachers for this school
      const teachers = await Teacher.find({ schoolId }).lean();
  
      // Calculate student statistics
      const studentStats = {
        total: students.length,
        byClass: {},
        courseEnrollment: {}
      };
  
      // Calculate course statistics
      const courseStats = {
        available: school.availableCourses?.length || 0,
        enabled: school.enabledCourses?.length || 0,
        enrollment: {},
        completionRates: {}
      };
  
      // Process student data for statistics
      students.forEach(student => {
        // Count by class
        if (student.class) {
          studentStats.byClass[student.class] = (studentStats.byClass[student.class] || 0) + 1;
        }
  
        // Count course enrollments
        if (student.assignedCourses && student.assignedCourses.length > 0) {
          student.assignedCourses.forEach(course => {
            const courseName = course.levelName || 'Unknown';
            studentStats.courseEnrollment[courseName] = (studentStats.courseEnrollment[courseName] || 0) + 1;
          });
        }
  
        // Calculate progress statistics
        if (student.progress && student.progress.length > 0) {
          student.progress.forEach(p => {
            const courseId = p.courseId?.toString();
            if (courseId) {
              if (!courseStats.completionRates[courseId]) {
                courseStats.completionRates[courseId] = {
                  total: 0,
                  completed: 0,
                  name: ''
                };
              }
              
              courseStats.completionRates[courseId].total += 1;
              if (p.completed) {
                courseStats.completionRates[courseId].completed += 1;
              }
            }
          });
        }
      });
  
      // Process school course data
      if (school.enabledCourses && school.enabledCourses.length > 0) {
        school.enabledCourses.forEach(course => {
          const courseId = course.courseId?.toString();
          const levelName = course.levelName || 'Unknown';
          
          courseStats.enrollment[courseId] = {
            name: levelName,
            capacity: course.studentcount || 0,
            current: course.currentcount || 0
          };
          
          // Add course name to completion rates
          if (courseStats.completionRates[courseId]) {
            courseStats.completionRates[courseId].name = levelName;
          }
        });
      }
  
      // Calculate teacher statistics
      const teacherStats = {
        total: teachers.length,
        studentsPerTeacher: teachers.length ? (students.length / teachers.length).toFixed(1) : 0,
        teachersWithStudents: teachers.filter(t => t.assignedStudents && t.assignedStudents.length > 0).length
      };
  
      // Prepare dashboard data
      const dashboardData = {
        school,
        stats: {
          students: studentStats,
          teachers: teacherStats,
          courses: courseStats
        }
      };
  
      res.json(dashboardData);
    } catch (error) {
      console.error('Error fetching school dashboard data:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get student progress for a school
  router.get('/school/progress',auth, async (req, res) => {
    try {
      const schoolId = req.user.schoolId;
      const students = await Student.find({ schoolId }).lean();
      
      // Calculate progress statistics
      const progressStats = {
        totalTopics: 0,
        completedTopics: 0,
        totalPrograms: 0,
        pendingDoubts: 0,
        answeredDoubts: 0,
        byCourse: {}
      };
      
      students.forEach(student => {
        if (student.progress && student.progress.length > 0) {
          student.progress.forEach(p => {
            progressStats.totalTopics++;
            if (p.completed) progressStats.completedTopics++;
            
            // Count programs
            if (p.programs && p.programs.length > 0) {
              progressStats.totalPrograms += p.programs.length;
            }
            
            // Count doubts
            if (p.doubts && p.doubts.length > 0) {
              p.doubts.forEach(doubt => {
                if (doubt.status === 'pending') progressStats.pendingDoubts++;
                else if (doubt.status === 'answered') progressStats.answeredDoubts++;
              });
            }
            
            // Group by course
            const courseId = p.courseId?.toString();
            if (courseId) {
              if (!progressStats.byCourse[courseId]) {
                progressStats.byCourse[courseId] = {
                  total: 0,
                  completed: 0,
                  programs: 0,
                  doubts: 0
                };
              }
              
              progressStats.byCourse[courseId].total++;
              if (p.completed) progressStats.byCourse[courseId].completed++;
              if (p.programs) progressStats.byCourse[courseId].programs += p.programs.length;
              if (p.doubts) progressStats.byCourse[courseId].doubts += p.doubts.length;
            }
          });
        }
      });
      
      res.json(progressStats);
    } catch (error) {
      console.error('Error fetching school progress data:', error);
      res.status(500).json({ message: error.message });
    }
  });
  


module.exports = router;