import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

export default function SignupPage() {
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match! Try again 🔑");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);
    try {
      await signup(studentName, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NatureBackground />

      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="glass-card p-8">
          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-3xl text-forest-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              🌟 Join the Adventure!
            </h1>
            <p className="text-forest-600 font-semibold">Create your explorer account</p>
          </div>

          {/* Mascot */}
          <div className="flex justify-center mb-4">
            <Mascot mood="happy" message="I can't wait to meet you! 🎉" size="sm" />
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
                🧒 Student Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="nature-input"
                placeholder="What's your name, explorer?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-forest-700 mb-2">
                📧 Parent/Guardian Email
              </label>
              <input
                id="signup-email"
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
                🔑 Create Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nature-input"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-forest-700 mb-2">
                🔑 Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="nature-input"
                placeholder="Type your password again"
                required
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="game-btn game-btn-primary w-full text-lg mt-6"
            >
              {isLoading ? (
                <span className="animate-wiggle inline-block">🦉 Creating...</span>
              ) : (
                "🚀 Join the Adventure!"
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center mt-8 pt-6 border-t border-forest-100">
            <p className="text-forest-600 font-semibold">
              Already an explorer?{" "}
              <Link
                to="/"
                className="text-sky-600 hover:text-sky-700 font-bold underline decoration-wavy decoration-sky-300 underline-offset-4 transition-colors"
              >
                Enter the Forest! 🌳
              </Link>
            </p>
          </div>
        </div>

        {/* Decorations */}
        <div className="flex justify-center gap-2 mt-4 text-2xl">
          <span className="animate-bounce-gentle" style={{ animationDelay: "0s" }}>🌸</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: "0.2s" }}>🐝</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: "0.4s" }}>🌺</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: "0.6s" }}>🦋</span>
        </div>
      </div>
    </div>
  );
}
