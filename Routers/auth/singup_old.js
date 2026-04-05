const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const User = require("../../models/User");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 📧 Mail setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ================= SEND SIGNUP OTP =================
router.post("/send-signup-otp", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.json({
        message: "Password must include uppercase, lowercase, number, special character"
      });
    }

    const existingUser = await User.findOne({ email, password: { $ne: null } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      {
        fullname,
        reset_token: otp,
        reset_expires: otpExpires,
        password: null,
        tempPassword: hashedPassword
      },
      { upsert: true }
    );

    let emailSent = false;

if (
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_USER !== "your-real-gmail@gmail.com"
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Signup OTP - PICKNGO",
      html: `<h2>Your OTP: ${otp}</h2>`
    });

    emailSent = true;
  } catch (mailErr) {
    console.log("EMAIL ERROR:", mailErr.message);
    emailSent = false; // 🔥 force fallback
  }
}

// 🔥 ALWAYS RETURN RESPONSE
return res.json({
  message: emailSent ? "OTP sent to email" : "OTP (dev mode)",
  otp
});

  } catch (err) {
    console.error("SIGNUP OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ================= VERIFY OTP =================
router.post("/verify-signup-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      reset_token: otp,
      reset_expires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Activate account
    user.password = user.tempPassword;
    user.tempPassword = null;
    user.reset_token = null;
    user.reset_expires = null;
    user.role = "customer";

    await user.save();

    res.json({
      message: "Account created successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;