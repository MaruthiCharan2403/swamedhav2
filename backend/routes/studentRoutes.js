const router = require("express").Router();
const Student = require("../models/Studentschema");
const User = require("../models/Userschema");
const auth = require("../middleware/auth");
const School = require("../models/Schoolschema");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");
const mailUtility = require("../middleware/mailUtility");
const Teacher = require("../models/Teacherschema");

// Add a student

router.post("/add", auth, async (req, res) => {
  if (req.user.role !== "school") return res.status(403).send("Access denied.");
  try {
    const { name, email, phone, Class, section } = req.body;
    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
      return res.status(400).json({ message: "Student already registered" });
    const password = Math.random().toString(36).slice(-8);
    const username = email.split("@")[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      name,
      email,
      role: "student",
      password: hashedPassword,
      phone,
      schoolId: req.user.schoolId,
    });
    const student = new Student({
      name,
      email,
      phone,
      class: Class,
      section,
      schoolId: req.user.schoolId,
      userId: user._id,
    });
    user.studentId = student._id;
    await user.save();
    await student.save();
    const school = await School.findById(req.user.schoolId);
    school.students.push(student._id);
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
            <p>© 2025 Swaedha. All rights reserved.</p>
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
    res.status(201).json({ message: "Student added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add-bulk", auth, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(403).json({ message: "Access denied." });

  try {
    const { students } = req.body;

    // Validate input
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid student data provided" });
    }

    const results = {
      success: [],
      failures: [],
    };

    for (const studentData of students) {
      try {
        const { name, email, phone, Class, section } = studentData;

        // Check for required fields
        if (!name || !email || !phone || !Class || !section) {
          results.failures.push({
            email: email || "unknown",
            reason: "Missing required fields",
          });
          continue;
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
          results.failures.push({
            email,
            reason: "Student already registered",
          });
          continue;
        }

        // Generate credentials
        const password = Math.random().toString(36).slice(-8);
        const username = email.split("@")[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user record
        const user = new User({
          username,
          name,
          email,
          role: "student",
          password: hashedPassword,
          phone,
          schoolId: req.user.schoolId,
        });

        // Create student record
        const student = new Student({
          name,
          email,
          phone,
          class: Class,
          section,
          schoolId: req.user.schoolId,
          userId: user._id,
        });

        // Set cross-references
        user.studentId = student._id;

        // Save both records
        await user.save();
        await student.save();

        // Update school record
        const school = await School.findById(req.user.schoolId);
        school.students.push(student._id);
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
          email: studentData.email || "unknown",
          reason: error.message,
        });
      }
    }

    // Return appropriate response based on results
    if (results.success.length === 0) {
      return res.status(500).json({
        message: "Failed to add any students",
        details: results,
      });
    } else if (results.failures.length > 0) {
      return res.status(207).json({
        message: `Added ${results.success.length} students, ${results.failures.length} failed`,
        details: results,
      });
    } else {
      return res.status(201).json({
        message: `Successfully added ${results.success.length} students`,
        details: results,
      });
    }
  } catch (error) {
    console.error("Error in bulk student upload:", error);
    return res.status(500).json({ message: error.message });
  }
});

//get student for a school
router.get("/get", auth, async (req, res) => {
  if (req.user.role !== "school") return res.status(403).send("Access denied.");
  try {
    const students = await Student.find({ schoolId: req.user.schoolId });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/classes", auth, async (req, res) => {
  if (req.user.role !== "school") return res.status(403).send("Access denied.");
  try {
    const classes = await Student.distinct("class", {
      schoolId: req.user.schoolId,
    });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/courses", auth, async (req, res) => {
  if (req.user.role !== "student")
    return res.status(403).send("Access denied.");
  try {
    // Find the student by their ID (assuming the student ID is passed as a query parameter)
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    // Find the student and populate the assignedCourses.courseId field
    const student = await Student.findById(studentId).populate({
      path: "assignedCourses.courseId",
      model: "Course", // Ensure this matches your Course model name
      select: "courseName levelName description terms", // Include the fields you want to retrieve
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Extract and format the assigned courses
    const assignedCourses = student.assignedCourses.map((course) => ({
      courseId: course.courseId._id,
      courseName: course.courseId.courseName,
      levelName: course.levelName,
      description: course.courseId.description,
      terms: course.assignedTerms.map((term) => ({
        termId: term.termId,
        termName: term.termName,
      })),
    }));

    res.status(200).json({ assignedCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get terms for a specific course in assigned courses of a student
router.get("/course/terms/:courseId", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied. Only students can access this route.",
      });
    }
    const studentId = req.user.studentId;
    const courseId = req.params.courseId;
    // Find the student and populate the assignedCourses.courseId field
    const student = await Student.findById(studentId).populate({
      path: "assignedCourses.courseId",
      model: "Course", // Ensure this matches your Course model name
      select: "courseName levelName terms", // Include the fields you want to retrieve
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    const course = student.assignedCourses.find(
      (course) => course.courseId._id.toString() === courseId
    );

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found in assigned courses." });
    }

    // Extract and format the terms for the specific course
    const terms = course.assignedTerms.map((term) => ({
      termId: term.termId,
      termName: term.termName,
      courseId: course.courseId._id,
      courseName: course.courseId.courseName,
      levelName: course.levelName,
    }));

    res.status(200).json({ terms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:studentId/store-code", auth, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).send("Access denied.");
  }

    try {
        const studentId  = req.params.studentId;
        const { courseId, termId, topicId, code , name , programId} = req.body;
        // Validate input
        if (!courseId || !termId || !topicId || !code || !name) {
          return res.status(400).json({ message: "Invalid input data" });
        }
        console.log(req.body);

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the progress for the given course, term, and topic
    let progress = student.progress.find(
      (p) =>
        p.courseId.toString() === courseId &&
        p.termId.toString() === termId &&
        p.topicId.toString() === topicId
    );

    // If progress doesn't exist, create a new one
    if (!progress) {
      
      progress = {
        courseId,
        termId,
        topicId,
        completed: false,
        programs: [],
        doubts: [],
      };
      student.progress.push(progress);
    }

        if (programId) {
          // Update existing program
          const programIndex = progress.programs.findIndex(p => p._id.toString() === programId);
          if (programIndex !== -1) {
            progress.programs[programIndex].code = code;
            progress.programs[programIndex].name = name;
            progress.programs[programIndex].dateSubmitted = new Date();
          } else {
            return res.status(404).json({ message: "Program not found" });
          }
        } else {
          // Create new program
          progress.programs.push({
            code,
            name,
            dateSubmitted: new Date()
          });
        }

    // Save the updated student document
    await student.save();

    res.status(200).json({ message: "Code stored successfully", student });
  } catch (error) {
        // console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:studentId/fetch-codes", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { courseId, termId, topicId } = req.query;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the progress for the given course, term, and topic
    const progress = student.progress.find(
      (p) =>
        p.courseId.toString() === courseId &&
        p.termId.toString() === termId &&
        p.topicId.toString() === topicId
    );

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    const reversedPrograms = progress.programs.reverse();
    // Return the codes from the programs array
    res.status(200).json({ codes: reversedPrograms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST route to submit a doubt
router.post("/:studentId/submit-doubt", async (req, res) => {
  const { studentId } = req.params;
  const { courseId, termId, topicId, question } = req.body;
  console.log(req.body);

  try {
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find or create the progress entry for the given course, term, and topic
    let progress = student.progress.find(
      (p) =>
        p.courseId.toString() === courseId &&
        p.termId.toString() === termId &&
        p.topicId.toString() === topicId
    );

    if (!progress) {
      // If no progress entry exists, create a new one
      progress = {
        courseId,
        termId,
        topicId,
        completed: false,
        programs: [],
        doubts: [],
      };
      student.progress.push(progress);
    }

    // Add the new doubt to the doubts array
    progress.doubts.push({
      courseId,
      termId,
      topicId,
      question,
      status: "pending", // Default status
    });

    // Save the updated student document
    await student.save();

    res.status(201).json({ message: "Doubt submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to fetch doubts and answers
router.get("/:studentId/fetch-doubts", async (req, res) => {
  const { studentId } = req.params;
  const { courseId, termId, topicId } = req.query;
  try {
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the progress entry for the given course, term, and topic
    const progress = student.progress.find(
      (p) =>
        p.courseId.toString() === courseId &&
        p.termId.toString() === termId &&
        p.topicId.toString() === topicId
    );
    console.log(progress);

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // Return the doubts array
    res.status(200).json({ doubts: progress.doubts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to fetch progress data
router.get("/:studentId/fetch-progress", async (req, res) => {
  const { studentId } = req.params;
  const { courseId, termId, topicId } = req.query;

  try {
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the progress entry for the given course, term, and topic
    const progress = student.progress.find(
      (p) =>
        p.courseId.toString() === courseId &&
        p.termId.toString() === termId &&
        p.topicId.toString() === topicId
    );

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // Return the progress data
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:studentId/update-final-submission", async (req, res) => {
  const { studentId } = req.params;
  const { courseId, termId, topicId, finalsubmission } = req.body;

  try {
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the progress entry for the given course, term, and topic
    const progress = student.progress.find(
      (p) =>
        p.courseId.toString() === courseId &&
        p.termId.toString() === termId &&
        p.topicId.toString() === topicId
    );

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // Check if the topic is marked as completed
    if (!progress.completed) {
      return res
        .status(400)
        .json({ message: "Topic is not marked as completed" });
    }
    const mailcontent = `
        <h1>Final Submission</h1>
        <p>Your final submission for the topic has been updated.</p>
        <p>Final submission link: ${finalsubmission}</p>
        `;
    const mailres = await mailUtility(
      student.email,
      "Final Submission Confirmation",
      mailcontent
    );
    if (!mailres.success) {
      return res.status(500).json({
        message: "Final submission updated but email failed to send",
      });
    }

    // Update the final submission link
    progress.finalsubmission = finalsubmission;

    // Save the updated student document
    await student.save();

    res.status(200).json({ message: "Final submission updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to fetch all details of a student

router.get("/:studentId/details", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch the student document with populated references
    const student = await Student.findById(studentId)
      .populate({
        path: "schoolId",
        select: "name city district state",
      })
      .populate({
        path: "assignedTeacher",
        select: "name email phone",
      })
      .populate({
        path: "assignedCourses.courseId",
        select: "levelName terms",
      })
      .populate({
        path: "progress.courseId",
        select: "levelName terms",
      })
      .lean();

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Format school details
    const school = student.schoolId
      ? {
          id: student.schoolId._id,
          name: student.schoolId.name,
          city: student.schoolId.city,
          district: student.schoolId.district,
          state: student.schoolId.state,
        }
      : null;

    // Format assigned teacher details
    const assignedTeacher = student.assignedTeacher
      ? {
          id: student.assignedTeacher._id,
          name: student.assignedTeacher.name,
          email: student.assignedTeacher.email,
          phone: student.assignedTeacher.phone,
        }
      : null;

    // Format enrolled courses and their details
    const enrolledCourses = student.assignedCourses.map((course) => {
      const courseDetails = course.courseId;

      const assignedTerms = course.assignedTerms.map((term) => {
        const termDetails = courseDetails?.terms?.find(
          (t) => t._id.toString() === term.termId.toString()
        );

        const topics =
          termDetails?.topics?.map((topic) => ({
            topicId: topic._id,
            topicName: topic.topicName,
          })) || [];

        return {
          termId: term.termId,
          termName: termDetails?.termName || "Unknown Term",
          topics,
        };
      });

      return {
        courseId: courseDetails?._id,
        levelName: courseDetails?.levelName,
        assignedTerms,
      };
    });

    // Format progress details
    const progress = student.progress.map((prog) => {
      const courseDetails = prog.courseId;

      const termDetails = courseDetails?.terms?.find(
        (t) => t._id.toString() === prog.termId.toString()
      );
      const topicDetails = termDetails?.topics?.find(
        (topic) => topic._id.toString() === prog.topicId.toString()
      );

      return {
        courseId: prog.courseId._id,
        courseName: courseDetails?.levelName,
        termId: prog.termId,
        termName: termDetails?.termName || "Unknown Term",
        topicId: prog.topicId,
        topicName: topicDetails?.topicName || "Unknown Topic",
        completed: prog.completed,
        finalSubmission: prog.finalsubmission,
        submittedCodes: prog.programs,
        doubts: prog.doubts,
      };
    });

    // Format the final response
    const formattedResponse = {
      studentInfo: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        class: student.class,
        school,
      },
      enrolledCourses,
      assignedTeacher,
      progress,
    };

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student details",
      error: error.message,
    });
  }
});

module.exports = router;
