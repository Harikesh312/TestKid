import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

export default function ReadingPage() {
  const { ageGroup: paramAge } = useParams();
  const { setReadingScore } = useGame();
  const navigate = useNavigate();

  const sentences = {
    "5-8": "The cat sat on the mat.",
    "8-12": "The quick brown fox jumps over the lazy dog.",
  };

  const targetSentence = sentences[paramAge] || sentences["5-8"];

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [accuracy, setAccuracy] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [mascotMood, setMascotMood] = useState("happy");
  const [mascotMsg, setMascotMsg] = useState("Read the sentence out loud! 📖");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const calculateAccuracy = (spoken, target) => {
    const spokenWords = spoken
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const targetWords = target
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    if (targetWords.length === 0) return 0;

    let matchCount = 0;
    for (let i = 0; i < targetWords.length; i++) {
      if (spokenWords[i] === targetWords[i]) {
        matchCount++;
      }
    }

    return Math.round((matchCount / targetWords.length) * 100);
  };

  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setMascotMsg("Oops! Try again 🔄");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript("");
    setAccuracy(null);
    setMascotMood("thinking");
    setMascotMsg("I'm listening... 👂");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    // Calculate accuracy after a small delay for final transcript
    setTimeout(() => {
      setTranscript((currentTranscript) => {
        const acc = calculateAccuracy(currentTranscript, targetSentence);
        setAccuracy(acc);
        setReadingScore(acc);

        if (acc >= 80) {
          setMascotMood("cheering");
          setMascotMsg("Amazing reading! 🌟");
        } else if (acc >= 50) {
          setMascotMood("happy");
          setMascotMsg("Good try! Keep practicing! 💪");
        } else {
          setMascotMood("happy");
          setMascotMsg("Don't worry, you're learning! 🌈");
        }
        return currentTranscript;
      });
    }, 500);
  };

  const handleSimulate = () => {
    // Fallback for browsers without Speech API
    const simulated = Math.floor(Math.random() * 30) + 65; // 65-95%
    setTranscript(
      targetSentence.substring(
        0,
        Math.floor((targetSentence.length * simulated) / 100),
      ),
    );
    setAccuracy(simulated);
    setReadingScore(simulated);
    setMascotMood("cheering");
    setMascotMsg("Great reading! 🎉");
  };

  const handleNext = () => {
    navigate(`/writing/${paramAge}`);
  };

  return (
    <div className="min-h-screen relative">
      <NatureBackground />

      <div className="relative z-10 p-4 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <div className="text-center mb-6 animate-slide-up">
          <span
            className="text-sm font-bold text-white drop-shadow inline-block mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🎤 Phase 2: Reading Test
          </span>
          <h1
            className="text-3xl text-white drop-shadow-lg"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Read Out Loud!
          </h1>
        </div>

        {/* Billboard Card */}
        <div className="glass-card p-8 w-full mb-6 animate-pop-in">
          {/* Chalkboard / Billboard */}
          <div
            className="bg-linear-to-br from-amber-100 to-amber-50 rounded-2xl p-8 border-4 border-amber-400 shadow-inner mb-6 text-center"
            style={{
              boxShadow:
                "inset 0 4px 20px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.1)",
            }}
          >
            <p
              className="text-2xl md:text-3xl text-amber-900 font-bold leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{targetSentence}&rdquo;
            </p>
          </div>

          {/* Microphone button */}
          <div className="flex flex-col items-center gap-4">
            {isSupported ? (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
                  isRecording
                    ? "bg-red-500 text-white animate-mic-pulse shadow-lg shadow-red-300"
                    : "bg-linear-to-br from-forest-500 to-forest-700 text-white hover:scale-110 shadow-lg"
                }`}
                disabled={accuracy !== null}
              >
                {isRecording ? "⏹️" : "🎙️"}
              </button>
            ) : (
              <button
                onClick={handleSimulate}
                className="game-btn game-btn-primary text-lg"
                disabled={accuracy !== null}
              >
                🎙️ Simulate Reading
              </button>
            )}

            <p className="text-sm font-bold text-forest-700">
              {isRecording
                ? "🔴 Listening... Click to stop"
                : accuracy !== null
                  ? "Recording complete!"
                  : "Tap the microphone to start reading"}
            </p>

            {/* Waveform animation */}
            {isRecording && (
              <div className="flex items-end gap-1 h-8">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-forest-500 rounded-full"
                    style={{
                      animation: `bounce-gentle ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.05}s`,
                      height: `${10 + Math.random() * 20}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mt-6 p-4 bg-white/80 rounded-xl border-2 border-forest-200 animate-pop-in">
              <p className="text-sm font-bold text-forest-600 mb-1">
                What I heard:
              </p>
              <p className="text-lg text-forest-800 font-semibold">
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          )}

          {/* Accuracy */}
          {accuracy !== null && (
            <div className="mt-4 text-center animate-pop-in">
              <div className="inline-block bg-linear-to-r from-forest-500 to-sky-500 text-white rounded-2xl px-8 py-4">
                <p className="text-sm font-bold opacity-80">Reading Accuracy</p>
                <p
                  className="text-4xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {accuracy}%
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleNext}
                  className="game-btn game-btn-secondary text-lg"
                >
                  ✏️ Go to Writing Test!
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mascot */}
        <div className="animate-slide-up">
          <Mascot mood={mascotMood} message={mascotMsg} size="md" />
        </div>
      </div>
    </div>
  );
}
