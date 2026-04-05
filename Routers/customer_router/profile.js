const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/customerauth");
const bcrypt = require("bcrypt");

const User = require("../../models/User");

// ================= GET PROFILE =================
router.get("/profile", jwt, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({ message: "User not found" });
    }

    return res.json({
      username: user.fullname,
      useremail: user.email
    });

  } catch (err) {
    console.error(err);
    res.json({ message: "Something went wrong" });
  }
});


// ================= UPDATE PROFILE =================
router.post("/profile/edit", jwt, async (req, res) => {
  try {
    const { fullname, gender, dob, password, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Hash password only if provided
    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // ✏️ Update fields
    user.fullname = fullname || user.fullname;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.address = address || user.address;
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Update successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;