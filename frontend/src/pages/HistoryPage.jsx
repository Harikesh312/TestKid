import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

const API_BASE = "http://localhost:5000";

function ScoreBadge({ score, label }) {
  const color =
    score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const emoji = score >= 80 ? "🌟" : score >= 50 ? "💪" : "📚";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
        style={{ background: `conic-gradient(${color} ${score}%, #e5e7eb ${score}%)` }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "white", color }}
        >
          {score}%
        </div>
      </div>
      <p className="text-xs font-bold text-gray-600">{emoji} {label}</p>
    </div>
  );
}

function ResultCard({ result, index }) {
  const avg = Math.round(
    (result.quizScore + result.readingScore + result.writingScore) / 3
  );
  const date = new Date(result.completedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const bgGrad =
    avg >= 80
      ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
      : avg >= 50
      ? "linear-gradient(135deg, #fef3c7, #fde68a)"
      : "linear-gradient(135deg, #fee2e2, #fecaca)";

  const borderColor =
    avg >= 80 ? "#6ee7b7" : avg >= 50 ? "#fcd34d" : "#fca5a5";

  return (
    <div
      className="rounded-2xl p-5 animate-pop-in"
      style={{
        background: bgGrad,
        border: `2px solid ${borderColor}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Test #{index + 1}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">{date}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-500">Age Group</p>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.1)", color: "#374151" }}
          >
            {result.ageGroup} yrs
          </span>
        </div>
      </div>

      {/* Score circles */}
      <div className="flex justify-around items-center mb-4">
        <ScoreBadge score={result.quizScore} label="Quiz" />
        <ScoreBadge score={result.readingScore} label="Reading" />
        <ScoreBadge score={result.writingScore} label="Writing" />
      </div>

      {/* Overall average */}
      <div
        className="rounded-xl px-4 py-2 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.6)" }}
      >
        <span className="text-sm font-bold text-gray-700">Overall Score</span>
        <span
          className="text-xl font-bold"
          style={{
            color:
              avg >= 80 ? "#059669" : avg >= 50 ? "#d97706" : "#dc2626",
            fontFamily: "var(--font-display)",
          }}
        >
          {avg}%{" "}
          {avg >= 80 ? "🎉" : avg >= 50 ? "👍" : "💡"}
        </span>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/results/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Could not load results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const avgQuiz =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.quizScore, 0) / results.length)
      : 0;
  const avgReading =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.readingScore, 0) / results.length)
      : 0;
  const avgWriting =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.writingScore, 0) / results.length)
      : 0;
  const bestOverall =
    results.length > 0
      ? Math.round(
          Math.max(
            ...results.map((r) =>
              Math.round((r.quizScore + r.readingScore + r.writingScore) / 3)
            )
          )
        )
      : 0;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-24 relative">
      <NatureBackground />
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1
            className="text-3xl md:text-4xl text-white font-bold drop-shadow-lg mb-2"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            📊 My Results
          </h1>
          <p className="text-white/80 font-semibold">
            {user?.studentName ? `${user.studentName}'s` : "Your"} learning journey
          </p>
        </div>

        {/* Summary stats */}
        {results.length > 0 && (
          <div
            className="glass-card p-6 mb-6 animate-pop-in"
          >
            <h2
              className="text-center text-lg font-bold text-forest-800 mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              🏆 Overall Progress
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBox label="Tests Done" value={results.length} icon="📝" color="#6366f1" />
              <StatBox label="Avg Quiz" value={`${avgQuiz}%`} icon="🧠" color="#f59e0b" />
              <StatBox label="Avg Reading" value={`${avgReading}%`} icon="📖" color="#10b981" />
              <StatBox label="Best Score" value={`${bestOverall}%`} icon="🌟" color="#f472b6" />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass-card p-12 text-center animate-pop-in">
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full bg-white"
                  style={{
                    animation: "ai-bounce 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-white font-bold">Loading your results…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-6 text-center animate-pop-in">
            <p className="text-red-600 font-bold mb-4">{error}</p>
            <button onClick={fetchResults} className="game-btn game-btn-primary">
              🔄 Try Again
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && results.length === 0 && (
          <div className="glass-card p-10 text-center animate-pop-in">
            <div className="text-6xl mb-4">📭</div>
            <h3
              className="text-xl font-bold text-forest-800 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No results yet!
            </h3>
            <p className="text-forest-600 mb-6">
              Complete a test to see your scores here.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="game-btn game-btn-primary"
            >
              🎮 Start a Test
            </button>
          </div>
        )}

        {/* Results list */}
        {!loading && !error && results.length > 0 && (
          <div className="flex flex-col gap-4">
            {results.map((result, i) => (
              <ResultCard key={result._id || i} result={result} index={i} />
            ))}
            <div className="text-center mt-4 mb-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="game-btn game-btn-primary text-lg"
              >
                🎮 Take Another Test!
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ai-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StatBox({ label, value, icon, color }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: `${color}18`, border: `2px solid ${color}33` }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <p
        className="text-2xl font-bold"
        style={{ color, fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      <p className="text-xs font-bold text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
