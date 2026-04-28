import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { grade1Questions, grade2Questions } from "../data/quizData";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import ProgressBar from "../components/ProgressBar";

export default function QuizPage() {
  const { ageGroup: paramAge } = useParams();
  const { setAgeGroup, setQuizScore, setQuizTotal, quizDetails, setQuizDetails } = useGame();
  const navigate = useNavigate();

  const questions = paramAge === "5-8" ? grade1Questions : grade2Questions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [inputValue, setInputValue] = useState("");
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
    setArrangedLetters([]);
    setArrangedWords([]);
    setCurrentGroupIdx(0);
    setMascotMood("thinking");
    setMascotMsg("You can do it! 💪");
  }, []);

  const handleNext = () => {
    let correct = false;
    let userAnswerText = "";

    switch (question.type) {
      case "mcq":
        correct = selectedAnswer === question.answer;
        userAnswerText = selectedAnswer || "";
        break;
      case "letter-match":
      case "tab-match":
        correct = selectedAnswer === question.answer;
        userAnswerText = selectedAnswer || "";
        break;
      case "fill-blank":
        correct = inputValue.trim().toUpperCase() === question.answer.toUpperCase();
        userAnswerText = inputValue.trim();
        break;
      case "image-match":
        correct = selectedAnswer === question.answer;
        userAnswerText = question.options.find(o => o.id === selectedAnswer)?.emoji || selectedAnswer || "";
        break;
      case "counting":
        correct = selectedAnswer === question.answer;
        userAnswerText = String(selectedAnswer || "");
        break;
      case "math":
      case "division":
      case "place-value":
      case "missing-number":
        correct = inputValue.trim() === question.answer;
        userAnswerText = inputValue.trim();
        break;
      case "left-right":
      case "rhyme":
      case "shape-identify":
        correct = selectedAnswer === question.answer;
        userAnswerText = selectedAnswer || "";
        break;
      case "arrange-letters": {
        const group = question.scrambledGroups[currentGroupIdx];
        correct = arrangedLetters.join("") === group.answer;
        userAnswerText = arrangedLetters.join("");
        if (correct && currentGroupIdx < question.scrambledGroups.length - 1) {
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
        userAnswerText = arrangedWords.join(" ");
        break;
      default:
        correct = selectedAnswer === question.answer || inputValue.trim() === question.answer;
        userAnswerText = String(selectedAnswer || inputValue.trim());
    }

    if (correct) {
      setScore((s) => s + 1);
    }

    let answerContext = question.answer;
    if (question.type === "image-match") {
      answerContext = question.options.find(o => o.id === question.answer)?.emoji || question.answer;
    } else if (question.type === "arrange-letters") {
      answerContext = question.scrambledGroups.map(g => g.answer).join("");
    }

    setQuizDetails((prev) => [
      ...prev,
      {
        prompt: question.prompt,
        userAnswer: userAnswerText,
        correctAnswer: answerContext,
        isCorrect: correct,
      },
    ]);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      resetQuestion();
    } else {
      setQuizScore(score + (correct ? 1 : 0));
      setQuizTotal(questions.length);
      navigate(`/reading/${paramAge}`);
    }
  };

  const playSound = async (word) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (res.ok) {
        const data = await res.json();
        let audioUrl = "";
        for (const entry of data) {
          for (const phonetic of entry.phonetics) {
            if (phonetic.audio) {
              audioUrl = phonetic.audio;
              if (audioUrl.includes("-us.mp3")) break;
            }
          }
          if (audioUrl) break;
        }
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Audio API failed, falling back to TTS", e);
    }

    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(word.toLowerCase());
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes("female") || 
        v.name.toLowerCase().includes("zira") || 
        v.name.toLowerCase().includes("samantha") || 
        v.name.toLowerCase().includes("victoria")
      );
      if (femaleVoice) u.voice = femaleVoice;
      u.rate = 0.85;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }
  };

  const canCheck = () => {
    switch (question.type) {
      case "mcq":
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

  const renderQuestion = () => {
    switch (question.type) {
      case "mcq":
        return (
          <div className="w-full flex flex-col items-center">
            {question.displayEmoji && (
              <div className="text-center mb-6">
                <span className="inline-block text-7xl animate-pop-in">
                  {question.displayEmoji}
                </span>
              </div>
            )}
            {question.displayText && (
              <div className="text-center mb-6">
                <span
                  className="inline-block text-5xl font-bold text-forest-800 bg-sun-300/50 rounded-2xl px-8 py-4 animate-pop-in"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {question.displayText}
                </span>
              </div>
            )}
            {question.displaySentence && (
              <div className="text-center mb-6">
                <span
                  className="inline-block text-xl md:text-2xl font-semibold text-candy-purple bg-candy-purple/10 rounded-2xl px-6 py-3 italic animate-pop-in"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  "{question.displaySentence}"
                </span>
              </div>
            )}
            <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
              {question.options.map((opt, idx) => (
                <button
                  key={opt}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`quiz-option text-lg text-left px-6 py-4 flex items-center gap-3 ${
                    selectedAnswer === opt ? "selected" : ""
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest-100 text-forest-700 font-bold text-sm shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        );

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
                  onClick={() => setSelectedAnswer(opt)}
                  className={`quiz-option text-xl ${
                    selectedAnswer === opt ? "selected" : ""
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
                onClick={() => playSound(question.audioWord)}
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
              onChange={(e) => setInputValue(e.target.value)}
              className="nature-input text-center text-2xl max-w-48 mx-auto"
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

            <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center p-2 bg-white/50 rounded-xl border-2 border-dashed border-forest-300 flex-wrap">
              {arrangedLetters.length === 0 ? (
                <p className="text-forest-400 font-semibold text-sm">Tap letters below to build the word</p>
              ) : (
                arrangedLetters.map((l, i) => (
                  <button
                    key={`placed-${i}`}
                    className="letter-tile placed"
                    onClick={() => {
                        const newArr = [...arrangedLetters];
                        newArr.splice(i, 1);
                        setArrangedLetters(newArr);
                    }}
                  >
                    {l}
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              {availableLetters.map((l, i) => (
                <button
                  key={`avail-${i}`}
                  className="letter-tile"
                  onClick={() => setArrangedLetters((prev) => [...prev, l])}
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
                  onClick={() => setSelectedAnswer(opt.id)}
                  className={`p-4 rounded-2xl border-3 transition-all duration-300 ${
                    selectedAnswer === opt.id
                      ? "border-sky-400 bg-sky-50 scale-105 shadow-lg"
                      : "border-forest-200 bg-white hover:border-forest-400 hover:scale-102"
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
                  onClick={() => setSelectedAnswer(num)}
                  className={`quiz-option text-2xl w-16 h-16 !p-0 flex items-center justify-center ${
                    selectedAnswer === num ? "selected" : ""
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
              onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.-]/g, ""))}
              className="nature-input text-center text-3xl max-w-40 mx-auto"
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
                      onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ""))}
                      className="nature-input text-center text-3xl w-20"
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
              onClick={() => setSelectedAnswer("left")}
              className={`p-6 rounded-2xl border-3 transition-all duration-300 text-center ${
                selectedAnswer === "left"
                  ? "border-sky-400 bg-sky-50 scale-110 shadow-lg"
                  : "border-forest-200 bg-white hover:scale-105"
              }`}
            >
              <div className="text-6xl mb-2">{question.leftEmoji}</div>
              <p className="font-bold text-forest-700">{question.leftLabel}</p>
              <p className="text-xs text-forest-500 mt-1"></p>
            </button>
            <button
              onClick={() => setSelectedAnswer("right")}
              className={`p-6 rounded-2xl border-3 transition-all duration-300 text-center ${
                selectedAnswer === "right"
                  ? "border-sky-400 bg-sky-50 scale-110 shadow-lg"
                  : "border-forest-200 bg-white hover:scale-105"
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
                  onClick={() => setSelectedAnswer(opt)}
                  className={`quiz-option text-lg ${
                    selectedAnswer === opt ? "selected" : ""
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
            <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center p-3 bg-white/50 rounded-xl border-2 border-dashed border-forest-300 flex-wrap">
              {arrangedWords.length === 0 ? (
                <p className="text-forest-400 font-semibold text-sm">Tap words below to form a sentence</p>
              ) : (
                arrangedWords.map((w, i) => (
                  <button
                    key={`placed-w-${i}`}
                    className="letter-tile placed !w-auto !px-4 !text-base"
                    onClick={() => {
                        const newArr = [...arrangedWords];
                        newArr.splice(i, 1);
                        setArrangedWords(newArr);
                    }}
                  >
                    {w}
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              {question.words
                .filter((w, idx) => {
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
                    onClick={() => setArrangedWords((prev) => [...prev, w])}
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
              onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ""))}
              className="nature-input text-center text-3xl max-w-48 mx-auto"
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
                  onClick={() => setSelectedAnswer(opt)}
                  className={`quiz-option text-sm ${
                    selectedAnswer === opt ? "selected" : ""
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
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative">
      <NatureBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
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

        <div className="glass-card p-8 md:p-10 animate-slide-up flex flex-col items-center" key={`q-${currentIdx}`}>
          <div className="flex flex-col items-center text-center gap-4 mb-8 w-full">
            <span className="bg-forest-500 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-2xl shadow-lg animate-bounce-gentle shrink-0" style={{ fontFamily: "var(--font-display)" }}>
              {currentIdx + 1}
            </span>
            <h2 className="text-2xl md:text-3xl text-forest-800 font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {question.prompt}
            </h2>
          </div>

          <div className="mb-8 px-2 md:px-4 w-full flex flex-col items-center">{renderQuestion()}</div>

          <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-forest-100 w-full">
              <button
                onClick={handleNext}
                disabled={!canCheck()}
                className={`game-btn game-btn-primary ${!canCheck() ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {currentIdx < questions.length - 1 ? "➡️ Next Question" : "🎤 Submit & Go to Reading Test!"}
              </button>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Mascot mood={mascotMood} message={mascotMsg} size="sm" />
        </div>
      </div>
    </div>
  );
}
