// controllers/contactController.js

const nodemailer = require("nodemailer");
const path = require("path");
const logoPath = path.join(__dirname, "..", "assets", "vivavista.png");

// Create transporter object for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vivavistavacations@gmail.com", // Your Gmail email address
    pass: "goeb zety hbwg svcy", // Your Gmail password or app-specific password if 2-factor authentication is enabled
  },
});

const supportPhone = "+0203 780 5023";
const supportEmail = "admin@vivavistavactions.co.uk";

const adminEmails = [
  "admin@vivavistavactions.co.uk",
  "mickey@vivavistavacations.co.uk",
  "vivavistavacations@gmail.com",
];

// Controller method to send contact message
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // 1. Send to admin
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: adminEmails,
      subject: "📩 New Inquiry from Contact Us Section – Viva Vista Website",
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<h2 style="color: #2c3e50;">📩 New Contact Inquiry</h2>
<p><strong>You’ve received a new message via the Viva Vista Vacations website.</strong></p>
<hr style="border: none; border-top: 1px solid #ccc;" />

<p>
<strong>🙍‍♂️ Name:</strong> ${name}<br/>
<strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a><br/>
<strong>📞 Phone:</strong> <a href="tel:${phone}" style="color: #3498db;">${phone}</a><br/>
<strong>📝 Message:</strong><br/>
<span style="display: inline-block; margin-top: 4px;">${message}</span>
</p>

<hr style="border: none; border-top: 1px solid #ccc;" />

<p>
📲 You can <strong><a href="tel:${phone}" style="color: #27ae60;">call them directly</a></strong> or respond via email above.
</p>
</div>
`,
    });

    // 2. Send to Client
    await transporter.sendMail({
      from: `"Viva Vista Vacations" <${supportEmail}>`,
      to: email,
      subject: "We've Received Your Message – Thank You for Contacting Us!",
      text: `
Hi ${name},

Thank you for reaching out to Viva Vista Vacations!

We’ve successfully received your message and one of our travel experts will get back to you as soon as possible. Whether you have a question, need travel inspiration, or are ready to start planning your next getaway — we’re here to help every step of the way.

Our team usually responds within 24 hours, but if your inquiry is urgent, feel free to contact us directly at ${supportPhone} or email us at ${supportEmail}.

We look forward to helping you create your perfect holiday experience!

Warm regards,
Team Viva Vista Vacations
Your Journey, Our Expertise.
`,
      html: `
<div style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
<h2 style="color:#0056b3;">We've Received Your Message – Thank You for Contacting Us!</h2>
<p>Hi ${name},</p>
<p>Thank you for reaching out to <strong>Viva Vista Vacations</strong>!</p>
<p>
We’ve successfully received your message and one of our travel experts will get back to you as soon as possible. Whether you have a question, need travel inspiration, or are ready to start planning your next getaway — we’re here to help every step of the way.
</p>
<p>
Our team usually responds within <strong>24 hours</strong>, but if your inquiry is urgent, feel free to contact us directly at
<a href="tel:${supportPhone}">${supportPhone}</a> or email us at
<a href="mailto:${supportEmail}">${supportEmail}</a>.
</p>
<p>We look forward to helping you create your perfect holiday experience!</p>
<br/>
<p>Warm regards,<br/>
<strong>Team Viva Vista Vacations</strong><br/>
<em>Your Journey, Our Expertise.</em>
</p>
<!-- Company logo in signature -->
<div style="margin-top:1rem;">
<img
src="cid:vivavista-logo"
alt="Viva Vista Vacations Logo"
style="max-width:150px; height:auto; display:block;"
/>
</div>
</div>
`,
      attachments: [
        {
          filename: "vivavista.png",
          path: logoPath, // adjust path if needed
          cid: "vivavista-logo", // must match the cid used in img tag
        },
      ],
    });

    res
      .status(200)
      .json({ message: "Message sent and reply sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

//Controller method to send group booking message
exports.sendGroupBookingInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      country = "Not Provided",
      countryCallingCode = "",
      adults,
      children = "0",
      callTimeFrom = "Not Specified",
      callTimeTo = "Not Specified",
      additionalNotes = "None",
    } = req.body;

    // Required field check
    if (!name || !email || !phone || !adults) {
      return res.status(400).json({
        message:
          "Please provide all required fields: name, email, phone, and number of adults.",
      });
    }

    // Send to Admin
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: adminEmails,
      subject: "👥 New Group Booking Inquiry – Viva Vista Website",
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<h2 style="color: #2c3e50;">👥 Group Booking Request</h2>
<p><strong>You’ve received a new group travel inquiry via the Viva Vista Vacations website.</strong></p>
<hr style="border: none; border-top: 1px solid #ccc;" />

<p>
<strong>🙍‍♂️ Name:</strong> ${name}<br/>
<strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a><br/>
<strong>📞 Phone:</strong> <a href="tel:${countryCallingCode}${phone}" style="color: #3498db;">${countryCallingCode} ${phone}</a><br/>
<strong>🌍 Country:</strong> ${country}<br/>
<strong>👨‍👩‍👧‍👦 Group Size:</strong> ${adults} Adults | ${children} Children<br/>
<strong>⏰ Preferred Call Time:</strong> 🕒 ${callTimeFrom} - ${callTimeTo}<br/>
<strong>📝 Additional Requirements:</strong> ${additionalNotes}
</p>

<hr style="border: none; border-top: 1px solid #ccc;" />

<p>
📲 You can <strong><a href="tel:${countryCallingCode}${phone}" style="color: #27ae60;">call them directly</a></strong> or respond via email above.
</p>
</div>
`,
    });

    // Send to Client
    await transporter.sendMail({
      from: `"Viva Vista Vacations" <${supportEmail}>`,
      to: email,
      subject: "Thank You for Your Group Booking Inquiry!",
      html: `
<div style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
<h2 style="color:#0056b3;">Thank You for Your Group Booking Inquiry!</h2>
<p>Hi ${name},</p>
<p>
Thank you for reaching out to <strong>Viva Vista Vacations</strong> with your group travel inquiry!
</p>
<p>
We’ve received your request and one of our travel specialists will review the details and get in touch with you shortly to discuss the best options tailored to your group’s needs. Whether it’s a family reunion, corporate retreat, friends' getaway, or a special celebration — we’re here to make your journey seamless and memorable.
</p>
<p>
In the meantime, feel free to explore our handpicked destinations and holiday packages on our website.
</p>
<p>
If you have any immediate questions, don’t hesitate to contact us at
<a href="tel:${supportPhone}">${supportPhone}</a> or email us at
<a href="mailto:${supportEmail}">${supportEmail}</a>.
</p>
<br/>
<p>We look forward to planning your perfect escape!</p>
<p>Warm regards,<br/>
<strong>Team Viva Vista Vacations</strong><br/>
<em>Your Journey, Our Expertise.</em>
</p>
<div style="margin-top:1rem;">
<img
src="cid:vivavista-logo"
alt="Viva Vista Vacations Logo"
style="max-width:150px; height:auto; display:block;"
/>
</div>
</div>
`,
      attachments: [
        {
          filename: "vivavista.png",
          path: logoPath,
          cid: "vivavista-logo",
        },
      ],
    });

    res
      .status(200)
      .json({ message: "Group booking inquiry submitted successfully." });
  } catch (error) {
    console.error("Group Booking Error:", error);
    res
      .status(500)
      .json({ message: "Failed to process group booking inquiry." });
  }
};

//Controller method to send subscribe message
exports.sendSubscribeMessage = async (req, res) => {
  try {
    const { email } = req.body;
    const name = email.split("@")[0]; // fallback to prefix if name not available

    //Welcome User To VivaVista NewsLatter Group
    await transporter.sendMail({
      from: `"Viva Vista Vacations" <${supportEmail}>`,
      to: email,
      subject: "Welcome to the Viva Vista Travel Club! ✨",
      html: `
<div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
<h2 style="color:#0056b3;">Welcome to the Viva Vista Travel Club! ✨</h2>
<p>Hi <strong>${name}</strong>,</p>
<p>Thank you for subscribing to <strong>Viva Vista Vacations</strong>!</p>
<p>
You're now part of a community that lives and breathes travel. From dreamy destinations and exclusive holiday deals to expert tips and inspiring itineraries — you’ll be the first to know it all, straight to your inbox.
</p>
<p>
We’re excited to help you discover the world, one beautiful vista at a time. 🌍✈
</p>
<p>Keep an eye on your inbox — your next adventure could be just a click away!</p>
<br/>
<p>Warm regards,<br/>
<strong>Team Viva Vista Vacations</strong></p>
<div style="margin-top:1rem;">
<img
src="cid:vivavista-logo"
alt="Viva Vista Vacations Logo"
style="max-width:150px; height:auto; display:block;"
/>
</div>
</div>
`,
      attachments: [
        {
          filename: "vivavista.png",
          path: logoPath,
          cid: "vivavista-logo",
        },
      ],
    });

    // 2) Notify ALL admins of the new subscriber
    await transporter.sendMail({
      from: `"Viva Vista Website" <${supportEmail}>`,
      to: adminEmails,
      subject: "📬 New Newsletter Subscriber Alert",
      html: `
<div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
<h2 style="color:#2c3e50;">📬 New Newsletter Subscription</h2>
<p><strong>A new user has just subscribed to the Viva Vista Vacations newsletter:</strong></p>
<p>
<strong>📧 Email:</strong> <a href="mailto:${email}" style="color:#3498db;">${email}</a><br/>
<strong>🧍 Name (inferred):</strong> ${name}
</p>
</div>
`,
    });

    res.status(200).json({ message: "Welcome email sent successfully." });
  } catch (error) {
    console.error("Subscription Email Error:", error);
    res.status(500).json({ message: "Failed to send welcome email." });
  }
};

//Controller method to dend booking info to client
exports.sendBookingConfirmation = async (req, res) => {
  try {
    const {
      name,
      email,
      destination,
      bookingRef,
      pax,
      departureDate,
      nights,
      days,
    } = req.body;

    const supportEmail = "support@vivavista.com"; // replace with actual
    const supportPhone = "+44 1234 567890"; // replace with actual

    await transporter.sendMail({
      from: `"Viva Vista Vacations" <${supportEmail}>`,
      to: email,
      subject: "Booking Confirmed – Get Ready for Your Holiday Adventure!",
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<h2 style="color: #0056b3;">🎉 Booking Confirmation</h2>
<p>Hi ${name},</p>

<p>Thank you for booking your holiday with <strong>Viva Vista Vacations</strong>!<br />
We’re excited to confirm your booking and help you create unforgettable memories.</p>

<h3>✈ Booking Summary:</h3>
<ul>
<li><strong>Destination:</strong> ${destination}</li>
<li><strong>Booking Reference:</strong> ${bookingRef}</li>
<li><strong>Number of Travellers:</strong> ${pax}</li>
<li><strong>Departure Date:</strong> ${departureDate}</li>
<li><strong>Holiday Duration:</strong> ${nights} nights / ${days} days</li>
</ul>

<p>Your travel documents, including your invoice, ATOL certificate, and final itinerary,
will be sent to you within <strong>3 to 5 working days</strong>.</p>

<p>If you have any questions in the meantime or need assistance, feel free to contact our team at
<a href="mailto:${supportEmail}">${supportEmail}</a> or call us on
<a href="tel:${supportPhone}">${supportPhone}</a>. We’re here to ensure your journey is smooth from the start.</p>

<p>Thank you for choosing <strong>Viva Vista Vacations</strong> – where every holiday is tailor-made just for you.</p>

<p>Warm regards,<br/>
<strong>Team Viva Vista Vacations</strong></p>

<div style="margin-top: 1rem;">
<img
src="cid:vivavista-logo"
alt="Viva Vista Vacations Logo"
style="max-width: 150px; height: auto;"
/>
</div>
</div>
`,
      attachments: [
        {
          filename: "vivavista.png",
          path: logoPath, // make sure this is correctly set on your server
          cid: "vivavista-logo",
        },
      ],
    });

    res.status(200).json({ message: "Booking confirmation sent to customer." });
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    res.status(500).json({ message: "Failed to send confirmation email." });
  }
};
