const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ageGroup: {
    type: String,
    enum: ["5-8", "8-12"],
    required: true,
  },
  quizScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  readingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  writingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", resultSchema);
