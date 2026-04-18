import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { calculateAccuracy } from "../utils/accuracyUtils";
import { API_BASE_URL } from "../apiConfig";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

/* ------------------------------------------------------------------ */
/*  10 curated reading sentences                                      */
/* ------------------------------------------------------------------ */
const READING_SENTENCES = [
  "The happy sun is big and yellow.",
  "I can see a blue bird in the tree.",
  "My dog likes to run and jump.",
  "The cat is sleeping on the red mat.",
  "I have five fingers on my hand.",
  "The water in the lake is very cold.",
  "Green grass grows in the garden.",
  "We go to school every morning.",
  "An apple a day is good for health.",
  "The stars twinkle in the dark sky.",
];

const API_BASE = API_BASE_URL;

export default function ReadingPage() {
  const { ageGroup: paramAge } = useParams();
  const { setReadingScore, readingDetails, setReadingDetails } = useGame();
  const navigate = useNavigate();

  /* ---- pick a random sentence once ---- */
  const [targetSentence] = useState(
    () =>
      READING_SENTENCES[Math.floor(Math.random() * READING_SENTENCES.length)],
  );

  /* ---- state ---- */
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState("");
  const [mascotMood, setMascotMood] = useState("happy");
  const [mascotMsg, setMascotMsg] = useState("Read the sentence out loud! 📖");
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



  /* ---- the actual stop logic (extracted so auto-stop & manual stop share it) ---- */
  const doStop = useCallback(async () => {
    if (stopCalledRef.current) return;
    stopCalledRef.current = true;

    setIsRecording(false);
    setIsProcessing(true);
    setMascotMood("thinking");
    setMascotMsg("Analyzing your reading with AI… 🔍");

    // Stop Web Speech API
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    // Wait for MediaRecorder to finish
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || errData.message || "Transcription failed",
        );
      }

      const data = await res.json();
      const transcriptText = data.text || "";
      setFinalTranscript(transcriptText);

      if (!transcriptText.trim()) {
        setAccuracy(0);
        setReadingScore(0);
        setReadingDetails({
          targetSentence,
          finalTranscript: "No words detected",
          accuracy: 0
        });
        setMascotMood("happy");
        setMascotMsg("I couldn't hear anything, but that's okay, let's move on! ➡️");
      } else {
        const acc = calculateAccuracy(transcriptText, targetSentence);
        setAccuracy(acc);
        setReadingScore(acc);
        setReadingDetails({
          targetSentence,
          finalTranscript: transcriptText,
          accuracy: acc
        });

        setMascotMood("cheering");
        setMascotMsg("Assessment complete! You're doing great! 🌟");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError(`Something went wrong: ${err.message}. Try again!`);
      setMascotMood("happy");
      setMascotMsg("Oops! Let's try again 🔄");
    } finally {
      setIsProcessing(false);
    }
  }, [targetSentence, setReadingScore]);

  /* ---- start recording ---- */
  const startRecording = useCallback(async () => {
    setError("");
    stopCalledRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      streamRef.current = stream;

      // ===== 1) MediaRecorder for AssemblyAI =====
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

      // ===== 2) Web Speech API for live text =====
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

        // If Web Speech API ends on its own, don't crash
        recognition.onend = () => {
          // If still supposed to be recording, restart it
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
      setLiveText("");
      setFinalTranscript("");
      setAccuracy(null);
      setMascotMood("thinking");
      setMascotMsg("I'm listening… 👂");
    } catch (err) {
      console.error("Mic error:", err);
      setMicPermission("denied");
      setError(
        "Microphone access was denied. Please allow microphone permission in your browser settings.",
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
    setMascotMood("happy");
    setMascotMsg("Read the sentence out loud! 📖");
    stopCalledRef.current = false;
  };

  /* ---- next phase ---- */
  const handleNext = () => {
    navigate(`/writing/${paramAge}`);
  };

  /* ---- cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative">
      <NatureBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto py-8">
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
          {/* Sentence billboard */}
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

          {/* ===== AI PROCESSING OVERLAY ===== */}
          {isProcessing && (
            <div className="mb-6 animate-pop-in">
              <div className="bg-linear-to-br from-sky-50 to-indigo-50 rounded-2xl p-10 border-2 border-sky-200 text-center">
                {/* Rotating spinner */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-28 h-28">
                    {/* Outer rotating ring */}
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: "#38bdf8",
                        borderRightColor: "#818cf8",
                        animation: "ai-spin 1s linear infinite",
                      }}
                    />
                    {/* Middle rotating ring (opposite direction) */}
                    <div
                      className="absolute inset-2 rounded-full border-4 border-transparent"
                      style={{
                        borderBottomColor: "#a78bfa",
                        borderLeftColor: "#f472b6",
                        animation: "ai-spin 1.5s linear infinite reverse",
                      }}
                    />
                    {/* Inner rotating ring */}
                    <div
                      className="absolute inset-4 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: "#34d399",
                        borderRightColor: "#fbbf24",
                        animation: "ai-spin 2s linear infinite",
                      }}
                    />
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="text-4xl"
                        style={{ animation: "ai-pulse 2s ease-in-out infinite" }}
                      >
                        🤖
                      </div>
                    </div>
                    {/* Pulsing glow behind */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                        animation: "ai-pulse 2s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>

                <h3
                  className="text-xl font-bold text-sky-800 mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  AI is Analyzing…
                </h3>
                <p className="text-sm text-sky-600 font-semibold mb-4">
                  Our smart owl is carefully checking your reading!
                </p>

                {/* Animated dots */}
                <div className="flex justify-center gap-2 mb-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: ["#38bdf8", "#818cf8", "#a78bfa", "#f472b6", "#34d399"][i],
                        animationName: "ai-bounce",
                        animationDuration: "1.4s",
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>

                {/* What we heard preview */}
                {liveText && (
                  <div className="mt-2 p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-gray-500 font-bold mb-1">
                      You said:
                    </p>
                    <p className="text-sm text-forest-700 font-semibold">
                      &ldquo;{liveText}&rdquo;
                    </p>
                  </div>
                )}
              </div>
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

              {/* Record / Stop button */}
              <button
                id="reading-record-btn"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={accuracy !== null}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
                  isRecording
                    ? "bg-red-500 text-white animate-mic-pulse shadow-lg shadow-red-300"
                    : accuracy !== null
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-br from-forest-500 to-forest-700 text-white hover:scale-110 shadow-lg"
                }`}
              >
                {isRecording ? "⏹️" : "🎙️"}
              </button>

              <p className="text-sm font-bold text-forest-700">
                {isRecording
                  ? "🔴 Listening… Click to stop or stay silent to auto-stop"
                  : accuracy !== null
                    ? "Recording complete!"
                    : micPermission === "denied"
                      ? "⚠️ Microphone blocked – check browser settings"
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

          {/* Accuracy result */}
          {accuracy !== null && !isProcessing && (
            <div className="mt-4 text-center animate-pop-in">
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleNext}
                  className="game-btn game-btn-primary text-lg"
                >
                  ✏️ Continue to Writing Test!
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
