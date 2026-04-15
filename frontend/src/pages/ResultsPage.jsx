import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import StarRating from "../components/StarRating";

export default function ResultsPage() {
  const { user, logout } = useAuth();
  const { quizAccuracy, readingScore, writingScore, ageGroup, resetGame } =
    useGame();
  const navigate = useNavigate();
  const confettiFired = useRef(false);

  const overallScore = Math.round(
    (quizAccuracy + readingScore + writingScore) / 3,
  );

  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;
      // Fire confetti!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#5cb85c", "#fbbf24", "#f472b6", "#0ea5e9", "#a78bfa"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#5cb85c", "#fbbf24", "#f472b6", "#0ea5e9", "#a78bfa"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, []);

  const getMessage = () => {
    if (overallScore >= 90)
      return {
        text: "🌟 You're a Superstar!",
        color: "from-sun-400 to-candy-orange",
      };
    if (overallScore >= 70)
      return {
        text: "🎉 Great Job, Explorer!",
        color: "from-forest-500 to-sky-500",
      };
    return {
      text: "💪 Keep Practicing, You're Getting Better!",
      color: "from-candy-purple to-candy-pink",
    };
  };

  const msg = getMessage();

  const handlePlayAgain = () => {
    resetGame();
    navigate("/dashboard");
  };

  const handleLogout = () => {
    resetGame();
    logout();
    navigate("/");
  };

  const ScoreCard = ({ title, emoji, score, delay }) => (
    <div
      className="glass-card p-6 text-center animate-pop-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <h3
        className="text-lg text-forest-800 mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>

      {/* Progress bar */}
      <div className="w-full bg-forest-100 rounded-full h-4 mb-3 overflow-hidden border border-forest-200">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            background:
              score >= 80
                ? "linear-gradient(90deg, #5cb85c, #4a9a4a)"
                : score >= 50
                  ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                  : "linear-gradient(90deg, #f472b6, #ec4899)",
            transitionDelay: `${delay + 0.3}s`,
          }}
        />
      </div>

      <p
        className="text-2xl font-bold text-forest-800 mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {score}%
      </p>

      <StarRating percentage={score} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-y-auto">
      <NatureBackground />

      <div className="relative z-10 w-full max-w-3xl mx-auto py-12">
        {/* Trophy & Celebration */}
        <div className="text-center mb-6 animate-slide-up">
          <div className="text-7xl mb-4 animate-celebrate">🏆</div>
          <h1
            className="text-4xl md:text-5xl text-white drop-shadow-lg mb-2"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Amazing Work!
          </h1>
          <p className="text-xl text-white/90 font-bold drop-shadow">
            {user?.studentName || "Explorer"}, here are your results!
          </p>
        </div>

        {/* Overall message */}
        <div
          className={`bg-linear-to-r ${msg.color} text-white rounded-2xl px-8 py-4 mb-8 animate-pop-in text-center shadow-xl`}
        >
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {msg.text}
          </p>
          <p className="text-lg opacity-90 mt-1">
            Overall Score:{" "}
            <span className="text-3xl font-bold">{overallScore}%</span>
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
          <ScoreCard
            title="Q&A Quiz"
            emoji="📝"
            score={quizAccuracy}
            delay={0.2}
          />
          <ScoreCard
            title="Reading"
            emoji="🎤"
            score={readingScore}
            delay={0.4}
          />
          <ScoreCard
            title="Writing"
            emoji="✏️"
            score={writingScore}
            delay={0.6}
          />
        </div>

        {/* Age Group Badge */}
        <div
          className="glass-card px-6 py-3 mb-6 inline-block animate-pop-in"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="text-sm font-bold text-forest-700">
            Age Group:{" "}
            <span className="text-forest-900">{ageGroup || "N/A"}</span> | Date:{" "}
            <span className="text-forest-900">
              {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>

        {/* Mascot */}
        <div className="mb-6">
          <Mascot mood="cheering" message="I'm so proud of you! 🎊" size="lg" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePlayAgain}
            className="game-btn game-btn-primary text-lg"
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleLogout}
            className="game-btn game-btn-danger text-lg"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
