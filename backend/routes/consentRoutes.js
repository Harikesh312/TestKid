const express = require("express");
const Consent = require("../models/Consent");

const router = express.Router();

// Save consent
router.post("/", async (req, res) => {
  try {
    const { consentStatements, agreedToTerms, sessionId } = req.body;

    if (!agreedToTerms) {
      return res.status(400).json({ message: "You must agree to the consent terms." });
    }

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    // Validate all consent statements are true
    const requiredStatements = [
      "isGuardian",
      "understandsScreeningPurpose",
      "givesPermission",
      "understandsDataUsage",
      "consentsAnonymousData",
      "understandsProfessionalInterpretation",
      "canWithdrawConsent",
    ];

    for (const statement of requiredStatements) {
      if (!consentStatements || !consentStatements[statement]) {
        return res.status(400).json({
          message: `Consent statement "${statement}" must be acknowledged.`,
        });
      }
    }

    const consent = new Consent({
      consentStatements,
      agreedToTerms,
      sessionId,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
    });

    await consent.save();

    res.status(201).json({
      message: "Consent recorded successfully.",
      consentId: consent._id,
      sessionId: consent.sessionId,
    });
  } catch (error) {
    console.error("Consent save error:", error);
    res.status(500).json({ message: "Server error while saving consent." });
  }
});

// Link consent to a user (called after signup/login)
router.patch("/link-user", async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ message: "sessionId and userId are required." });
    }

    const consent = await Consent.findOneAndUpdate(
      { sessionId, userId: null },
      { userId },
      { new: true }
    );

    if (!consent) {
      return res.status(404).json({ message: "Consent record not found for this session." });
    }

    res.json({ message: "Consent linked to user.", consentId: consent._id });
  } catch (error) {
    console.error("Consent link error:", error);
    res.status(500).json({ message: "Server error while linking consent." });
  }
});

module.exports = router;
