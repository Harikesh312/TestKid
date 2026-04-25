import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Stagger the animations
    const t1 = setTimeout(() => setShowContent(true), 300);
    const t2 = setTimeout(() => setShowButton(true), 1000);

    // Generate sparkle positions
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      top: Math.random() * 80 + 5,
      delay: Math.random() * 3,
      size: Math.random() * 12 + 8,
      emoji: ["✨", "⭐", "🌟", "💫"][Math.floor(Math.random() * 4)],
    }));
    setSparkles(newSparkles);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <NatureBackground />

      {/* Floating sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            animation: `sparkle 2s ease-in-out infinite, float 4s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
            zIndex: 1,
          }}
        >
          {s.emoji}
        </div>
      ))}

      <div
        className="text-center relative"
        style={{ zIndex: 2 }}
      >
        {/* Main title card */}
        <div
          className={`transition-all duration-1000 ${
            showContent
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          {/* Logo badge */}
          <div
            className="mx-auto mb-6 w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #5cb85c, #0ea5e9)",
              boxShadow:
                "0 0 0 6px rgba(255,255,255,0.4), 0 0 40px rgba(92,184,92,0.3), 0 8px 32px rgba(0,0,0,0.15)",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          >
            <span className="text-5xl" role="img" aria-label="brain">
              🧠
            </span>
          </div>

          {/* Glass card */}
          <div
            className="glass-card px-10 py-12 sm:px-16 sm:py-14 max-w-xl mx-auto"
            style={{
              animation: "pulse-glow 4s ease-in-out infinite",
            }}
          >
            <h1
              className="text-4xl sm:text-5xl mb-3"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #1a3a1a, #0369a1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
              }}
            >
              Smart Learning
              <br />
              Screening Tool
            </h1>

            <div
              className="mx-auto w-20 h-1 rounded-full my-4"
              style={{
                background: "linear-gradient(90deg, #5cb85c, #0ea5e9, #a78bfa)",
              }}
            />

            <p
              className="text-lg sm:text-xl font-semibold mb-2"
              style={{
                color: "#3d7a3d",
                fontFamily: "var(--font-body)",
              }}
            >
              Discover your child's learning superpowers! 🌟
            </p>
            <p
              className="text-sm font-medium mb-6"
              style={{ color: "#6b9e6b" }}
            >
              A fun, engaging screening tool to help identify learning strengths
              and areas that may need extra support.
            </p>

            {/* Mascot */}
            <div className="flex justify-center mb-6">
              <Mascot
                mood="cheering"
                message="Let's start this amazing adventure! 🎉"
                size="md"
              />
            </div>

            {/* Start button */}
            <div
              className={`transition-all duration-700 ${
                showButton
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-90"
              }`}
            >
              <button
                id="welcome-start-btn"
                onClick={() => navigate("/consent")}
                className="game-btn game-btn-primary text-xl px-12 py-4"
                style={{
                  background:
                    "linear-gradient(135deg, #5cb85c 0%, #4a9a4a 50%, #3d7a3d 100%)",
                  fontSize: "1.3rem",
                  letterSpacing: "0.02em",
                  animation: "bounce-gentle 2s ease-in-out infinite",
                }}
              >
                🚀 Let's Get Started!
              </button>
            </div>
          </div>

          {/* Ground decorations */}
          <div className="flex justify-center gap-3 mt-6 text-3xl">
            {["🌻", "🐝", "🦋", "🌈", "🌸"].map((emoji, i) => (
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
