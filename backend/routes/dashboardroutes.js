const express = require('express');
const router = express.Router();
const School = require('../models/Schoolschema');
const Student = require('../models/Studentschema');
const Teacher = require('../models/Teacherschema');
const Payment = require('../models/Paymentschema');
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

// Get all payments
router.get('/payments', async (req, res) => {
    try {
        const payments = await Payment.find().populate('schoolId').populate('studentId');
        res.json(payments);
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
  
      // Get payments for this school
      const payments = await Payment.find({ schoolId }).lean();
  
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
  
      // Calculate payment statistics
      const paymentStats = {
        total: payments.length,
        totalAmount: 0,
        totalPaid: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        partiallyPaid: 0,
        byMonth: {}
      };
  
      payments.forEach(payment => {
        paymentStats.totalAmount += payment.totalAmount || 0;
        paymentStats.totalPaid += payment.totalAmountPaid || 0;
        
        // Count by status
        if (payment.status === 'pending') paymentStats.pending++;
        else if (payment.status === 'approved') paymentStats.approved++;
        else if (payment.status === 'rejected') paymentStats.rejected++;
        else if (payment.status === 'partially_paid') paymentStats.partiallyPaid++;
        
        // Group by month
        if (payment.createdAt) {
          const date = new Date(payment.createdAt);
          const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
          
          if (!paymentStats.byMonth[monthYear]) {
            paymentStats.byMonth[monthYear] = {
              count: 0,
              amount: 0,
              paid: 0
            };
          }
          
          paymentStats.byMonth[monthYear].count++;
          paymentStats.byMonth[monthYear].amount += payment.totalAmount || 0;
          paymentStats.byMonth[monthYear].paid += payment.totalAmountPaid || 0;
        }
      });
  
      // Calculate teacher statistics
      const teacherStats = {
        total: teachers.length,
        studentsPerTeacher: teachers.length ? (students.length / teachers.length).toFixed(1) : 0,
        teachersWithStudents: teachers.filter(t => t.assignedStudents && t.assignedStudents.length > 0).length
      };
  
      // Prepare recent activities
      const recentPayments = payments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
  
      // Prepare dashboard data
      const dashboardData = {
        school,
        stats: {
          students: studentStats,
          teachers: teacherStats,
          courses: courseStats,
          payments: paymentStats
        },
        recent: {
          payments: recentPayments
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
  
  // Get payment trends for a school
  router.get('/school/payment-trends',auth, async (req, res) => {
    try {
      const schoolId = req.user.schoolId;
  
      const payments = await Payment.find({ schoolId }).lean();
      
      // Group payments by month for the last 12 months
      const trends = {};
      const now = new Date();
      
      // Initialize last 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
        trends[monthYear] = {
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          total: 0,
          collected: 0,
          count: 0
        };
      }
      
      // Fill in payment data
      payments.forEach(payment => {
        if (payment.createdAt) {
          const date = new Date(payment.createdAt);
          const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
          
          if (trends[monthYear]) {
            trends[monthYear].total += payment.totalAmount || 0;
            trends[monthYear].collected += payment.totalAmountPaid || 0;
            trends[monthYear].count++;
          }
        }
      });
      
      // Convert to array and sort by date
      const trendsArray = Object.values(trends).sort((a, b) => {
        return new Date(b.year, parseInt(b.month) - 1) - new Date(a.year, parseInt(a.month) - 1);
      });
      
      res.json(trendsArray);
    } catch (error) {
      console.error('Error fetching payment trends:', error);
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;