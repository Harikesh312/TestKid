const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, "Student name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  // Child demographics
  childAge: {
    type: Number,
    min: 3,
    max: 18,
    default: null,
  },
  grade: {
    type: String,
    trim: true,
    default: null,
  },
  schoolType: {
    type: String,
    enum: ["government", "private", "home_school", "other", null],
    default: null,
  },
  observerQuestions: {
    type: [Number],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
