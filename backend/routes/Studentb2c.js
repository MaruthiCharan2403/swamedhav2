const express = require("express");
const router = express.Router();
const Studentb2c = require("../models/Studentb2cschema");
const User = require("../models/Userschema");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");
const Payment = require("../models/Paymentschema");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const mailUtility = require("../middleware/mailUtility");

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, Class, fathername, dob } = req.body;
    const checkstudent = await User.findOne({ email: email });
    if (checkstudent) {
      return res
        .status(400)
        .json({ message: "This email is already registered" });
    }
    const student = new Studentb2c({
      name,
      email,
      phone,
      Class,
      fathername,
      dob,
    });
    const username = email.split("@")[0];
    const generatedPassword = dob.split("-").join("");
    const user = new User({
      name,
      username,
      email,
      password: generatedPassword,
      phone,
      role: "studentb2c",
      studentId: student._id,
    });
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await student.save();
    const mailContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Swamedha</title>
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
            padding: 30px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .email-body {
            background-color: #ffffff;
            padding: 30px;
        }
        .welcome-text {
            font-size: 18px;
            color: #4B5563;
            margin-bottom: 25px;
            text-align: center;
        }
        .credentials-container {
            background-color: #FFFBEB;
            border: 1px solid #FEF3C7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .credential-row {
            padding: 12px 15px;
            border-bottom: 1px dashed #FDE68A;
            display: flex;
        }
        .credential-row:last-child {
            border-bottom: none;
        }
        .credential-label {
            font-weight: bold;
            color: #92400E;
            width: 100px;
        }
        .credential-value {
            font-family: "Courier New", monospace;
            background-color: white;
            border: 1px solid #F5F0DC;
            border-radius: 4px;
            padding: 3px 8px;
            flex: 1;
        }
        .thank-you {
            text-align: center;
            color: #4B5563;
            font-size: 16px;
            margin: 30px 0 20px;
        }
        .signature {
            text-align: center;
            color: #6B7280;
            font-style: italic;
        }
        .cta-button {
            display: block;
            width: 200px;
            margin: 30px auto;
            padding: 12px 0;
            background-color: #D97706;
            color: white;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .email-footer {
            background-color: #F9FAFB;
            padding: 20px;
            text-align: center;
            color: #9CA3AF;
            font-size: 14px;
            border-top: 1px solid #E5E7EB;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Welcome to Swamedha</h1>
        </div>
        
        <div class="email-body">
            <p class="welcome-text">Thank you for joining our platform! Your account has been successfully created.</p>
            
            <div class="credentials-container">
                <div class="credential-row">
                    <div class="credential-label">Username:</div>
                    <div class="credential-value">${username}</div>
                </div>
                <div class="credential-row">
                    <div class="credential-label">Email:</div>
                    <div class="credential-value">${email}</div>
                </div>
                <div class="credential-row">
                    <div class="credential-label">Password:</div>
                    <div class="credential-value">${generatedPassword}</div>
                </div>
            </div>
            
            <a href="#" class="cta-button">Log In Now</a>
            
            <p class="thank-you">Thank you for registering with us!</p>
            <p class="signature">Regards,<br>The Swamedha Team</p>
        </div>
        
        <div class="email-footer">
            <p>© 2025 Swamedha. All rights reserved.</p>
            <p>If you need assistance, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
    const mailResponse = await mailUtility(
      email,
      "Welcome to Swamedha",
      mailContent
    );
    if (!mailResponse.success) {
      console.error(mailResponse.message);
      return res.status(500).json({ message: "Failed to send mail" });
    }
    res.status(201).json(student);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/buycourses", auth, async (req, res) => {
  if (req.user.role !== "studentb2c") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { utrNumber, courses } = req.body;
    const studentId = req.user.studentId;
    // Find the student
    const student = await Studentb2c.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let totalAmount = 0;
    const paymentCourses = [];

    // Process each selected course
    for (const coursePurchase of courses) {
      const course = await Course.findById(coursePurchase.courseId);
      if (!course) {
        return res
          .status(404)
          .json({ message: `Course ${coursePurchase.courseId} not found` });
      }

      // Calculate the total amount for the course
      let courseTotal = 0;
      const classDetails = [];

      for (const classNumber of coursePurchase.selectedClasses) {
        const classLevel = course.classLevels.find(
          (cl) => cl.classNumber === classNumber
        );
        if (!classLevel) {
          return res
            .status(404)
            .json({
              message: `Class ${classNumber} not found in course ${course.name}`,
            });
        }

        courseTotal += classLevel.Studentprice;
        classDetails.push({
          classNumber: classNumber,
          status: "hold",
        });
      }

      totalAmount += courseTotal;

      // Add course details to the paymentCourses array
      paymentCourses.push({
        courseId: course._id,
        studentCount: coursePurchase.selectedClasses.length, // Number of classes selected
        amountPaid: courseTotal,
      });

      // Update student's coursesBought
      const existingCourseIndex = student.coursesBought.findIndex(
        (cb) => cb.courseId.toString() === coursePurchase.courseId
      );

      if (existingCourseIndex !== -1) {
        // If the course already exists, update its classDetails
        const existingCourse = student.coursesBought[existingCourseIndex];
        for (const classDetail of classDetails) {
          const existingClassIndex = existingCourse.classDetails.findIndex(
            (cd) => cd.classNumber === classDetail.classNumber
          );

          if (existingClassIndex === -1) {
            existingCourse.classDetails.push(classDetail);
          }
        }
      } else {
        // If the course does not exist, create a new entry
        student.coursesBought.push({
          courseId: course._id,
          paymentId: null, // Will be updated after payment is saved
          classDetails: classDetails,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        });
      }
    }

    // Create a payment record
    const payment = new Payment({
      studentId: student._id,
      courses: paymentCourses,
      totalAmountPaid: totalAmount,
      utrNumber,
      paymenttype: "Student",
      status: "pending",
    });

    await payment.save();

    // Update paymentId in student's coursesBought
    for (const course of student.coursesBought) {
      if (!course.paymentId) {
        course.paymentId = payment._id;
      }
    }

    await student.save();

    res
      .status(200)
      .json({ message: "Courses purchased successfully", payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/pending-courses", auth, async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Find all students with coursesBought that have any classDetails
    const students = await Studentb2c.find({
      "coursesBought.classDetails": { $exists: true, $not: { $size: 0 } },
    })
      .populate("coursesBought.courseId") // Populate course details
      .populate("coursesBought.paymentId"); // Populate payment details

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    // Group courses by paymentId and utrNumber
    const groupedPayments = {};

    students.forEach((student) => {
      student.coursesBought.forEach((course) => {
        const paymentId = course.paymentId._id.toString();
        const utrNumber = course.paymentId.utrNumber;

        if (!groupedPayments[paymentId]) {
          groupedPayments[paymentId] = {
            paymentId: course.paymentId._id,
            utrNumber: course.paymentId.utrNumber,
            amountPaid: course.paymentId.amountPaid,
            totalAmountPaid: course.paymentId.totalAmountPaid,
            studentId: student._id,
            studentName: student.name,
            courses: [],
          };
        }

        // Include all classDetails, regardless of status
        groupedPayments[paymentId].courses.push({
          courseId: course.courseId._id,
          courseName: course.courseId.name,
          classDetails: course.classDetails, // Include all classDetails
        });
      });
    });

    // Convert groupedPayments object to an array
    const pendingCourses = Object.values(groupedPayments);

    res
      .status(200)
      .json({ message: "Courses retrieved successfully", pendingCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/approve-course/:studentId/:courseId/:classNumber",
  auth,
  async (req, res) => {
    if (req.user.role !== "superadmin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { studentId, courseId, classNumber } = req.params;

      // Find the student
      const student = await Studentb2c.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Find the course in the student's coursesBought
      const course = student.coursesBought.find(
        (cb) => cb.courseId.toString() === courseId
      );
      if (!course) {
        return res
          .status(404)
          .json({ message: "Course not found for this student" });
      }

      // Find the class in the course's classDetails
      const classDetail = course.classDetails.find(
        (cd) => cd.classNumber === parseInt(classNumber)
      );
      if (!classDetail) {
        return res
          .status(404)
          .json({ message: "Class not found in this course" });
      }

      // Update the status to 'active'
      classDetail.status = "active";

      const payment = await Payment.findById(course.paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      payment.status = "approved";
      await payment.save();
      await student.save();

      res.status(200).json({ message: "Course approved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/reject-course/:studentId/:courseId/:classNumber",
  auth,
  async (req, res) => {
    if (req.user.role !== "superadmin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { studentId, courseId, classNumber } = req.params;

      // Find the student
      const student = await Studentb2c.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Find the course in the student's coursesBought
      const course = student.coursesBought.find(
        (cb) => cb.courseId.toString() === courseId
      );
      if (!course) {
        return res
          .status(404)
          .json({ message: "Course not found for this student" });
      }

      // Find the class in the course's classDetails
      const classDetail = course.classDetails.find(
        (cd) => cd.classNumber === parseInt(classNumber)
      );
      if (!classDetail) {
        return res
          .status(404)
          .json({ message: "Class not found in this course" });
      }

      // Update the status to 'blocked'
      classDetail.status = "blocked";

      const payment = await Payment.findById(course.paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      payment.status = "rejected";
      await payment.save();
      await student.save();

      res.status(200).json({ message: "Course rejected successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/courses", auth, async (req, res) => {
  if (req.user.role !== "studentb2c") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const studentId = req.user.studentId;

    // Find the student and populate coursesBought with course details
    const student = await Studentb2c.findById(studentId)
      .populate({
        path: "coursesBought.courseId",
        populate: {
          path: "classLevels.levels",
        },
      })
      .populate("coursesBought.paymentId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Format the response and filter out non-active classes
    const coursesBought = student.coursesBought
      .map((course) => {
        // Filter classDetails to include only active classes
        const activeClassDetails = course.classDetails.filter(
          (classDetail) => classDetail.status === "active"
        );

        // If there are no active classes, exclude this course
        if (activeClassDetails.length === 0) return null;

        return {
          courseId: course.courseId._id,
          courseName: course.courseId.name,
          expiryDate: course.expiryDate,
          classDetails: activeClassDetails.map((classDetail) => ({
            classNumber: classDetail.classNumber,
            status: classDetail.status,
          })),
          paymentDetails: {
            paymentId: course.paymentId._id,
            amountPaid: course.paymentId.amountPaid,
            utrNumber: course.paymentId.utrNumber,
            status: course.paymentId.status,
          },
          classLevels: course.courseId.classLevels.map((classLevel) => ({
            classNumber: classLevel.classNumber,
            levels: classLevel.levels.map((level) => ({
              levelNumber: level.levelNumber,
              title: level.title,
              iframeUrls: level.iframeUrls,
            })),
          })),
        };
      })
      .filter((course) => course !== null); // Remove courses with no active classes

    res
      .status(200)
      .json({
        message: "Courses retrieved successfully",
        courses: coursesBought,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/courses/:courseId", auth, async (req, res) => {
  if (req.user.role !== "studentb2c") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const studentId = req.user.studentId;
    const { courseId } = req.params;

    // Find the student and populate coursesBought with course details
    const student = await Studentb2c.findById(studentId)
      .populate({
        path: "coursesBought.courseId",
        populate: {
          path: "classLevels.levels",
        },
      })
      .populate("coursesBought.paymentId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const course = student.coursesBought.find(
      (c) => c.courseId._id.toString() === courseId
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const courseDetails = {
      courseId: course.courseId._id,
      courseName: course.courseId.name,
      expiryDate: course.expiryDate,
      classDetails: course.classDetails.map((classDetail) => ({
        classNumber: classDetail.classNumber,
        status: classDetail.status,
      })),
      classLevels: course.courseId.classLevels.map((classLevel) => ({
        classNumber: classLevel.classNumber,
        levels: classLevel.levels.map((level) => ({
          levelNumber: level.levelNumber,
          title: level.title,
          iframeUrls: level.iframeUrls,
        })),
      })),
    };
    res
      .status(200)
      .json({ message: "Course retrieved successfully", courseDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//show payment history of the student

router.get("/payment-history", auth, async (req, res) => {
  if (req.user.role !== "studentb2c") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const studentId = req.user.studentId;

    // Find all payments made by the student
    const payments = await Payment.find({ studentId })
      .populate({
        path: "courses.courseId",
        select: "name", // Only include the course name
      })
      .sort({ createdAt: -1 }); // Sort by most recent payment first

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payment history found" });
    }

    // Format the response
    const paymentHistory = payments.map((payment) => ({
      paymentId: payment._id,
      utrNumber: payment.utrNumber,
      totalAmountPaid: payment.totalAmountPaid,
      status: payment.status,
      createdAt: payment.createdAt,
      courses: payment.courses.map((course) => ({
        courseId: course.courseId._id,
        courseName: course.courseId.name,
        amountPaid: course.amountPaid,
        studentCount: course.studentCount,
      })),
    }));

    res
      .status(200)
      .json({
        message: "Payment history retrieved successfully",
        paymentHistory,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
