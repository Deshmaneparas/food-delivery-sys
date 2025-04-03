const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Admin Codes
const ADMIN_CODES = {
  "Restaurant Admin": "REST_ADMIN_123",
  "Super Admin": "SUPER_ADMIN_456",
};

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, role, adminCode } = req.body;

  try {
    // Validate Admin Code for Admin roles
    if (role !== "Customer" && ADMIN_CODES[role] !== adminCode) {
      return res.status(400).json({ message: "Invalid Admin Code" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Registering User" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

    // Generate Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role ,name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Error Logging In" });
  }
});





module.exports = router;
