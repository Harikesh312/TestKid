import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { grade1Questions, grade2Questions } from "../data/quizData";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import ProgressBar from "../components/ProgressBar";

export default function QuizPage() {
  const { ageGroup: paramAge } = useParams();
  const { setAgeGroup, setQuizScore, setQuizTotal } = useGame();
  const navigate = useNavigate();

  const questions = paramAge === "5-8" ? grade1Questions : grade2Questions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [arrangedLetters, setArrangedLetters] = useState([]);
  const [arrangedWords, setArrangedWords] = useState([]);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [mascotMood, setMascotMood] = useState("thinking");
  const [mascotMsg, setMascotMsg] = useState("You can do it! 💪");

  const question = questions[currentIdx];

  useEffect(() => {
    setAgeGroup(paramAge);
  }, [paramAge, setAgeGroup]);

  const resetQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setInputValue("");
    setIsChecked(false);
    setIsCorrect(false);
    setArrangedLetters([]);
    setArrangedWords([]);
    setCurrentGroupIdx(0);
    setMascotMood("thinking");
    setMascotMsg("You can do it! 💪");
  }, []);

  const handleCheck = () => {
    if (isChecked) return;
    let correct = false;

    switch (question.type) {
      case "letter-match":
      case "tab-match":
        correct = selectedAnswer === question.answer;
        break;
      case "fill-blank":
        correct = inputValue.trim().toUpperCase() === question.answer.toUpperCase();
        break;
      case "image-match":
        correct = selectedAnswer === question.answer;
        break;
      case "counting":
        correct = selectedAnswer === question.answer;
        break;
      case "math":
      case "division":
      case "place-value":
      case "missing-number":
        correct = inputValue.trim() === question.answer;
        break;
      case "left-right":
        correct = selectedAnswer === question.answer;
        break;
      case "rhyme":
        correct = selectedAnswer === question.answer;
        break;
      case "arrange-letters": {
        const group = question.scrambledGroups[currentGroupIdx];
        correct = arrangedLetters.join("") === group.answer;
        if (correct && currentGroupIdx < question.scrambledGroups.length - 1) {
          // Move to next word group
          setCurrentGroupIdx((prev) => prev + 1);
          setArrangedLetters([]);
          setMascotMood("cheering");
          setMascotMsg("Great! Next word! 🎉");
          return;
        }
        break;
      }
      case "arrange-sentence":
        correct = arrangedWords.join(" ") === question.answer;
        break;
      case "shape-identify":
        correct = selectedAnswer === question.answer;
        break;
      default:
        correct = selectedAnswer === question.answer || inputValue.trim() === question.answer;
    }

    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      setMascotMood("cheering");
      setMascotMsg("🎉 Fantastic! You got it right!");
    } else {
      setMascotMood("happy");
      setMascotMsg("Almost! Keep trying! 💪");
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      resetQuestion();
    } else {
      // Quiz complete
      setQuizScore(score);
      setQuizTotal(questions.length);
      navigate(`/reading/${paramAge}`);
    }
  };

  const canCheck = () => {
    switch (question.type) {
      case "letter-match":
      case "tab-match":
      case "image-match":
      case "counting":
      case "left-right":
      case "rhyme":
      case "shape-identify":
        return selectedAnswer !== null;
      case "fill-blank":
      case "math":
      case "division":
      case "place-value":
      case "missing-number":
        return inputValue.trim().length > 0;
      case "arrange-letters":
        return arrangedLetters.length > 0;
      case "arrange-sentence":
        return arrangedWords.length > 0;
      default:
        return false;
    }
  };

  // Render question body based on type
  const renderQuestion = () => {
    switch (question.type) {
      case "letter-match":
      case "tab-match":
        return (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-6">
              <span
                className="inline-block text-6xl font-bold text-forest-800 bg-sun-300/50 rounded-2xl px-8 py-4 animate-pop-in"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {question.targetLetter || question.targetLetters}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isChecked && setSelectedAnswer(opt)}
                  className={`quiz-option text-xl ${
                    selectedAnswer === opt ? "selected" : ""
                  } ${
                    isChecked && opt === question.answer ? "correct" : ""
                  } ${
                    isChecked && selectedAnswer === opt && opt !== question.answer ? "incorrect" : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case "fill-blank":
        return (
          <div className="w-full flex flex-col items-center">
            <div className="mb-4">
              <button
                className="game-btn game-btn-warning text-sm mb-4"
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    const u = new SpeechSynthesisUtterance(question.audioWord);
                    u.rate = 0.7;
                    u.pitch = 1.2;
                    window.speechSynthesis.speak(u);
                  }
                }}
              >
                🔊 Play Sound
              </button>
            </div>
            <div
              className="text-6xl font-bold text-forest-800 mb-8 tracking-[0.2em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {question.displayWord}
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => !isChecked && setInputValue(e.target.value)}
              className={`nature-input text-center text-2xl max-w-48 mx-auto ${
                isChecked ? (isCorrect ? "!border-green-500" : "!border-red-400") : ""
              }`}
              placeholder={question.placeholder}
              maxLength={5}
            />
            {question.hint && (
              <p className="text-sm text-forest-600 mt-3 font-semibold">{question.hint}</p>
            )}
          </div>
        );

      case "arrange-letters": {
        const group = question.scrambledGroups[currentGroupIdx];
        const availableLetters = [...group.letters];
        arrangedLetters.forEach((l) => {
          const idx = availableLetters.indexOf(l);
          if (idx > -1) availableLetters.splice(idx, 1);
        });

        return (
          <div className="w-full flex flex-col items-center">
            {/* Image placeholder */}
            <div className="text-6xl mb-4">
              {question.displayImage === "duck" ? "🦆" : "🪷"}
            </div>
            {question.hint && (
              <p className="text-sm text-forest-600 mb-4 font-semibold">{question.hint}</p>
            )}
            {question.scrambledGroups.length > 1 && (
              <p className="text-sm text-candy-purple font-bold mb-2">
                Word {currentGroupIdx + 1} of {question.scrambledGroups.length}
              </p>
            )}

            {/* Arranged area */}
            <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center p-2 bg-white/50 rounded-xl border-2 border-dashed border-forest-300 flex-wrap">
              {arrangedLetters.length === 0 ? (
                <p className="text-forest-400 font-semibold text-sm">Tap letters below to build the word</p>
              ) : (
                arrangedLetters.map((l, i) => (
                  <button
                    key={`placed-${i}`}
                    className="letter-tile placed"
                    onClick={() => {
                      if (!isChecked) {
                        const newArr = [...arrangedLetters];
                        newArr.splice(i, 1);
                        setArrangedLetters(newArr);
                      }
                    }}
                  >
                    {l}
                  </button>
                ))
              )}
            </div>

            {/* Available letters */}
            <div className="flex justify-center gap-2 flex-wrap">
              {availableLetters.map((l, i) => (
                <button
                  key={`avail-${i}`}
                  className="letter-tile"
                  onClick={() => !isChecked && setArrangedLetters((prev) => [...prev, l])}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case "image-match":
        return (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-4">
              <span
                className="text-4xl font-bold text-forest-800"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {question.targetWord}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => !isChecked && setSelectedAnswer(opt.id)}
                  className={`p-4 rounded-2xl border-3 transition-all duration-300 ${
                    selectedAnswer === opt.id
                      ? "border-sky-400 bg-sky-50 scale-105 shadow-lg"
                      : "border-forest-200 bg-white hover:border-forest-400 hover:scale-102"
                  } ${
                    isChecked && opt.id === question.answer ? "!border-green-500 !bg-green-50" : ""
                  } ${
                    isChecked && selectedAnswer === opt.id && opt.id !== question.answer ? "!border-red-400 !bg-red-50 animate-shake" : ""
                  }`}
                >
                  <div className="text-6xl">{opt.emoji}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case "counting":
        return (
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-2 mb-6 p-4 bg-sky-100/50 rounded-2xl">
              {[...Array(question.count)].map((_, i) => (
                <span
                  key={i}
                  className="text-4xl animate-pop-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {question.emoji}
                </span>
              ))}
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              {question.options.map((num) => (
                <button
                  key={num}
                  onClick={() => !isChecked && setSelectedAnswer(num)}
                  className={`quiz-option text-2xl w-16 h-16 !p-0 flex items-center justify-center ${
                    selectedAnswer === num ? "selected" : ""
                  } ${
                    isChecked && num === question.answer ? "correct" : ""
                  } ${
                    isChecked && selectedAnswer === num && num !== question.answer ? "incorrect" : ""
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        );

      case "math":
      case "division":
        return (
          <div className="w-full flex flex-col items-center">
            <div
              className="text-5xl font-bold text-forest-800 mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {question.expression}
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => !isChecked && setInputValue(e.target.value.replace(/[^0-9.-]/g, ""))}
              className={`nature-input text-center text-3xl max-w-40 mx-auto ${
                isChecked ? (isCorrect ? "!border-green-500" : "!border-red-400") : ""
              }`}
              placeholder={question.placeholder}
            />
          </div>
        );

      case "missing-number":
        return (
          <div className="w-full flex flex-col items-center">
            <div className="flex justify-center items-center gap-4 mb-6">
              {question.sequence.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-2xl text-forest-400">,</span>}
                  {item === "___" ? (
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => !isChecked && setInputValue(e.target.value.replace(/[^0-9]/g, ""))}
                      className={`nature-input text-center text-3xl w-20 ${
                        isChecked ? (isCorrect ? "!border-green-500" : "!border-red-400") : ""
                      }`}
                      placeholder="?"
                    />
                  ) : (
                    <span
                      className="text-4xl font-bold text-forest-800"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case "left-right":
        return (
          <div className="flex justify-center gap-8">
            <button
              onClick={() => !isChecked && setSelectedAnswer("left")}
              className={`p-6 rounded-2xl border-3 transition-all duration-300 text-center ${
                selectedAnswer === "left"
                  ? "border-sky-400 bg-sky-50 scale-110 shadow-lg"
                  : "border-forest-200 bg-white hover:scale-105"
              } ${
                isChecked && "left" === question.answer ? "!border-green-500 !bg-green-50" : ""
              } ${
                isChecked && selectedAnswer === "left" && "left" !== question.answer ? "!border-red-400 animate-shake" : ""
              }`}
            >
              <div className="text-6xl mb-2">{question.leftEmoji}</div>
              <p className="font-bold text-forest-700">{question.leftLabel}</p>
              <p className="text-xs text-forest-500 mt-1"></p>
            </button>
            <button
              onClick={() => !isChecked && setSelectedAnswer("right")}
              className={`p-6 rounded-2xl border-3 transition-all duration-300 text-center ${
                selectedAnswer === "right"
                  ? "border-sky-400 bg-sky-50 scale-110 shadow-lg"
                  : "border-forest-200 bg-white hover:scale-105"
              } ${
                isChecked && "right" === question.answer ? "!border-green-500 !bg-green-50" : ""
              } ${
                isChecked && selectedAnswer === "right" && "right" !== question.answer ? "!border-red-400 animate-shake" : ""
              }`}
            >
              <div className="text-6xl mb-2">{question.rightEmoji}</div>
              <p className="font-bold text-forest-700">{question.rightLabel}</p>
              <p className="text-xs text-forest-500 mt-1"></p>
            </button>
          </div>
        );

      case "rhyme":
        return (
          <div className="w-full flex flex-col items-center text-center">
            <div className="text-center mb-6">
              <span
                className="inline-block text-5xl font-bold text-candy-purple bg-candy-purple/10 rounded-2xl px-8 py-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {question.targetWord}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isChecked && setSelectedAnswer(opt)}
                  className={`quiz-option text-lg ${
                    selectedAnswer === opt ? "selected" : ""
                  } ${
                    isChecked && opt === question.answer ? "correct" : ""
                  } ${
                    isChecked && selectedAnswer === opt && opt !== question.answer ? "incorrect" : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case "arrange-sentence": {
        const availableWords = [...question.words].filter(
          (w, i) => !arrangedWords.includes(w) || question.words.filter((x) => x === w).length > arrangedWords.filter((x) => x === w).length
        );
        // Simpler: track by index
        const usedIndices = new Set();
        const remaining = [];
        for (let i = 0; i < question.words.length; i++) {
          if (!usedIndices.has(i)) {
            let found = false;
            for (let j = 0; j < arrangedWords.length; j++) {
              if (arrangedWords[j] === question.words[i] && !usedIndices.has(i)) {
                usedIndices.add(i);
                found = true;
                break;
              }
            }
            if (!found) remaining.push({ word: question.words[i], idx: i });
          }
        }

        return (
          <div className="w-full flex flex-col items-center text-center">
            {question.hint && (
              <p className="text-sm text-forest-600 mb-4 font-semibold">{question.hint}</p>
            )}
            {/* Arranged area */}
            <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center p-3 bg-white/50 rounded-xl border-2 border-dashed border-forest-300 flex-wrap">
              {arrangedWords.length === 0 ? (
                <p className="text-forest-400 font-semibold text-sm">Tap words below to form a sentence</p>
              ) : (
                arrangedWords.map((w, i) => (
                  <button
                    key={`placed-w-${i}`}
                    className="letter-tile placed !w-auto !px-4 !text-base"
                    onClick={() => {
                      if (!isChecked) {
                        const newArr = [...arrangedWords];
                        newArr.splice(i, 1);
                        setArrangedWords(newArr);
                      }
                    }}
                  >
                    {w}
                  </button>
                ))
              )}
            </div>
            {/* Word tiles */}
            <div className="flex justify-center gap-3 flex-wrap">
              {question.words
                .filter((w, idx) => {
                  // Count how many times this index's word has been used
                  let usedCount = 0;
                  for (let i = 0; i < arrangedWords.length; i++) {
                    if (arrangedWords[i] === question.words[idx]) usedCount++;
                  }
                  let totalCount = 0;
                  for (let i = 0; i <= idx; i++) {
                    if (question.words[i] === question.words[idx]) totalCount++;
                  }
                  return usedCount < question.words.filter((x) => x === question.words[idx]).length;
                })
                .map((w, i) => (
                  <button
                    key={`word-${i}`}
                    className="letter-tile !w-auto !px-4 !text-base"
                    onClick={() => !isChecked && setArrangedWords((prev) => [...prev, w])}
                  >
                    {w}
                  </button>
                ))}
            </div>
          </div>
        );
      }

      case "place-value":
        return (
          <div className="w-full flex flex-col items-center text-center">
            <div className="text-5xl font-bold text-forest-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {question.number.split("").map((char, i) => (
                <span
                  key={i}
                  className={char === question.highlightDigit ? "text-candy-pink bg-candy-pink/20 rounded px-1" : ""}
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="text-forest-600 font-bold mb-4">
              What is the value of <span className="text-candy-pink text-2xl">{question.highlightDigit}</span>?
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => !isChecked && setInputValue(e.target.value.replace(/[^0-9]/g, ""))}
              className={`nature-input text-center text-3xl max-w-48 mx-auto ${
                isChecked ? (isCorrect ? "!border-green-500" : "!border-red-400") : ""
              }`}
              placeholder={question.placeholder}
            />
          </div>
        );

      case "shape-identify":
        return (
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex justify-center gap-6 mb-6 flex-wrap">
              {question.shapes.map((s) => (
                <div key={s.shape} className="text-center">
                  <div
                    className="w-24 h-28 flex items-center justify-center text-4xl bg-white/80 rounded-xl border-3 border-forest-300"
                    style={{
                      borderRadius: s.shape === "cylinder" ? "50% / 20%" : s.shape === "sphere" ? "50%" : "12px",
                    }}
                  >
                    {s.emoji}
                  </div>
                  <p className="text-xs text-forest-600 font-bold mt-1 capitalize">{s.shape}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => !isChecked && setSelectedAnswer(opt)}
                  className={`quiz-option text-sm ${
                    selectedAnswer === opt ? "selected" : ""
                  } ${
                    isChecked && opt === question.answer ? "correct" : ""
                  } ${
                    isChecked && selectedAnswer === opt && opt !== question.answer ? "incorrect" : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Unknown question type</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NatureBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white drop-shadow" style={{ fontFamily: "var(--font-display)" }}>
              📝 Phase 1: Quiz Time!
            </span>
            <span className="text-sm font-bold text-white/80">
              Ages {paramAge}
            </span>
          </div>
          <ProgressBar current={currentIdx + 1} total={questions.length} label="Progress" />
        </div>

        {/* Question Card */}
        <div className="glass-card p-8 md:p-10 animate-slide-up flex flex-col items-center" key={`q-${currentIdx}`}>
          {/* Question number & Prompt */}
          <div className="flex flex-col items-center text-center gap-4 mb-8 w-full">
            <span className="bg-forest-500 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-2xl shadow-lg animate-bounce-gentle shrink-0" style={{ fontFamily: "var(--font-display)" }}>
              {currentIdx + 1}
            </span>
            <h2 className="text-2xl md:text-3xl text-forest-800 font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {question.prompt}
            </h2>
          </div>

          {/* Question body */}
          <div className="mb-8 px-2 md:px-4 w-full flex flex-col items-center">{renderQuestion()}</div>

          {/* Feedback */}
          {isChecked && (
            <div
              className={`p-6 rounded-2xl mb-6 text-center font-bold animate-pop-in shadow-sm ${
                isCorrect
                  ? "bg-green-50 border-2 border-green-300 text-green-700"
                  : "bg-red-50 border-2 border-red-200 text-red-600"
              }`}
            >
              <div className="text-lg">
                {isCorrect ? "✅ Correct! Amazing! 🎉" : "❌ Not quite right"}
              </div>
              {!isCorrect && (
                <p className="mt-2 text-forest-600 font-semibold">
                  The answer was: <span className="text-forest-800 underline decoration-wavy decoration-red-300">{question.answer}</span>
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-forest-100 w-full">
            {!isChecked ? (
              <button
                onClick={handleCheck}
                disabled={!canCheck()}
                className={`game-btn game-btn-primary ${!canCheck() ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                ✅ Check Answer
              </button>
            ) : (
              <button onClick={handleNext} className="game-btn game-btn-secondary">
                {currentIdx < questions.length - 1 ? "➡️ Next Question" : "🎤 Go to Reading Test!"}
              </button>
            )}
          </div>
        </div>

        {/* Mascot */}
        <div className="flex justify-center mt-4">
          <Mascot mood={mascotMood} message={mascotMsg} size="sm" />
        </div>
      </div>
    </div>
  );
}
