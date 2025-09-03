const express = require("express");
const router = express.Router();
const School = require("../models/Schoolschema");
const Student = require("../models/Studentschema");
const Payment = require("../models/Paymentschema");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const User = require("../models/Userschema");
const mailUtility = require("../middleware/mailUtility");
const moment = require("moment");

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
    const generatedUsername = email.split("@")[0];
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

router.get("/send-payment-reminders", async (req, res) => {
  try {
    const tenDaysAgo = moment().subtract(10, "days").toDate();
    const pendingPayments = await Payment.find({
      status: "pending",
      createdAt: { $lte: tenDaysAgo },
    }).populate("schoolId");
    console.log(pendingPayments);
    for (const payment of pendingPayments) {
        const mailContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Reminder</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                    background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
                    color: white;
                    padding: 25px;
                    text-align: center;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .email-body {
                    background-color: #ffffff;
                    padding: 30px;
                }
                .greeting {
                    font-size: 16px;
                    margin-bottom: 20px;
                    color: #4B5563;
                }
                .message {
                    font-size: 15px;
                    color: #4B5563;
                    margin-bottom: 20px;
                    line-height: 1.7;
                }
                .highlight-box {
                    background-color: #FFFBEB;
                    border-left: 4px solid #D97706;
                    padding: 15px;
                    margin: 25px 0;
                    border-radius: 0 4px 4px 0;
                }
                .highlight-text {
                    color: #92400E;
                    font-weight: bold;
                    font-size: 16px;
                }
                .payment-details {
                    margin: 25px 0;
                    padding: 15px;
                    background-color: #F9FAFB;
                    border-radius: 6px;
                    border: 1px solid #E5E7EB;
                }
                .detail-row {
                    display: flex;
                    margin-bottom: 10px;
                }
                .detail-label {
                    font-weight: bold;
                    color: #6B7280;
                    width: 120px;
                }
                .detail-value {
                    color: #111827;
                    flex: 1;
                }
                .amount {
                    color: #B45309;
                    font-weight: bold;
                    font-size: 18px;
                }
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
                    color: white;
                    text-decoration: none;
                    padding: 12px 25px;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .signature {
                    margin-top: 30px;
                    color: #6B7280;
                    line-height: 1.6;
                }
                .email-footer {
                    background-color: #F9FAFB;
                    padding: 20px;
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
                    <h1>Payment Reminder</h1>
                </div>
                
                <div class="email-body">
                    <p class="greeting">Dear ${payment.schoolId.name},</p>
                    
                    <div class="highlight-box">
                        <p class="highlight-text">Your payment of <span class="amount">₹${payment.totalAmount}</span> is currently pending</p>
                    </div>
                    
                    <div class="payment-details">
                        <div class="detail-row">
                            <span class="detail-label">Course:</span>
                            <span class="detail-value">${payment.courses[0].levelName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Due Amount:</span>
                            <span class="detail-value amount">₹${payment.totalAmount}</span>
                        </div>
                    </div>
                    
                    <p class="message">Please complete your payment at the earliest to avoid any service disruptions. We appreciate your prompt attention to this matter.</p>
                    
                    <div class="signature">
                        <p>Thank you for your cooperation,</p>
                        <p><strong>Swamedha Team</strong></p>
                    </div>
                </div>
                
                <div class="email-footer">
                    <p>© ${new Date().getFullYear()} Swamedha. All rights reserved.</p>
                    <p>This is an automated reminder. Please contact support if you have any questions.</p>
                </div>
            </div>
        </body>
        </html>`;
      const mailResponse = await mailUtility(
        payment.schoolId.email,
        "Payment Reminder",
        mailContent
      );
      if (!mailResponse.success) {
        console.error(mailResponse.message);
        return res
          .status(500)
          .json({ message: "Error sending payment reminders" });
      }
    }

    res.status(200).json({ message: "Payment reminders sent successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error sending payment reminders",
      error: error.message,
    });
  }
});

router.get("/pending-installments", auth, async (req, res) => {
  if (req.user.role !== "school") {
    return res.status(403).send("Access denied.");
  }
  try {
    const schoolId = req.user.schoolId;
    const pendingInstallments = await Payment.find({
      schoolId: schoolId,
      status: { $in: ["pending", "partially_paid"] },
      "emiDetails.installments.status": "pending",
    }).populate("courses.courseId");
    res.status(200).json(pendingInstallments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching pending installments",
      error: error.message,
    });
  }
});

router.post(
  "/pay-installment/:paymentId/:installmentNumber",
  auth,
  async (req, res) => {
    if (req.user.role !== "school") {
      return res.status(403).send("Access denied.");
    }
    try {
      const { paymentId, installmentNumber } = req.params;
      const { amountPaid, utrNumber } = req.body;

      const payment = await Payment.findById(paymentId);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const installment = payment.emiDetails.installments.find(
        (inst) => inst.installmentNumber === parseInt(installmentNumber)
      );

      if (!installment) {
        return res.status(404).json({ message: "Installment not found" });
      }

      // Update installment details
      installment.amountPaid += amountPaid;
      installment.utrNumber = utrNumber;

      // Do not change the status; it remains as "pending"
      // installment.status remains unchanged
      installment.status = "pending_approval";

      // Save the updated payment
      await payment.save();

      res.status(200).json({
        message: "Installment paid successfully. Waiting for admin approval.",
        payment,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error paying installment", error: error.message });
    }
  }
);

router.post(
  "/approve-installment/:paymentId/:installmentNumber",
  auth,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied.");
    }
    try {
      const { paymentId, installmentNumber } = req.params;
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      const installment = payment.emiDetails.installments.find(
        (inst) => inst.installmentNumber === parseInt(installmentNumber)
      );

      if (!installment) {
        return res.status(404).json({ message: "Installment not found" });
      }

      // Approve the installment
      installment.status = "paid";

      // Update overall payment status if all installments are paid
      const allInstallmentsPaid = payment.emiDetails.installments.every(
        (inst) => inst.status === "paid"
      );

      if (allInstallmentsPaid) {
        payment.status = "approved";
      } else if (
        payment.emiDetails.installments.some((inst) => inst.status === "paid")
      ) {
        payment.status = "partially_paid";
      }

      await payment.save();

      res
        .status(200)
        .json({ message: "Installment approved successfully", payment });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error approving installment", error: error.message });
    }
  }
);

router.get("/school-payments", auth, async (req, res) => {
  if (req.user.role !== "school") {
    return res.status(403).send("Access denied.");
  }
  try {
    const schoolId = req.user.schoolId;
    // Fetch payments where schoolId matches
    const payments = await Payment.find({ schoolId }).populate(
      "courses.courseId"
    );

    if (!payments || payments.length === 0) {
      return res
        .status(404)
        .json({ message: "No payments found for this school" });
    }

    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payments", error: error.message });
  }
});

module.exports = router;
