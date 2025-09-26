const router = require("express").Router();
const crypto = require("crypto");
const User = require("../models/Userschema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailUtility = require("../middleware/mailUtility");
const generateUniqueUsername = require("../utils/generateUsername");
const School = require("../models/Schoolschema");
const Student = require("../models/Studentschema");
const Teacher = require("../models/Teacherschema");
const auth = require("../middleware/auth");
const UserFeedback = require("../models/UserFeedback");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const role = "admin";
    const generatedUsername = await generateUniqueUsername(email);
    const user = new User({
      name,
      username: generatedUsername,
      email,
      password,
      phone,
      role,
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
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
                    <p><span class="label">Username:</span> <span class="value">${generatedUsername}</span></p>
                    <p><span class="label">Email:</span> <span class="value">${email}</span></p>
                    <p><span class="label">Password:</span> <span class="value">${password}</span></p>
                </div>
                
                
                
                <div class="footer">
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best Regards,<br>The Swamedha Team</p>
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
    res.status(201).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
router.post("/superadminregister", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const role = "superadmin";
    const generatedUsername = await generateUniqueUsername(email);
    const user = new User({
      name,
      username: generatedUsername,
      email,
      password,
      phone,
      role,
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    const mailContent = `
        <!DOCTYPE html>
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
                    <p><span class="label">Username:</span> <span class="value">${generatedUsername}</span></p>
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
    </html>
        `;
    const mailResponse = await mailUtility(
      email,
      "Welcome to Swamedha",
      mailContent
    );
    if (!mailResponse.success) {
      console.error(mailResponse.message);
      return res.status(500).json({ message: "Failed to send mail" });
    }
    res.status(201).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.status === "hold") {
      return res
        .status(400)
        .json({ message: "User is on hold.You cannot Login" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        schoolId: user.schoolId,
        studentId: user.studentId,
        teacherId: user.teacherId,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Login Failed", error: error.message });
  }
});

//forgot password
router.post("/forgotpassword", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const resettoken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    user.resetToken = resettoken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    const mailContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
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
                    padding: 20px;
                    background-color: #ffffff;
                }
                .header {
                    background-color: #D97706;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px 5px 0 0;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #eeeeee;
                    border-top: none;
                    border-radius: 0 0 5px 5px;
                }
                .message {
                    margin-bottom: 25px;
                    font-size: 16px;
                }
                .button {
                    display: inline-block;
                    background-color: #D97706;
                    color: white;
                    text-decoration: none;
                    padding: 12px 25px;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 15px 0;
                }
                .warning {
                    background-color: #FEF3C7;
                    border-left: 4px solid #D97706;
                    padding: 10px 15px;
                    margin: 20px 0;
                    color: #854d0e;
                    font-size: 14px;
                }
                .footer {
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 1px solid #eeeeee;
                    color: #666666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                    <div class="message">
                        <p>We received a request to reset your password for your Swamedha account. To complete the process, please click the button below:</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="https://swamedha.vercel.app/resetpassword?token=${resettoken}&email=${email}" class="button">Reset Password</a>
                    </div>
                    
                    <div class="warning">
                        <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
                    </div>
                    
                    <div class="message">
                        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you!</p>
                        <p>Team Swamedha</p>
                    </div>
                </div>
            </div>
        </body>
        </html>`;
    const mailResponse = await mailUtility(
      user.email,
      "Password Reset",
      mailContent
    );
    if (!mailResponse.success) {
      console.error(mailResponse.message);
      return res.status(500).json({ message: "Failed to send reset link" });
    }
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send reset link", error: error.message });
  }
});

//change password
router.post("/changepassword", async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
});

//reset password
router.post("/resetpassword", async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const user = await User.findOne({ email });
    if (
      !user ||
      user.resetToken !== token ||
      Date.now() > user.resetTokenExpiry
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to reset password", error: error.message });
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    const { id, role, schoolId, studentId } = req.user; // Extract from token

    // Fetch user details except password
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileDetails = { ...user._doc };

    switch (role) {
      case "school":
        profileDetails.schoolDetails = await School.findById(schoolId);
        break;
      case "student":
        profileDetails.studentDetails = await Student.findById(studentId);
        break;
      case "teacher":
        profileDetails.teacherDetails = await Teacher.findOne({
          email: user.email,
        });
        break;
    }

    res.status(200).json(profileDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// roy=ute to save user contact us feedback
router.post("/contactus", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message || !subject) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if(UserFeedback.findOne({ email })) {
      return res.status(400).json({ message: "Feedback already submitted by the user" });
    }
    
    const feedback = new UserFeedback({
      name,
      email,
      subject,
      feedback: message,
    });
    await feedback.save();
    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackId: feedback._id,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

module.exports = router;
