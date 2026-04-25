import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import { API_BASE_URL } from "../apiConfig";

const CONSENT_ITEMS = [
  {
    key: "isGuardian",
    emoji: "👨‍👩‍👧",
    text: "I confirm that I am the parent/teacher/legal guardian of the child.",
  },
  {
    key: "understandsScreeningPurpose",
    emoji: "🔍",
    text: "I understand that this screening tool is designed to identify potential learning difficulties, not to provide a medical diagnosis.",
  },
  {
    key: "givesPermission",
    emoji: "✅",
    text: "I give permission for the child to participate in this assessment.",
  },
  {
    key: "understandsDataUsage",
    emoji: "📊",
    text: "I understand that the data collected will be used only for educational and research purposes.",
  },
  {
    key: "consentsAnonymousData",
    emoji: "🔒",
    text: "I consent to the anonymous use of this data to improve the system.",
  },
  {
    key: "understandsProfessionalInterpretation",
    emoji: "👩‍⚕️",
    text: "I understand that results should be interpreted by a qualified professional if needed.",
  },
  {
    key: "canWithdrawConsent",
    emoji: "↩️",
    text: "I can withdraw consent at any time before submitting the test.",
  },
];

export default function ConsentPage() {
  const navigate = useNavigate();
  const [statements, setStatements] = useState(
    CONSENT_ITEMS.reduce((acc, item) => ({ ...acc, [item.key]: false }), {})
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowItems(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Check all individual statements to determine if master checkbox should be available
  const allStatementsChecked = Object.values(statements).every(Boolean);

  const handleStatementToggle = (key) => {
    setStatements((prev) => ({ ...prev, [key]: !prev[key] }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!allStatementsChecked || !agreedToTerms) {
      setError("Please acknowledge all statements and check the consent box.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Generate a session ID for linking consent to user later
    const sessionId =
      localStorage.getItem("kidtest_consent_session") ||
      `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("kidtest_consent_session", sessionId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentStatements: statements,
          agreedToTerms,
          sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save consent.");
      }

      // Store consent info locally
      localStorage.setItem("kidtest_consent_given", "true");
      localStorage.setItem("kidtest_consent_id", data.consentId);

      // Navigate to login/signup choice
      navigate("/auth-choice");
    } catch (err) {
      // Fallback: allow proceeding even if backend is down
      console.warn("Consent save failed, using fallback:", err.message);
      localStorage.setItem("kidtest_consent_given", "true");
      localStorage.setItem("kidtest_consent_session", sessionId);
      navigate("/auth-choice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NatureBackground />

      <div className="w-full max-w-2xl relative" style={{ zIndex: 2 }}>
        <div
          className={`transition-all duration-700 ${
            showItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-3"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(92,184,92,0.3)",
              }}
            >
              <span className="text-xl">📋</span>
              <span
                className="text-sm font-bold"
                style={{ color: "#3d7a3d", fontFamily: "var(--font-body)" }}
              >
                Step 2 of 2
              </span>
            </div>
          </div>

          {/* Main card */}
          <div
            className="glass-card p-8 sm:p-10"
            style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
          >
            {/* Title */}
            <div className="text-center mb-6">
              <h1
                className="text-3xl sm:text-4xl mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(135deg, #1a3a1a, #0369a1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                📜 Consent Form
              </h1>
              <p className="font-semibold" style={{ color: "#4a9a4a" }}>
                Please review and acknowledge each statement below
              </p>
            </div>

            {/* Mascot */}
            <div className="flex justify-center mb-6">
              <Mascot
                mood="thinking"
                message="Please read carefully! 📖"
                size="sm"
              />
            </div>

            {/* Consent items */}
            <div className="space-y-3 mb-6">
              {CONSENT_ITEMS.map((item, index) => (
                <div
                  key={item.key}
                  onClick={() => handleStatementToggle(item.key)}
                  className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300"
                  style={{
                    background: statements[item.key]
                      ? "linear-gradient(135deg, rgba(232,248,232,0.95), rgba(200,240,200,0.9))"
                      : "rgba(255,255,255,0.7)",
                    border: statements[item.key]
                      ? "2px solid #5cb85c"
                      : "2px solid rgba(200,240,200,0.5)",
                    transform: statements[item.key] ? "scale(1.01)" : "scale(1)",
                    boxShadow: statements[item.key]
                      ? "0 4px 15px rgba(92,184,92,0.2)"
                      : "none",
                    animationDelay: `${index * 0.1}s`,
                    opacity: showItems ? 1 : 0,
                    transition: `all 0.3s ease, opacity 0.5s ease ${index * 0.08}s`,
                  }}
                >
                  {/* Checkbox */}
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-300"
                    style={{
                      background: statements[item.key]
                        ? "linear-gradient(135deg, #5cb85c, #4a9a4a)"
                        : "white",
                      border: statements[item.key]
                        ? "2px solid #4a9a4a"
                        : "2px solid #c8f0c8",
                      boxShadow: statements[item.key]
                        ? "0 2px 8px rgba(92,184,92,0.3)"
                        : "inset 0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    {statements[item.key] && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="animate-pop-in"
                      >
                        <path
                          d="M2 7L5.5 10.5L12 3.5"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p
                      className="text-sm sm:text-base font-semibold leading-relaxed"
                      style={{
                        color: statements[item.key] ? "#2d5a2d" : "#4a5568",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <span className="mr-2">{item.emoji}</span>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div
              className="h-px my-6"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #5cb85c, #0ea5e9, transparent)",
              }}
            />

            {/* Master consent checkbox */}
            <div
              onClick={() => {
                if (allStatementsChecked) {
                  setAgreedToTerms(!agreedToTerms);
                  setError("");
                }
              }}
              className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 mb-6"
              style={{
                background: agreedToTerms
                  ? "linear-gradient(135deg, rgba(14,165,233,0.1), rgba(92,184,92,0.15))"
                  : allStatementsChecked
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(200,200,200,0.3)",
                border: agreedToTerms
                  ? "3px solid #0ea5e9"
                  : "3px solid rgba(200,240,200,0.4)",
                cursor: allStatementsChecked ? "pointer" : "not-allowed",
                opacity: allStatementsChecked ? 1 : 0.5,
                animation: agreedToTerms
                  ? "rainbow-border 3s ease-in-out infinite"
                  : "none",
              }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                style={{
                  background: agreedToTerms
                    ? "linear-gradient(135deg, #0ea5e9, #0369a1)"
                    : "white",
                  border: agreedToTerms
                    ? "2px solid #0369a1"
                    : "2px solid #bae6fd",
                  boxShadow: agreedToTerms
                    ? "0 2px 12px rgba(14,165,233,0.4)"
                    : "inset 0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {agreedToTerms && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="animate-pop-in"
                  >
                    <path
                      d="M2 7L5.5 10.5L12 3.5"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <p
                className="text-base sm:text-lg font-bold"
                style={{
                  color: agreedToTerms ? "#0369a1" : "#4a5568",
                  fontFamily: "var(--font-display)",
                }}
              >
                ☐ I agree to the above terms and give consent.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4 text-center animate-shake">
                <p className="text-red-600 font-bold text-sm">🚫 {error}</p>
              </div>
            )}

            {/* Continue button */}
            <button
              id="consent-continue-btn"
              onClick={handleSubmit}
              disabled={!agreedToTerms || isSubmitting}
              className="game-btn game-btn-primary w-full text-lg"
              style={{
                opacity: agreedToTerms ? 1 : 0.5,
                cursor: agreedToTerms ? "pointer" : "not-allowed",
              }}
            >
              {isSubmitting ? (
                <span className="animate-wiggle inline-block">
                  🦉 Saving...
                </span>
              ) : (
                "📝 Continue"
              )}
            </button>

            {/* Back link */}
            <div className="text-center mt-4">
              <Link
                to="/welcome"
                className="text-forest-600 hover:text-forest-800 font-semibold text-sm transition-colors"
                style={{ textDecoration: "none" }}
              >
                ← Back to Welcome
              </Link>
            </div>
          </div>

          {/* Ground decorations */}
          <div className="flex justify-center gap-2 mt-4 text-2xl">
            {["🌿", "🦔", "🍀", "🌼"].map((emoji, i) => (
              <span
                key={i}
                className="animate-bounce-gentle"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
