import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { setAgeGroup, resetGame } = useGame();
  const navigate = useNavigate();

  const handleSelectAge = (group) => {
    resetGame();
    setAgeGroup(group);
    navigate(`/quiz/${group}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-16">
      <NatureBackground />


      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pb-12" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Welcome */}
        <div className="text-center mb-8 animate-slide-up">
          <Mascot mood="cheering" message={`Welcome, ${user?.studentName || "Explorer"}! 🌟`} size="lg" />
          <h1 className="text-4xl md:text-5xl text-white mt-4 drop-shadow-lg" style={{ fontFamily: "var(--font-display)", textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }}>
            Choose Your Adventure!
          </h1>
          <p className="text-xl text-white/90 font-bold mt-2 drop-shadow" style={{ fontFamily: "var(--font-body)" }}>
            Pick your age group to start the fun! 🎮
          </p>
        </div>

        {/* Age Group Cards */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-4xl justify-center items-center">
          {/* Ages 5-8 */}
          <button
            id="age-5-8"
            onClick={() => handleSelectAge("5-8")}
            className="group w-full md:w-80 cursor-pointer transition-all duration-500 hover:scale-105 focus:outline-none"
          >
            <div className="relative glass-card p-8 text-center overflow-hidden border-4 border-forest-300 hover:border-sun-400 transition-all duration-500 group-hover:shadow-2xl">
              {/* Floating island decoration */}
              <div className="absolute -top-2 -right-2 text-4xl animate-float" style={{ animationDelay: "-1s" }}>
                🦋
              </div>
              <div className="absolute -bottom-1 -left-1 text-3xl animate-float" style={{ animationDelay: "-3s" }}>
                🌸
              </div>

              {/* Island emoji scene */}
              <div className="text-7xl mb-4 group-hover:animate-celebrate">
                🏝️
              </div>

              <h2 className="text-2xl text-forest-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Little Explorers
              </h2>
              <p className="text-4xl font-bold text-forest-600 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Ages 5-8
              </p>
              <p className="text-forest-600 font-semibold">
                Grade 1 • Letters, Numbers & Fun! 🎨
              </p>

              {/* Hover prompt */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="game-btn game-btn-primary text-sm px-6 py-2">
                  Let&apos;s Go! 🚀
                </span>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center gap-2 text-white">
            <div className="w-1 h-8 bg-white/30 rounded" />
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>OR</span>
            <div className="w-1 h-8 bg-white/30 rounded" />
          </div>

          {/* Ages 8-12 */}
          <button
            id="age-8-12"
            onClick={() => handleSelectAge("8-12")}
            className="group w-full md:w-80 cursor-pointer transition-all duration-500 hover:scale-105 focus:outline-none"
          >
            <div className="relative glass-card p-8 text-center overflow-hidden border-4 border-forest-300 hover:border-candy-purple transition-all duration-500 group-hover:shadow-2xl">
              {/* Decorations */}
              <div className="absolute -top-2 -right-2 text-4xl animate-float" style={{ animationDelay: "-2s" }}>
                ⭐
              </div>
              <div className="absolute -bottom-1 -left-1 text-3xl animate-float" style={{ animationDelay: "-4s" }}>
                🔮
              </div>

              {/* Castle scene */}
              <div className="text-7xl mb-4 group-hover:animate-celebrate">
                🏰
              </div>

              <h2 className="text-2xl text-forest-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Super Learners
              </h2>
              <p className="text-4xl font-bold text-candy-purple mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Ages 8-12
              </p>
              <p className="text-forest-600 font-semibold">
                Grade 2 • Words, Math & More! 🧮
              </p>

              {/* Hover prompt */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="game-btn game-btn-secondary text-sm px-6 py-2">
                  Let&apos;s Go! 🚀
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
