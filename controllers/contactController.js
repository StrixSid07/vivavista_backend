// controllers/contactController.js

const nodemailer = require("nodemailer");

// Create transporter object for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sparadocx07@gmail.com", // Your Gmail email address
    pass: "oewx puka kdhg zlwe", // Your Gmail password or app-specific password if 2-factor authentication is enabled
  },
});

// Controller method to send contact message
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // 1. Send to admin
    await transporter.sendMail({
      from: email,
      to: "sparadocx07@gmail.com",
      subject: "New Contact Message from Website",
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    });

    
    await transporter.sendMail({
      from: "sparadocx07@gmail.com",
      to: email,
      subject: "We've received your message!",
      text: `Hi ${name},\n\nThanks for reaching out! We'll get back to you soon.\n\n- VivaVista Team`,
    });

    res
      .status(200)
      .json({ message: "Message sent and reply sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
