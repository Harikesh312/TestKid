const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema({
  // Stores the role of the person giving consent
  role: {
    type: String,
    enum: ["parent", "teacher", "legal_guardian"],
    default: "parent",
  },
  // All individual consent statements acknowledged
  consentStatements: {
    isGuardian: { type: Boolean, required: true },
    understandsScreeningPurpose: { type: Boolean, required: true },
    givesPermission: { type: Boolean, required: true },
    understandsDataUsage: { type: Boolean, required: true },
    consentsAnonymousData: { type: Boolean, required: true },
    understandsProfessionalInterpretation: { type: Boolean, required: true },
    canWithdrawConsent: { type: Boolean, required: true },
  },
  // Master "I agree" checkbox
  agreedToTerms: {
    type: Boolean,
    required: true,
    default: false,
  },
  // Optional link to user (set after signup/login)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  // Session identifier so we can link consent to a user later
  sessionId: {
    type: String,
    required: true,
  },
  // IP address for audit trail
  ipAddress: {
    type: String,
    default: null,
  },
  consentedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Consent", consentSchema);
