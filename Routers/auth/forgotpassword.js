const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const User = require("../../models/User");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 📧 Mail setup
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);


// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.reset_token = otp;
    user.reset_expires = otpExpires;

    await user.save();

    // DEV MODE (no email)
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your-real-gmail@gmail.com") {
      return res.json({
        message: "OTP generated (dev mode)",
        otp
      });
    }

    // 📧 Send email
   await resend.emails.send({
  from: "onboarding@resend.dev",
  to: email,
  subject: "Password Reset OTP - PICKNGO",
  html: `<h3>Your OTP is: ${otp}</h3>`
});
    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
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

    // 🔐 Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    user.reset_token = sessionToken;
    await user.save();

    res.json({
      message: "OTP verified",
      sessionToken
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { sessionToken, newPassword } = req.body;

    if (!sessionToken || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ reset_token: sessionToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid session token" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.reset_token = null;
    user.reset_expires = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;