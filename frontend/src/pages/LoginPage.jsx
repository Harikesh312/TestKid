import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NatureBackground />

      <div className="w-full max-w-md animate-slide-up">
        {/* Treehouse Top */}
        <div className="text-center mb-4">
          <div className="relative inline-block">
            {/* Roof */}
            <div
              className="w-64 h-0 mx-auto"
              style={{
                borderLeft: "40px solid transparent",
                borderRight: "40px solid transparent",
                borderBottom: "50px solid #8B4513",
              }}
            />
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              🏠
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8 animate-pulse-glow">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl text-forest-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              🌳 Welcome Back!
            </h1>
            <p className="text-forest-600 font-semibold">Enter the magical forest</p>
          </div>

          {/* Mascot */}
          <div className="flex justify-center mb-4">
            <Mascot mood="happy" message="Hello, explorer! 🌟" size="sm" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4 text-center animate-shake">
              <p className="text-red-600 font-bold text-sm">🚫 {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-forest-700 mb-2">
                📧 Parent/Guardian Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nature-input"
                placeholder="parent@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-forest-700 mb-2">
                🔑 Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nature-input"
                placeholder="Enter your secret password"
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="game-btn game-btn-primary w-full text-lg mt-4"
            >
              {isLoading ? (
                <span className="animate-wiggle inline-block">🦉 Entering...</span>
              ) : (
                "🚪 Enter the Forest"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-8 pt-6 border-t border-forest-100">
            <p className="text-forest-600 font-semibold">
              New explorer?{" "}
              <Link
                to="/signup"
                className="text-sky-600 hover:text-sky-700 font-bold underline decoration-wavy decoration-sky-300 underline-offset-4 transition-colors"
              >
                Join the Adventure! 🌈
              </Link>
            </p>
          </div>
        </div>

        {/* Ground decoration */}
        <div className="flex justify-center gap-2 mt-4 text-2xl">
          <span className="animate-bounce-gentle" style={{ animationDelay: "0s" }}>🌿</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: "0.2s" }}>🍄</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: "0.4s" }}>🌻</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: "0.6s" }}>🌿</span>
        </div>
      </div>
    </div>
  );
}
