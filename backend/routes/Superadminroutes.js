const express = require("express");
const router = express.Router();
const School = require("../models/Schoolschema");
const Payment = require("../models/Paymentschema");
const Course = require("../models/Course");
const User = require("../models/Userschema");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const Student = require("../models/Studentschema");
const mailUtility = require('../middleware/mailUtility');
const Trainer = require("../models/TrainerSchema");
const UserFeedback = require("../models/UserFeedback");
const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
};
router.post("/:schoolId/add-courses", auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { schoolId } = req.params;
    const { courses } = req.body;

    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).send("School not found");
        }
        courses.forEach(course => {
            const courseExists = school.availableCourses.some(ac => ac.courseId.equals(course.courseId));
            if (!courseExists) {
                school.availableCourses.push({
                    courseId: course.courseId,
                    levelName: course.levelName,
                    isAvailable: true
                });
            }
        });

        await school.save();
        res.status(200).send("Courses added to availableCourses successfully");
    } catch (error) {
        res.status(500).send("Error adding courses to availableCourses", error);
    }
});

//remove courses from availableCourses
router.post("/:schoolId/remove-courses", auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { schoolId } = req.params;
    const { courses } = req.body;

    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).send("School not found");
        }
        courses.forEach(course => {
            school.availableCourses = school.availableCourses.filter(ac => !ac.courseId.equals(course.courseId));
        });

        await school.save();
        res.status(200).send("Courses removed from availableCourses successfully");
    } catch (error) {
        res.status(500).send("Error removing courses from availableCourses", error);
    }
});

router.get("/pending", auth, async (req, res) => {
    try {
        const payments = await Payment.find({ status: { $in: ["pending_approval", "partially_paid"] } }).populate("schoolId");

        const modifiedPayments = [];

        for (let i = 0; i < payments.length; i++) {
            const payment = payments[i]._doc;
            const school = await School.findById(payment.schoolId);
            const user = await User.findById(school.userId);

            // Skip this payment if there's no school or user data
            if (!school || !user) continue;

            // Create a base payment object with school details
            const paymentWithSchoolDetails = {
                ...payment,
                schoolName: school.name,
                phone: user.phone,
                email: user.email,
            };

            // For full payments, always include them
            if (payment.paymentMethod === "full") {
                modifiedPayments.push(paymentWithSchoolDetails);
                continue;
            }

            // For EMI payments, check if there's at least one pending installment with a UTR number
            if (payment.paymentMethod === "emi" && payment.emiDetails && payment.emiDetails.installments) {
                const pendingInstallmentsWithUTR = payment.emiDetails.installments.filter(
                    inst => inst.status === "pending_approval" && inst.utrNumber && inst.utrNumber.trim() !== ""
                );

                // If there are no pending installments with UTR numbers, skip this payment
                if (pendingInstallmentsWithUTR.length === 0) continue;

                // Sort by installment number to ensure we get the earliest pending installment
                pendingInstallmentsWithUTR.sort((a, b) => a.installmentNumber - b.installmentNumber);

                // Modify the payment object to include only the first pending installment with UTR
                paymentWithSchoolDetails.emiDetails = {
                    ...payment.emiDetails,
                    installments: [pendingInstallmentsWithUTR[0]]
                };

                modifiedPayments.push(paymentWithSchoolDetails);
            }
        }

        res.status(200).json(modifiedPayments);
    } catch (error) {
        console.error("Error fetching pending payments:", error);
        res.status(500).json({ message: "Error fetching pending payments" });
    }
});

router.post("/verify", async (req, res) => {
    const { paymentId, status, installmentNumber } = req.body;

    try {
        if (!paymentId || !status || !["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid input" });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // For full payments
        if (payment.paymentMethod === "full") {
            // Map the admin status to payment status
            payment.status = status === "approved" ? "approved" : "rejected";

            // If approved, ensure the total amount paid is updated
            if (status === "approved") {
                payment.totalAmountPaid = payment.totalAmount;
            }

            await payment.save();
            return res.status(200).json({
                message: "Payment verified successfully",
                payment
            });
        }

        // For EMI payments
        if (payment.paymentMethod === "emi") {
            if (installmentNumber === undefined || installmentNumber === null) {
                return res.status(400).json({
                    message: "Installment number is required for EMI payments"
                });
            }

            const installmentIndex = payment.emiDetails.installments.findIndex(
                (inst) => inst.installmentNumber === parseInt(installmentNumber)
            );

            if (installmentIndex === -1) {
                return res.status(404).json({ message: "Installment not found" });
            }

            const installment = payment.emiDetails.installments[installmentIndex];

            // Map the admin status to installment status
            installment.status = status === "approved" ? "paid" : "pending_approval";
            
            if (status === "approved") {
                // Mark the installment as paid
                installment.amountPaid = installment.amountDue;

                // Update the total amount paid
                payment.totalAmountPaid += installment.amountDue;
            }

            // Update the installment in the array
            payment.emiDetails.installments[installmentIndex] = installment;

            // Check if all installments are paid
            const allInstallmentsPaid = payment.emiDetails.installments.every(
                (inst) => inst.status === "paid"
            );

            // Update payment status based on installments
            if (allInstallmentsPaid) {
                payment.status = "approved";
            } else if (payment.totalAmountPaid > 0) {
                payment.status = "partially_paid";
            } else {
                payment.status = "pending";
            }

            await payment.save();
            return res.status(200).json({
                message: "Installment verified successfully",
                payment
            });
        }

        return res.status(400).json({ message: "Invalid payment method" });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Error verifying payment" });
    }
});

router.get("/enabled", auth, async (req, res) => {
    // if (req.user.role !== "school") return res.status(401).json({ message: "Unauthorized" });
    try {
        const id = req.user.schoolId;
        const school = await School.findById(id);
        if (!school) return res.status(404).json({ message: "School not found" });
        const courses = await Course.find();
        const enabledCourses = school.enabledCourses.map(course => {
            const courseDetails = courses.find(c => c._id.equals(course.courseId));
            return {
                courseId: course.courseId,
                levelName: course.levelName,
                isAvailable: course.isAvailable,
                studentcount: course.studentcount,
                courseDetails
            };
        });
        res.json(enabledCourses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/students/:schoolId", auth, async (req, res) => {
    try {
        const students = await Student.find({ schoolId: req.params.schoolId });
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/get/:schoolId", auth, async (req, res) => {
    try {
        const students = await Student.find({ schoolId: req.params.schoolId });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get("/classes/:schoolId", auth, async (req, res) => {
    try {
        const classes = await Student.distinct("class", {
            schoolId: req.params.schoolId,
        });
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/addtrainer', auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { name, email, password, phone } = req.body;
    try {
        const newTrainer = new Trainer({
            name,
            email,
            phone,
            schoolIds: [],
        });
        const savedTrainer = await newTrainer.save();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: name,
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'trainer',
            trainerId: savedTrainer._id,
        });
        await newUser.save();
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
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .header {
                background-color: #D97706;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 5px 5px;
                border-left: 1px solid #eeeeee;
                border-right: 1px solid #eeeeee;
                border-bottom: 1px solid #eeeeee;
            }
            .welcome-text {
                font-size: 18px;
                color: #D97706;
                margin-bottom: 25px;
            }
            .credentials {
                background-color: #FFF0E6;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #D97706;
            }
            .credentials p {
                margin: 10px 0;
            }
            .label {
                font-weight: bold;
                color: #D97706;
            }
            .value {
                color: #333333;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666666;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background-color: #D97706;
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Swamedha!</h1>
            </div>
            <div class="content">
                <p class="welcome-text">Thank you for registering with us. Your account has been successfully created.</p>
                
                <p>Here are your account details:</p>
                
                <div class="credentials">
                    <p><span class="label">Username:</span> <span class="value">${name}</span></p>
                    <p><span class="label">Email:</span> <span class="value">${email}</span></p>
                    <p><span class="label">Password:</span> <span class="value">${password}</span></p>
                </div>
                
                <p>You can now log in to your account using these credentials.</p>
                
                <div style="text-align: center;">
                    <a href="https://swamedha.vercel.app/login" class="button">Log In Now</a>
                </div>
                
                <div class="footer">
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best Regards,<br>Swamedha Team</p>
                </div>
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
        return res.status(201).json({ message: "Trainer added successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding trainer" });
    }
});

router.get('/viewtrainer', auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const trainers = await User.find({ role: 'trainer' }).populate({
            path : 'trainerId',
            populate : {
                path : 'schoolIds',
                model : 'School'
            }
        })
        return res.status(200).json(trainers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching trainers" });
    }
});

router.put('/assigntrainer', auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { trainerId, schoolIds } = req.body;
    try {
        const trainer = await Trainer.findById(trainerId);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        const existingSchoolIds = await School.find({
            _id: { $in: schoolIds }
        });
        if (existingSchoolIds.length !== schoolIds.length) {
            return res.status(404).json({ message: "One or more schools not found" });
        }

        const updatedTrainer = await Trainer.findByIdAndUpdate(
            trainerId,
            { $addToSet: { schoolIds: { $each: schoolIds } } },
            { new: true }
        );
        if (!updatedTrainer) {
            return res.status(500).json({ message: "Error updating trainer" });
        }
        const bulkOps = schoolIds.map(schoolId => ({
            updateOne: {
                filter: { _id: schoolId },
                update: { $addToSet: { trainers: trainerId } }
            }
        }));
        await School.bulkWrite(bulkOps);
        return res.status(200).json({ message: "Trainer assigned successfully", trainer: updatedTrainer });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error assigning trainer" });
    }
});

router.get('/trainers-and-schools', auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const trainers = await User.find({ role: 'trainer' }).populate({
            path : 'trainerId',
            populate : {
                path : 'schoolIds',
                model : 'School'
            }
        });
        const schools = await School.find();
        if(!trainers || !schools) {
            return res.status(404).json({ message: "No trainers or schools found" });
        }
        return res.status(200).json({ trainers, schools });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching trainers and schools" });
    }
});

router.get('/getfeedback',auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const feedbacks = await UserFeedback.find();
        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).json({ message: "No feedback found" });
        }
        return res.status(200).json(feedbacks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching feedback" });
    }
});

module.exports = router;
