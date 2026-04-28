import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

export default function AuthChoicePage() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // If no consent was given, redirect back
    const consentGiven = localStorage.getItem("kidtest_consent_given");
    if (!consentGiven) {
      navigate("/welcome", { replace: true });
      return;
    }
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NatureBackground />

      <div
        className={`w-full max-w-lg relative transition-all duration-700 ${
          showContent
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
        style={{ zIndex: 2 }}
      >
        {/* Glass card */}
        <div
          className="glass-card p-10 sm:p-12"
          style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
        >
          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl mb-2"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #1a3a1a, #0369a1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🎉 You're All Set!
            </h1>
            <p className="font-semibold" style={{ color: "#4a9a4a" }}>
              Thank you for giving consent. Now let's get you started!
            </p>
          </div>

          {/* Mascot */}
          <div className="flex justify-center mb-8">
            <Mascot
              mood="cheering"
              message="Great job! Now pick your path! 🌟"
              size="md"
            />
          </div>

          {/* Consent verified badge */}
          <div
            className="flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-full mx-auto"
            style={{
              background:
                "linear-gradient(135deg, rgba(232,248,232,0.9), rgba(200,240,200,0.8))",
              border: "2px solid #5cb85c",
              width: "fit-content",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="9" fill="#5cb85c" />
              <path
                d="M5 9L8 12L13 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-sm font-bold"
              style={{ color: "#2d5a2d" }}
            >
              Consent Verified ✓
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button
                id="auth-login-btn"
                className="game-btn game-btn-primary w-full text-xl py-3"
              >
                🚪 Log In
              </button>
            </Link>

            <Link to="/signup" style={{ textDecoration: "none" }}>
              <button
                id="auth-signup-btn"
                className="game-btn game-btn-secondary w-full text-xl py-3"
              >
                🌟 Sign Up — New Explorer
              </button>
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div
              className="flex-1 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #c8f0c8)" }}
            />
            <span className="text-sm font-bold" style={{ color: "#7ed87e" }}>
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "linear-gradient(90deg, #c8f0c8, transparent)" }}
            />
          </div>

          {/* Back link */}
          <div className="text-center">
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
          {["🌳", "🐿️", "🍃", "🌷"].map((emoji, i) => (
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
  );
}
