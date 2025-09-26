const express = require("express");
const router = express.Router();
const School = require("../models/Schoolschema");
const Student = require("../models/Studentschema");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const User = require("../models/Userschema");
const mailUtility = require("../middleware/mailUtility");
const generateUniqueUsername = require("../utils/generateUsername");
const moment = require("moment");
const mongoose = require("mongoose");

const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      udiseCode,
      city,
      address,
      district,
      state,
      pincode,
      phone,
      email,
    } = req.body;
    const existingSchool = await School.findOne({ email });
    if (existingSchool)
      return res.status(400).json({ message: "School already registered" });
    const newSchool = new School({
      name,
      udiseCode,
      city,
      address,
      district,
      state,
      pincode,
      phone,
      email,
    });
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    const generatedUsername = await generateUniqueUsername(email);
    const schoolUser = new User({
      username: generatedUsername,
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
      role: "school",
      schoolId: newSchool._id,
    });
    newSchool.userId = schoolUser._id;
    await newSchool.save();
    await schoolUser.save();
    const mailContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Details</title>
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
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            overflow: hidden;
        }
        .email-header {
            background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }
        .email-body {
            background-color: #ffffff;
            padding: 25px;
        }
        .welcome-text {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 20px;
        }
        .details-container {
            margin: 20px 0;
        }
        .detail-row {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #F3F4F6;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #92400E;
            display: inline-block;
            width: 100px;
        }
        .detail-value {
            display: inline-block;
        }
        .signature {
            margin-top: 25px;
            color: #6B7280;
        }
        .email-footer {
            background-color: #F9FAFB;
            padding: 15px;
            text-align: center;
            color: #9CA3AF;
            font-size: 12px;
            border-top: 1px solid #E5E7EB;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Registration Details</h1>
        </div>
        
        <div class="email-body">
            <p class="welcome-text">Thank you for registering with us. Below are the details of your registration:</p>
            
            <div class="details-container">
                <div class="detail-row">
                    <span class="detail-label">Username:</span>
                    <span class="detail-value">${generatedUsername}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Password:</span>
                    <span class="detail-value">${password}</span>
                </div>
            </div>
            
            <div class="signature">
                <p>Best Regards,<br>Swamedha Team</p>
            </div>
        </div>
        
        <div class="email-footer">
            <p>© 2025 Swamedha. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    const mailres = await mailUtility(
      email,
      "Registration Confirmation",
      mailContent
    );
    if (!mailres.success)
      return res
        .status(500)
        .json({ message: "Registration successful but email failed to send" });
    res.json({ message: "Registration  Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

//get all schools
router.get("/allschools", auth, async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

//get a single school
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(401).json({ message: "Unauthorized" });
  try {
    const school = await School.findById(req.user.schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });
    res.json(school);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.put("/:id/enabled-courses", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { enabledCourses } = req.body;

    // Get the school to compare with previous state
    const school = await School.findById(id);
    const previousEnabledCourses = school.enabledCourses || [];

    // Find courses that were removed
    const removedCourses = previousEnabledCourses.filter(prevCourse => 
      !enabledCourses.some(newCourse => newCourse.courseId.toString() === prevCourse.courseId.toString())
    );

    // Find terms that were removed from courses
    const removedTerms = [];
    previousEnabledCourses.forEach(prevCourse => {
      const newCourse = enabledCourses.find(newCourse => 
        newCourse.courseId.toString() === prevCourse.courseId.toString()
      );
      
      if (newCourse) {
        // Check for removed terms
        const prevTerms = prevCourse.enabledTerms || [];
        const newTerms = newCourse.enabledTerms || [];
        
        prevTerms.forEach(prevTerm => {
          if (!newTerms.some(newTerm => newTerm.termId.toString() === prevTerm.termId.toString())) {
            removedTerms.push({
              courseId: prevCourse.courseId,
              termId: prevTerm.termId
            });
          }
        });
      }
    });

    // Update the school with the new enabledCourses
    const updatedSchool = await School.findByIdAndUpdate(
      id,
      { enabledCourses },
      { new: true }
    );

    // Enforce student count caps for courses that remain enabled
    for (const newCourse of enabledCourses) {
      const courseId = newCourse.courseId.toString();
      const newCap = Number(newCourse.studentcount || 0);
      // Count current assignments for this course in this school
      const currentAssignedCount = await Student.countDocuments({
        schoolId: id,
        "assignedCourses.courseId": mongoose.Types.ObjectId(courseId),
      });

      if (currentAssignedCount > newCap) {
        const excess = currentAssignedCount - newCap;
        // Pick excess students to deassign (newest first to prefer keeping older assignments)
        const excessStudents = await Student.find({
          schoolId: id,
          "assignedCourses.courseId": mongoose.Types.ObjectId(courseId),
        })
          .sort({ updatedAt: -1 })
          .limit(excess)
          .select("_id");

        const excessIds = excessStudents.map((s) => s._id);

        if (excessIds.length > 0) {
          // Remove course from assignedCourses for selected students
          await Student.updateMany(
            { _id: { $in: excessIds } },
            {
              $pull: {
                assignedCourses: { courseId: mongoose.Types.ObjectId(courseId) },
                progress: { courseId: mongoose.Types.ObjectId(courseId) },
              },
            }
          );
        }

        // Sync currentcount for this course on the school document
        const remainingAssigned = await Student.countDocuments({
          schoolId: id,
          "assignedCourses.courseId": mongoose.Types.ObjectId(courseId),
        });

        const ecIndex = updatedSchool.enabledCourses.findIndex(
          (c) => c.courseId.toString() === courseId
        );
        if (ecIndex !== -1) {
          updatedSchool.enabledCourses[ecIndex].currentcount = remainingAssigned;
        }
      } else {
        // If within cap, ensure currentcount reflects actual assignments
        const actualAssigned = await Student.countDocuments({
          schoolId: id,
          "assignedCourses.courseId": mongoose.Types.ObjectId(courseId),
        });
        const ecIndex = updatedSchool.enabledCourses.findIndex(
          (c) => c.courseId.toString() === courseId
        );
        if (ecIndex !== -1) {
          updatedSchool.enabledCourses[ecIndex].currentcount = actualAssigned;
        }
      }
    }

    await updatedSchool.save();

    // Remove progress and assignments for removed courses and terms
    if (removedCourses.length > 0 || removedTerms.length > 0) {
      // Remove from students' assignedCourses and progress
      await Student.updateMany(
        { schoolId: id },
        [
          // Remove courses from assignedCourses
          {
            $set: {
              assignedCourses: {
                $filter: {
                  input: "$assignedCourses",
                  as: "course",
                  cond: {
                    $not: {
                      $in: [
                        "$$course.courseId",
                        removedCourses.map(c => mongoose.Types.ObjectId(c.courseId))
                      ]
                    }
                  }
                }
              }
            }
          },
          // Remove progress for removed courses and terms
          {
            $set: {
              progress: {
                $filter: {
                  input: "$progress",
                  as: "prog",
                  cond: {
                    $and: [
                      {
                        $not: {
                          $in: [
                            "$$prog.courseId",
                            removedCourses.map(c => mongoose.Types.ObjectId(c.courseId))
                          ]
                        }
                      },
                      {
                        $not: {
                          $in: [
                            { 
                              courseId: "$$prog.courseId",
                              termId: "$$prog.termId"
                            },
                            removedTerms.map(t => ({
                              courseId: mongoose.Types.ObjectId(t.courseId),
                              termId: t.termId
                            }))
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        ]
      );
    }

    res.json(updatedSchool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/:id/remove-courses", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { courses } = req.body;

    // Get the school
    const school = await School.findById(id);
    
    // Remove courses from availableCourses and enabledCourses
    const courseIdsToRemove = courses.map(c => c.courseId);
    
    const updatedAvailableCourses = school.availableCourses.filter(
      course => !courseIdsToRemove.includes(course.courseId.toString())
    );
    
    const updatedEnabledCourses = school.enabledCourses.filter(
      course => !courseIdsToRemove.includes(course.courseId.toString())
    );

    // Update the school
    const updatedSchool = await School.findByIdAndUpdate(
      id,
      {
        availableCourses: updatedAvailableCourses,
        enabledCourses: updatedEnabledCourses
      },
      { new: true }
    );

    // Remove from students' assignedCourses and progress
    await Student.updateMany(
      { schoolId: id },
      [
        {
          $set: {
            assignedCourses: {
              $filter: {
                input: "$assignedCourses",
                as: "course",
                cond: {
                  $not: {
                    $in: [
                      "$$course.courseId",
                      courseIdsToRemove.map(id => mongoose.Types.ObjectId(id))
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $set: {
            progress: {
              $filter: {
                input: "$progress",
                as: "prog",
                cond: {
                  $not: {
                    $in: [
                      "$$prog.courseId",
                      courseIdsToRemove.map(id => mongoose.Types.ObjectId(id))
                    ]
                  }
                }
              }
            }
          }
        }
      ]
    );

    res.json(updatedSchool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//get the courses of a school in enabled courses from the courses
router.get("/enabled", auth, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const id = req.user.schoolId;
    const school = await School.findById(id);
    if (!school) return res.status(404).json({ message: "School not found" });

    const courses = await Course.find();

    const enabledCourses = school.enabledCourses.map((course) => {
      return {
        courseId: course.courseId,
        levelName: course.levelName,
        studentcount: course.studentcount,
        currentcount: course.currentcount,
        enabledTerms: course.enabledTerms || [],
        
      };
    });

    res.status(200).json(enabledCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//get the terms of a course
router.get("/terms/:id", auth, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(401).json({ message: "Unauthorized" });
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course.terms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/getcontent/:levelId/:termId", auth, async (req, res) => {
  const { levelId, termId } = req.params;
  const schoolId = req.user.schoolId;

  try {
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: "School not found" });

    // Check if the course and term are enabled for this school
    const enabledCourse = school.enabledCourses.find(course =>
      course.levelName === levelId &&
      course.enabledTerms.some(term => term.termId.toString() === termId && term.isEnabled)
    );

    if (!enabledCourse) {
      return res.status(403).json({ message: "This content is not enabled for your school" });
    }

    // Find the content in Course collection
    const courseContent = await Course.findOne({ levelName: levelId });
    if (!courseContent) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Find the term in courseContent
    const termContent = courseContent.terms.find(term => term._id.toString() === termId);
    if (!termContent) {
      return res.status(404).json({ message: "Term content not found" });
    }

    res.status(200).json(termContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:studentId/add-course", auth, async (req, res) => {
  if (req.user.role !== "school") {
    return res.status(403).send("Access denied.");
  }

  try {
    const { studentId } = req.params;
    const { courseId, levelName, assignedTerms } = req.body;

    // Validate input
    if (
      !courseId ||
      !levelName ||
      !assignedTerms ||
      !Array.isArray(assignedTerms)
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const school = await School.findById(student.schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Check if the course is enabled for the school
    const enabledCourse = school.enabledCourses.find(
      (course) => course.courseId.toString() === courseId
    );
    if (!enabledCourse) {
      return res
        .status(400)
        .json({ message: "Course is not enabled for this school" });
    }

    // Add the course to assignedCourses
    student.assignedCourses.push({
      courseId,
      levelName,
      assignedTerms: assignedTerms.map((term) => ({
        termId: term.termId,
        termName: term.termName,
      })),
    });
    enabledCourse.currentcount += 1;

    await student.save();
    await school.save();

    res.status(200).json({ message: "Course added successfully", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//remove a course from a student
router.post("/:studentId/remove-course", auth, async (req, res) => {
  if (req.user.role !== "school") {
    return res.status(403).send("Access denied.");
  }

  try {
    const { studentId } = req.params;
    const { courseId } = req.body;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove the course from assignedCourses
    student.assignedCourses = student.assignedCourses.filter(
      (course) => !course.courseId.equals(courseId)
    );

    await student.save();

    res.status(200).json({ message: "Course removed successfully", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/assign-course-section", auth, async (req, res) => {
  if (req.user.role !== "school") {
    return res.status(403).send("Access denied.");
  }

  const { classNumber, section, courseId, levelName, assignedTerms } = req.body;

  // Input validation
  if (
    !classNumber ||
    !section ||
    !courseId ||
    !levelName ||
    !assignedTerms ||
    !Array.isArray(assignedTerms)
  ) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    // Find all students in the specified class and section
    const students = await Student.find({
      schoolId: req.user.schoolId,
      class: classNumber,
      section,
    });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found for this class and section" });
    }

    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Check if the course is enabled for the school
    const enabledCourse = school.enabledCourses.find(
      (course) => course.courseId.toString() === courseId
    );
    if (!enabledCourse) {
      return res.status(400).json({ message: "Course is not enabled for this school" });
    }

    let countAdded = 0;
    let alreadyAssigned = [];
    for (const student of students) {
      const alreadyAssignedCourse = student.assignedCourses.find(
        (c) => c.courseId.toString() === courseId
      );
      if (alreadyAssignedCourse) {
        alreadyAssigned.push(student._id);
        continue; // Skip students who already have this course
      }
      student.assignedCourses.push({
        courseId,
        levelName,
        assignedTerms: assignedTerms.map((term) => ({
          termId: term.termId,
          termName: term.termName,
        })),
      });
      countAdded++;
      await student.save();
    }
    enabledCourse.currentcount += countAdded;
    await school.save();

    res.status(200).json({
      message: `Course assigned to ${countAdded} students. ${alreadyAssigned.length > 0 ? alreadyAssigned.length + " students already had the course." : ""}`,
      alreadyAssigned,
      assignedCount: countAdded,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/remove-course-section", auth, async (req, res) => {
  if (req.user.role !== "school") {
    return res.status(403).send("Access denied.");
  }

  const { classNumber, section, courseId } = req.body;

  // Input validation
  if (!classNumber || !section || !courseId) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    // Find all students in the specified class and section
    const students = await Student.find({
      schoolId: req.user.schoolId,
      class: classNumber,
      section,
    });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found for this class and section" });
    }

    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Check if the course is enabled for the school
    const enabledCourse = school.enabledCourses.find(
      (course) => course.courseId.toString() === courseId
    );
    if (!enabledCourse) {
      return res.status(400).json({ message: "Course is not enabled for this school" });
    }

    let countRemoved = 0;
    let notAssigned = [];
    for (const student of students) {
      const initialLength = student.assignedCourses.length;
      // Remove the course from assignedCourses
      student.assignedCourses = student.assignedCourses.filter(
        (c) => c.courseId.toString() !== courseId
      );
      if (student.assignedCourses.length < initialLength) {
        countRemoved++;
        await student.save();
      } else {
        notAssigned.push(student._id);
      }
    }
    enabledCourse.currentcount -= countRemoved;
    if (enabledCourse.currentcount < 0) enabledCourse.currentcount = 0;
    await school.save();

    res.status(200).json({
      message: `Course removed from ${countRemoved} students. ${notAssigned.length > 0 ? notAssigned.length + " students did not have the course." : ""}`,
      notAssigned,
      removedCount: countRemoved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all student in a school
router.get("/students", auth, async (req, res) => {
  if (req.user.role !== "school")
    return res.status(401).json({ message: "Unauthorized" });
  try {
    const students = await Student.find({ schoolId: req.user.schoolId });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
