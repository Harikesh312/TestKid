const express = require("express");
const Result = require("../models/Result");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Save results
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { ageGroup, quizScore, readingScore, writingScore } = req.body;

    const result = new Result({
      userId: req.userId,
      ageGroup,
      quizScore,
      readingScore,
      writingScore,
    });

    await result.save();
    res.status(201).json(result);
  } catch (error) {
    console.error("Save result error:", error);
    res.status(500).json({ message: "Error saving results" });
  }
});

// Get results for a user
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .sort({ completedAt: -1 })
      .limit(10);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching results" });
  }
});

module.exports = router;
