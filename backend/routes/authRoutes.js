const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Sign Up
router.post("/signup", async (req, res) => {
  try {
    const { studentName, email, password, childAge, grade, schoolType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      studentName,
      email,
      password: hashedPassword,
      childAge,
      grade,
      schoolType
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        studentName: user.studentName,
        email: user.email,
        observerQuestions: user.observerQuestions || [],
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        studentName: user.studentName,
        email: user.email,
        observerQuestions: user.observerQuestions || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      studentName: user.studentName,
      email: user.email,
      observerQuestions: user.observerQuestions || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Save observer questions
router.put("/observer-questions", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.observerQuestions = answers;
    await user.save();
    res.json({ message: "Observer questions saved successfully" });
  } catch (error) {
    console.error("Save observer questions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
