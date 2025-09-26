const router = require("express").Router();
const Student = require("../models/Studentschema");
const User = require("../models/Userschema");
const auth = require("../middleware/auth");
const School = require("../models/Schoolschema");
const bcrypt = require("bcryptjs");
const mailUtility = require("../middleware/mailUtility");
const generateUniqueUsername = require("../utils/generateUsername");
const Teacher = require("../models/Teacherschema");
const Course = require("../models/Course");

// Add a teacher
router.post("/add", auth, async (req, res) => {
  const { name, email, phone,subject } = req.body;
  if (req.user.role !== "school") return res.status(403).send("Access denied.");
  try {
    const existingTeacher = await User.findOne({ email });
    if (existingTeacher)
      return res.status(400).json({ message: "Teacher already registered" });
    const password = Math.random().toString(36).slice(-8);
    const username = await generateUniqueUsername(email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      name,
      email,
      role: "teacher",
      password: hashedPassword,
      phone,
      schoolId: req.user.schoolId,
    });
    const teacher = new Teacher({
      name,
      email,
      phone,
      subject,
      schoolId: req.user.schoolId,
      userId: user._id,
    });
    user.teacherId = teacher._id;
    await user.save();
    await teacher.save();
    const school = await School.findById(req.user.schoolId);
    school.teachers.push(teacher._id);
    await school.save();
    const mailcontent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FAFAFA;
        }
        .header {
            background-color: #D97706;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
        }
        .content {
            padding: 25px;
            background-color: white;
        }
        .welcome-message {
            font-size: 16px;
            margin-bottom: 25px;
        }
        .credentials-box {
            background-color: #FEF3C7;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #D97706;
        }
        .credential-item {
            margin-bottom: 12px;
        }
        .credential-label {
            font-weight: bold;
            display: inline-block;
            width: 90px;
            color: #92400E;
        }
        .credential-value {
            font-family: monospace;
            background-color: #FFFFFF;
            padding: 3px 6px;
            border-radius: 3px;
            border: 1px solid #F3E8C9;
        }
        .footer {
            background-color: #F9FAFB;
            padding: 15px 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
            border-top: 1px solid #E5E7EB;
        }
        .button {
            display: inline-block;
            background-color: #D97706;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to Swamedha</h1>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <p>Thank you for joining us! Your account has been successfully created. Below are your login credentials:</p>
            </div>
            
            <div class="credentials-box">
                <div class="credential-item">
                    <span class="credential-label">Username:</span>
                    <span class="credential-value">${username}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">${password}</span>
                </div>
            </div>
            
            <p>We recommend changing your password after your first login for security purposes.</p>
            
            <div style="text-align: center;">
                <a href="#" class="button">Log In</a>
            </div>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© 2025 Swamedha. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    const mailres = await mailUtility(
      email,
      "Registration Confirmation",
      mailcontent
    );
    if (!mailres.success)
      return res
        .status(500)
        .json({ message: "Registration successful but email failed to send" });
    res.status(201).json({ message: "Teacher added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-bulk", auth, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(403).json({ message: "Access denied." });

  try {
    const { teachers } = req.body;

    // Validate input
    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid teacher data provided" });
    }

    const results = {
      success: [],
      failures: [],
    };

    // Process each teacher one by one
    for (const teacherData of teachers) {
      try {
        const { name, email, phone } = teacherData;

        // Check for required fields
        if (!name || !email || !phone) {
          results.failures.push({
            email: email || "unknown",
            reason: "Missing required fields",
          });
          continue;
        }

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
          results.failures.push({
            email,
            reason: "Teacher already registered",
          });
          continue;
        }

        // Generate credentials
        const password = Math.random().toString(36).slice(-8);
        const username = await generateUniqueUsername(email);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user record
        const user = new User({
          username,
          name,
          email,
          role: "teacher",
          password: hashedPassword,
          phone,
          schoolId: req.user.schoolId,
        });

        // Create teacher record
        const teacher = new Teacher({
          name,
          email,
          phone,
          schoolId: req.user.schoolId,
          userId: user._id,
        });

        // Set cross-references
        user.teacherId = teacher._id;

        // Save both records
        await user.save();
        await teacher.save();

        // Update school record
        const school = await School.findById(req.user.schoolId);
        school.teachers.push(teacher._id);
        await school.save();

        // Send email notification
        const mailcontent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FAFAFA;
        }
        .header {
            background-color: #D97706;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
        }
        .content {
            padding: 25px;
            background-color: white;
        }
        .welcome-message {
            font-size: 16px;
            margin-bottom: 25px;
        }
        .credentials-box {
            background-color: #FEF3C7;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #D97706;
        }
        .credential-item {
            margin-bottom: 12px;
        }
        .credential-label {
            font-weight: bold;
            display: inline-block;
            width: 90px;
            color: #92400E;
        }
        .credential-value {
            font-family: monospace;
            background-color: #FFFFFF;
            padding: 3px 6px;
            border-radius: 3px;
            border: 1px solid #F3E8C9;
        }
        .footer {
            background-color: #F9FAFB;
            padding: 15px 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
            border-top: 1px solid #E5E7EB;
        }
        .button {
            display: inline-block;
            background-color: #D97706;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to the Platform</h1>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <p>Thank you for joining us! Your account has been successfully created. Below are your login credentials:</p>
            </div>
            
            <div class="credentials-box">
                <div class="credential-item">
                    <span class="credential-label">Username:</span>
                    <span class="credential-value">${username}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">${password}</span>
                </div>
            </div>
            
            <p>We recommend changing your password after your first login for security purposes.</p>
            
            <div style="text-align: center;">
                <a href="#" class="button">Log In Now</a>
            </div>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© 2025 Swamedha. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

        const mailres = await mailUtility(
          email,
          "Registration Confirmation",
          mailcontent
        );

        // Track success/failure
        if (!mailres.success) {
          results.failures.push({
            email,
            reason: "Registration successful but email failed to send",
          });
        } else {
          results.success.push({ email });
        }
      } catch (error) {
        results.failures.push({
          email: teacherData.email || "unknown",
          reason: error.message,
        });
      }
    }

    // Return appropriate response based on results
    if (results.success.length === 0) {
      return res.status(500).json({
        message: "Failed to add any teachers",
        details: results,
      });
    } else if (results.failures.length > 0) {
      return res.status(207).json({
        message: `Added ${results.success.length} teachers, ${results.failures.length} failed`,
        details: results,
      });
    } else {
      return res.status(201).json({
        message: `Successfully added ${results.success.length} teachers`,
        details: results,
      });
    }
  } catch (error) {
    console.error("Error in bulk teacher upload:", error);
    return res.status(500).json({ message: error.message });
  }
});

//get all teachers for a school
router.get("/all", auth, async (req, res) => {
  if (req.user.role !== "school") return res.status(403).send("Access denied.");
  try {
    const teachers = await Teacher.find({
      schoolId: req.user.schoolId,
    }).populate({
      path: "assignedStudents",
      select: "name class phone",
    });

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign a student to a teacher
router.post("/assign-student", auth, async (req, res) => {
  const { studentId, teacherId } = req.body;

  try {
    // Check if the logged-in user is a teacher
    if (req.user.role !== "school") {
      return res
        .status(403)
        .json({ message: "Access denied. Only teachers can assign students." });
    }

    // Find the student and teacher
    const student = await Student.findById(studentId);
    const teacher = await Teacher.findById(teacherId);

    if (!student || !teacher) {
      return res.status(404).json({ message: "Student or teacher not found." });
    }

    // Assign the student to the teacher
    student.assignedTeacher = teacherId;
    teacher.assignedStudents.push(studentId);

    await student.save();
    await teacher.save();

    res.status(200).json({ message: "Student assigned successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/assign-section", auth, async (req, res) => {
  const { classNumber, section, teacherId } = req.body;
  try {
    const students = await Student.find({
      schoolId: req.user.schoolId,
      section,
      class: classNumber,
    });
    if (!students)
      return res.status(404).json({ message: "Students not found" });
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    for (const student of students) {
      if (
        student.assignedTeacher !== null &&
        student.assignedTeacher !== teacherId
      ) {
        res
          .status(400)
          .json({ message: "Student already assigned to another teacher" });
        return;
      }
      student.assignedTeacher = teacherId;
      if (!teacher.assignedStudents.includes(student._id)) {
        teacher.assignedStudents.push(student._id);
      }
      await student.save();
    }
    await teacher.save();
    res.status(200).json({ message: "Teacher assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/remove-section", auth, async (req, res) => {
  const { classNumber, section, teacherId } = req.body;
  try {
    const students = await Student.find({
      schoolId: req.user.schoolId,
      section,
      class: classNumber,
    });
    if (!students)
      return res.status(404).json({ message: "Students not found" });
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    for (const student of students) {
      student.assignedTeacher = null;
      teacher.assignedStudents = teacher.assignedStudents.filter(
        (id) => id.toString() !== student._id.toString()
      );
      await student.save();
    }
    await teacher.save();
    res.status(200).json({ message: "Teacher removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove a student from a teacher
router.post("/remove-student", auth, async (req, res) => {
  const { studentId, teacherId } = req.body;

  try {
    // Check if the logged-in user is a teacher
    if (req.user.role !== "school") {
      return res
        .status(403)
        .json({ message: "Access denied. Only teachers can remove students." });
    }

    // Find the student and teacher
    const student = await Student.findById(studentId);
    const teacher = await Teacher.findById(teacherId);

    if (!student || !teacher) {
      return res.status(404).json({ message: "Student or teacher not found." });
    }

    // Remove the student from the teacher
    student.assignedTeacher = null;
    teacher.assignedStudents = teacher.assignedStudents.filter(
      (id) => id.toString() !== studentId
    );

    await student.save();
    await teacher.save();

    res.status(200).json({ message: "Student removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/enabled", auth, async (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(401).json({ message: "Unauthorized" });
  try {
    const id = req.user.schoolId;
    const school = await School.findById(id);
    if (!school) return res.status(404).json({ message: "School not found" });
    const courses = await Course.find();
    const enabledCourses = school.enabledCourses.map((course) => {
      const courseDetails = courses.find((c) => c._id.equals(course.courseId));
      return {
        courseId: course.courseId,
        levelName: course.levelName,
        isAvailable: course.isAvailable,
        studentcount: course.studentcount,
        // courseDetails
      };
    });
    res.json(enabledCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET route to fetch codes of assigned students for a specific topic, term, and level
router.get("/:teacherId/student-codes", auth, async (req, res) => {
  const { teacherId } = req.params;
  const { courseId, termId, topicId } = req.query;

  try {
    // Check if the logged-in user is a teacher
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Access denied. Only teachers can view student codes.",
      });
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId).populate({
      path: "assignedStudents",
      select: "name progress",
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Filter students and their codes for the given course, term, and topic
    const studentsWithCodes = teacher.assignedStudents.map((student) => {
      const progress = student.progress.find(
        (p) =>
          p.courseId.toString() === courseId &&
          p.termId.toString() === termId &&
          p.topicId.toString() === topicId
      );

      return {
        studentId: student._id,
        name: student.name,
        codes: progress ? progress.programs : [],
      };
    });

    res.status(200).json({ studentsWithCodes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to fetch doubts for a specific topic, term, and level
router.get("/:teacherId/doubts", auth, async (req, res) => {
  const { teacherId } = req.params;
  const { courseId, termId, topicId } = req.query;

  try {
    // Check if the logged-in user is a teacher
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. Only teachers can view doubts." });
    }

    // Find the teacher and their assigned students
    const teacher = await Teacher.findById(teacherId).populate({
      path: "assignedStudents",
      select: "name progress",
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Collect doubts from all assigned students for the given topic, term, and level
    const doubts = [];
    teacher.assignedStudents.forEach((student) => {
      const progress = student.progress.find(
        (p) =>
          p.courseId.toString() === courseId &&
          p.termId.toString() === termId &&
          p.topicId.toString() === topicId
      );

      if (progress && progress.doubts.length > 0) {
        progress.doubts.forEach((doubt) => {
          doubts.push({
            studentId: student._id,
            studentName: student.name,
            ...doubt.toObject(),
          });
        });
      }
    });

    res.status(200).json({ doubts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST route to answer a doubt
router.post("/:teacherId/answer-doubt", auth, async (req, res) => {
  const { teacherId } = req.params;
  const { studentId, doubtId, answer } = req.body;

  try {
    // Check if the logged-in user is a teacher
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. Only teachers can answer doubts." });
    }

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Find the doubt in the student's progress
    let doubtFound = false;
    student.progress.forEach((progress) => {
      const doubt = progress.doubts.id(doubtId);
      if (doubt) {
        doubt.answer = answer;
        doubt.dateAnswered = new Date();
        doubt.status = "answered";
        doubtFound = true;
      }
    });

    if (!doubtFound) {
      return res.status(404).json({ message: "Doubt not found." });
    }

    // Save the updated student document
    await student.save();

    res.status(200).json({ message: "Doubt answered successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST route to enable final submission for all assigned students
router.post("/:teacherId/enable-final-submission", auth, async (req, res) => {
  const { teacherId } = req.params;
  const { courseId, termId, topicId } = req.body;

  try {
    // Check if the logged-in user is a teacher
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Access denied. Only teachers can enable final submission.",
      });
    }

    // Find the teacher and their assigned students
    const teacher = await Teacher.findById(teacherId).populate({
      path: "assignedStudents",
      select: "progress",
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Enable final submission for all assigned students
    teacher.assignedStudents.forEach(async (student) => {
      const progress = student.progress.find(
        (p) =>
          p.courseId.toString() === courseId &&
          p.termId.toString() === termId &&
          p.topicId.toString() === topicId
      );

      if (progress) {
        progress.completed = true;
        await student.save();
      }
    });

    res
      .status(200)
      .json({ message: "Final submission enabled for all assigned students." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET route to fetch final submission links for all assigned students
router.get("/:teacherId/final-submissions", auth, async (req, res) => {
  const { teacherId } = req.params;
  const { courseId, termId, topicId } = req.query;

  try {
    // Check if the logged-in user is a teacher
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Access denied. Only teachers can view final submissions.",
      });
    }

    // Find the teacher and their assigned students
    const teacher = await Teacher.findById(teacherId).populate({
      path: "assignedStudents",
      select: "name progress",
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Collect final submission links for all assigned students
    const finalSubmissions = [];
    teacher.assignedStudents.forEach((student) => {
      const progress = student.progress.find(
        (p) =>
          p.courseId.toString() === courseId &&
          p.termId.toString() === termId &&
          p.topicId.toString() === topicId
      );

      if (progress && progress.completed) {
        finalSubmissions.push({
          studentId: student._id,
          studentName: student.name,
          finalsubmission: progress.finalsubmission,
        });
      }
    });

    res.status(200).json({ finalSubmissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
