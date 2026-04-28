import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { calculateAccuracy } from "../utils/accuracyUtils";
import { API_BASE_URL } from "../apiConfig";
import { grade1Reading, grade2Reading } from "../data/readingData";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import ProgressBar from "../components/ProgressBar";

const API_BASE = API_BASE_URL;

export default function ReadingPage() {
  const { ageGroup: paramAge } = useParams();
  const {
    setReadingScore,
    setReadingDetails,
    readingFollowUpDetails,
    setReadingFollowUpDetails,
  } = useGame();
  const navigate = useNavigate();

  // Pick the right data for the age group
  const readingData = paramAge === "5-8" ? grade1Reading : grade2Reading;
  const targetSentence = readingData.passage;
  const followUpQuestions = readingData.followUpQuestions;

  /* ---- phase: "reading" | "followup" ---- */
  const [phase, setPhase] = useState("reading");
  const [followUpIdx, setFollowUpIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  /* ---- recording state ---- */
  const [isRecording, setIsRecording] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState("");
  const [mascotMood, setMascotMood] = useState("happy");
  const [mascotMsg, setMascotMsg] = useState("Read the passage out loud! 📖");
  const [micPermission, setMicPermission] = useState("prompt");

  // Refs
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const stopCalledRef = useRef(false);

  /* ---- check mic permission on mount ---- */
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "microphone" })
      .then((result) => {
        setMicPermission(result.state);
        result.onchange = () => setMicPermission(result.state);
      })
      .catch(() => {});
  }, []);

  /* ---- the actual stop logic ---- */
  const doStop = useCallback(() => {
    if (stopCalledRef.current) return;
    stopCalledRef.current = true;

    setIsRecording(false);
    setHasStopped(true);
    setMascotMood("thinking");
    setMascotMsg("Click Next to see some questions! 🧠");

    // Stop Web Speech API
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    // Process in background
    (async () => {
      // Wait for MediaRecorder to finish
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        await new Promise((resolve) => {
          mediaRecorderRef.current.onstop = () => resolve();
          mediaRecorderRef.current.stop();
        });
      }

      // Stop mic tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      try {
        const res = await fetch(`${API_BASE}/api/transcribe`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Transcription failed");
        }

        const data = await res.json();
        const transcriptText = data.text || "";
        setFinalTranscript(transcriptText);

        if (!transcriptText.trim()) {
          setAccuracy(0);
          setReadingDetails({
            targetSentence,
            finalTranscript: "No words detected",
            accuracy: 0,
          });
        } else {
          const acc = calculateAccuracy(transcriptText, targetSentence);
          setAccuracy(acc);
          setReadingDetails({
            targetSentence,
            finalTranscript: transcriptText,
            accuracy: acc,
          });
        }
      } catch (err) {
        console.error("Transcription error:", err);
        setAccuracy(0);
        setReadingDetails({
          targetSentence,
          finalTranscript: "Failed to process audio",
          accuracy: 0,
        });
      }
    })();
  }, [targetSentence, setReadingDetails]);

  /* ---- start recording ---- */
  const startRecording = useCallback(async () => {
    setError("");
    stopCalledRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      streamRef.current = stream;

      // MediaRecorder for AssemblyAI
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      // Web Speech API for live text
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          let interim = "";
          let final = "";
          for (let i = 0; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += text + " ";
            } else {
              interim += text;
            }
          }
          const combined = (final + interim).trim();
          if (combined) {
            setLiveText(combined);
          }
        };

        recognition.onerror = (e) => {
          console.warn("SpeechRecognition error:", e.error);
        };

        recognition.onend = () => {
          if (!stopCalledRef.current) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);
      setHasStopped(false);
      setLiveText("");
      setFinalTranscript("");
      setAccuracy(null);
      setMascotMood("thinking");
      setMascotMsg("I'm listening… 👂");
    } catch (err) {
      console.error("Mic error:", err);
      setMicPermission("denied");
      setError(
        "Microphone access was denied. Please allow microphone permission in your browser settings."
      );
      setMascotMood("happy");
      setMascotMsg("I need your microphone! 🎙️");
    }
  }, [doStop]);

  /* ---- manual stop ---- */
  const stopRecording = useCallback(() => {
    doStop();
  }, [doStop]);

  /* ---- retry ---- */
  const handleRetry = () => {
    setLiveText("");
    setFinalTranscript("");
    setAccuracy(null);
    setError("");
    setHasStopped(false);
    setMascotMood("happy");
    setMascotMsg("Read the passage out loud! 📖");
    stopCalledRef.current = false;
  };



  const handleFollowUpNext = () => {
    const q = followUpQuestions[followUpIdx];
    const isCorrect = selectedAnswer === q.answer;

    const newDetails = [
      ...readingFollowUpDetails,
      {
        prompt: q.prompt,
        userAnswer: selectedAnswer,
        correctAnswer: q.answer,
        isCorrect,
      },
    ];
    setReadingFollowUpDetails(newDetails);

    if (followUpIdx < followUpQuestions.length - 1) {
      setFollowUpIdx((i) => i + 1);
      setSelectedAnswer(null);
      setMascotMood("thinking");
      setMascotMsg("Next question! 💪");
    } else {
      // Calculate score based on follow-up questions
      const correctCount = newDetails.filter((d) => d.isCorrect).length;
      const finalScore = Math.round((correctCount / followUpQuestions.length) * 100);
      setReadingScore(finalScore);

      // All follow-up done, go to writing
      setMascotMood("cheering");
      setMascotMsg("Awesome! On to the writing test! ✨");
      navigate(`/writing/${paramAge}`);
    }
  };

  /* ---- cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ============ FOLLOW-UP PHASE ============ */
  if (phase === "followup") {
    const currentQ = followUpQuestions[followUpIdx];
    return (
      <div className="min-h-screen w-full flex flex-col pt-16 pb-8 overflow-y-scroll overflow-x-hidden relative">
        <NatureBackground />
        <div className="flex-1 flex flex-col justify-center items-center w-full p-4">
          <div className="relative z-10 w-full max-w-3xl py-8">
          <div className="text-center mb-6 animate-slide-up">
            <span
              className="text-sm font-bold text-white drop-shadow inline-block mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              🎤 Phase 2: Reading — Follow-Up Questions
            </span>
          </div>

          <div className="mb-6">
            <ProgressBar
              current={followUpIdx + 1}
              total={followUpQuestions.length}
              label="Follow-Up Progress"
            />
          </div>

          {/* Show the passage for reference */}
          <div className="glass-card p-4 mb-4 animate-pop-in">
            <p className="text-xs font-bold text-forest-600 uppercase tracking-wider mb-1">
              📖 Passage (for reference):
            </p>
            <p
              className="text-sm text-forest-800 italic leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{targetSentence}&rdquo;
            </p>
          </div>

          <div
            className="glass-card p-8 md:p-10 animate-slide-up flex flex-col items-center"
            key={`fq-${followUpIdx}`}
          >
            <div className="flex flex-col items-center text-center gap-4 mb-8 w-full">
              <span
                className="bg-forest-500 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-2xl shadow-lg animate-bounce-gentle shrink-0"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {followUpIdx + 1}
              </span>
              <h2
                className="text-2xl md:text-3xl text-forest-800 font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {currentQ.prompt}
              </h2>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-md mx-auto mb-8">
              {currentQ.options.map((opt, idx) => (
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

            <div className="flex justify-center gap-4 pt-6 border-t border-forest-100 w-full">
              <button
                onClick={handleFollowUpNext}
                disabled={selectedAnswer === null}
                className={`game-btn game-btn-primary ${
                  selectedAnswer === null ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {followUpIdx < followUpQuestions.length - 1
                  ? "➡️ Next Question"
                  : "✏️ Go to Writing Test!"}
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Mascot mood={mascotMood} message={mascotMsg} size="sm" />
          </div>
        </div>
        </div>
      </div>
    );
  }

  /* ============ READING PHASE ============ */
  return (
    <div className="min-h-screen w-full flex flex-col pt-16 pb-8 overflow-y-scroll overflow-x-hidden relative">
      <NatureBackground />
      <div className="flex-1 flex flex-col justify-center items-center w-full p-4">
        <div className="relative z-10 w-full max-w-4xl py-8">
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
          {/* Passage billboard */}
          <div
            className="bg-linear-to-br from-amber-100 to-amber-50 rounded-2xl p-8 border-4 border-amber-400 shadow-inner mb-6 text-center"
            style={{
              boxShadow:
                "inset 0 4px 20px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.1)",
            }}
          >
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-3">
              📖 Read this passage:
            </p>
            <p
              className="text-2xl md:text-3xl text-amber-900 font-bold leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{targetSentence}&rdquo;
            </p>
          </div>

          {/* ===== LIVE TRANSCRIPT BOX ===== */}
          {(isRecording || liveText) && !finalTranscript && !isProcessing && (
            <div className="mb-6 p-5 bg-white/90 rounded-xl border-2 border-sky-300 animate-pop-in min-h-[70px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-3 w-3">
                  {isRecording && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </>
                  )}
                </span>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Live — What I hear you saying:
                </p>
              </div>
              <p className="text-xl text-forest-800 font-semibold min-h-[32px] leading-relaxed">
                {liveText || (
                  <span className="text-gray-400 italic text-base">
                    Start speaking…
                  </span>
                )}
              </p>
            </div>
          )}



          {/* Microphone area */}
          {!isProcessing && (
            <div className="flex flex-col items-center gap-4">
              {/* Error banner */}
              {error && (
                <div className="w-full bg-red-100 border-2 border-red-300 rounded-xl p-3 text-center animate-pop-in">
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Record / Stop button or Next Button */}
              {hasStopped ? (
                <div className="flex flex-col sm:flex-row gap-4 mt-2 animate-pop-in">
                  <button
                    onClick={handleRetry}
                    className="game-btn game-btn-secondary text-lg px-6 py-3"
                  >
                    🔄 Read Again
                  </button>
                  <button
                    onClick={() => {
                      setPhase("followup");
                      setFollowUpIdx(0);
                      setSelectedAnswer(null);
                    }}
                    className="game-btn game-btn-primary text-xl px-8 py-3"
                  >
                    ➡️ Next
                  </button>
                </div>
              ) : (
                <button
                  id="reading-record-btn"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={accuracy !== null}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
                    isRecording
                      ? "bg-red-500 text-white animate-mic-pulse shadow-lg shadow-red-300"
                      : "bg-linear-to-br from-forest-500 to-forest-700 text-white hover:scale-110 shadow-lg"
                  }`}
                >
                  {isRecording ? "⏹️" : "🎙️"}
                </button>
              )}

              <p className="text-sm font-bold text-forest-700">
                {hasStopped
                  ? "Great job! Click Next to continue."
                  : isRecording
                  ? "🔴 Listening… Click to stop or stay silent to auto-stop"
                  : micPermission === "denied"
                  ? "⚠️ Microphone blocked – check browser settings"
                  : "Tap the microphone to start reading"}
              </p>

              {/* Waveform animation */}
              {isRecording && !hasStopped && (
                <div className="flex items-end gap-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-forest-500 rounded-full"
                      style={{
                        animationName: "bounce-gentle",
                        animationDuration: `${0.5 + Math.random() * 0.5}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDelay: `${i * 0.05}s`,
                        height: `${10 + Math.random() * 20}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}


        </div>

        {/* Mascot */}
        <div className="animate-slide-up">
          <Mascot mood={mascotMood} message={mascotMsg} size="md" />
        </div>
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes ai-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ai-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes ai-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
