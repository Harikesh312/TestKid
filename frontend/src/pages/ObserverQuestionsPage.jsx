import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

const QUESTIONS = [
  "Child struggles to recognize words.",
  "Child confuses similar letters (b/d).",
  "Child avoids reading activities.",
  "Child's handwriting is unclear.",
  "Child struggles to form sentences.",
  "Child avoids writing tasks.",
  "Child struggles with numbers.",
  "Child forgets basic math facts.",
  "Child finds word problems difficult.",
  "Child forgets instructions easily.",
];

export default function ObserverQuestionsPage() {
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { saveObserverQuestions } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answers.some((ans) => ans === null)) {
      setError("Please answer all questions before continuing! 🌟");
      return;
    }

    setIsLoading(true);
    try {
      await saveObserverQuestions(answers);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to save answers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-16">
      <NatureBackground />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 pb-12 animate-slide-up w-full" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-6">
            <Mascot mood="curious" message="Let's learn a bit more about how you learn! 🦉" size="md" />
            <h1 className="text-3xl md:text-4xl text-white mt-4 drop-shadow-lg" style={{ fontFamily: "var(--font-display)", textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }}>
              Observer Questions
            </h1>
            <p className="text-lg text-white/90 font-bold mt-2 drop-shadow" style={{ fontFamily: "var(--font-body)" }}>
              Please rate the following out of: 0 (Never), 1 (Sometimes), 2 (Often)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4 text-center animate-shake w-full max-w-3xl">
              <p className="text-red-600 font-bold text-sm">🚫 {error}</p>
            </div>
          )}

          {/* Form */}
          <div className="glass-card p-6 md:p-8 w-full max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {QUESTIONS.map((question, index) => (
              <div key={index} className="bg-white/50 rounded-xl p-4 border border-forest-200">
                <p className="font-bold text-forest-800 mb-3 text-lg text-center">
                  {index + 1}. {question}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { value: 0, label: "0 - Never" },
                    { value: 1, label: "1 - Sometimes" },
                    { value: 2, label: "2 - Often" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex-1 min-w-[120px] cursor-pointer text-center p-3 rounded-xl border-2 transition-all ${
                        answers[index] === option.value
                          ? "border-sky-500 bg-sky-100 shadow-inner"
                          : "border-forest-200 bg-white hover:border-sky-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${index}`}
                        value={option.value}
                        checked={answers[index] === option.value}
                        onChange={() => handleSelect(index, option.value)}
                        className="hidden"
                      />
                      <span
                        className={`font-bold ${
                          answers[index] === option.value ? "text-sky-700" : "text-forest-600"
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="game-btn game-btn-primary w-full text-xl mt-8 py-4"
            >
              {isLoading ? (
                <span className="animate-wiggle inline-block">🦉 Saving...</span>
              ) : (
                "Continue to Adventure! 🚀"
              )}
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
