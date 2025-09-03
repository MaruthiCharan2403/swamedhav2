const nodemailer = require("nodemailer");
require("dotenv").config();


const sendmail = async (parentEmail, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const mailOptions = {
    from: `"Swamedha" <kmpvr2.0@gmail.com>`,
    to: parentEmail,
    subject: subject,
    html: text,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully", info };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = sendmail;
