import React, { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { calculateAccuracy } from "../utils/accuracyUtils";
import { API_BASE_URL } from "../apiConfig";
import { grade1Writing, grade2Writing } from "../data/writingData";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import ProgressBar from "../components/ProgressBar";

const API_BASE = API_BASE_URL;

/* ---- Gemini setup ---- */
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function WritingPage() {
  const { ageGroup: paramAge } = useParams();
  const {
    setWritingScore,
    quizAccuracy,
    readingScore,
    ageGroup,
    setWritingDetails,
    writingFollowUpDetails,
    setWritingFollowUpDetails,
  } = useGame();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Pick the right data for the age group
  const writingData = paramAge === "5-8" ? grade1Writing : grade2Writing;
  const writingPrompt = writingData.prompt;
  const writingHint = writingData.hint;
  const lineCount = writingData.lineCount;
  const followUpQuestions = writingData.followUpQuestions;

  /* ---- phase: "writing" | "followup" ---- */
  const [phase, setPhase] = useState("writing");
  const [followUpIdx, setFollowUpIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  /* ---- component state ---- */
  const [uploadedImage, setUploadedImage] = useState(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mascotMood, setMascotMood] = useState("happy");
  const [mascotMsg, setMascotMsg] = useState("Write neatly! ✨");

  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /* ---- handle image upload ---- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target.result;
      setUploadedImage(imageData);
      setHasUploaded(true);
      setScanComplete(false);
      setAccuracy(null);
      setExtractedText("");
      setMascotMood("thinking");
      setMascotMsg("Click Next when you are ready! 🧠");
      handleScanBackground(imageData);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Extract base64 data and mimeType from a dataURL
   */
  const parseDataUrl = (dataUrl) => {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) return null;
    return { mimeType: match[1], base64: match[2] };
  };

  /* ---- Gemini Vision scan (Background) ---- */
  const handleScanBackground = useCallback((imageData) => {
    if (!imageData) return;

    (async () => {
      try {
        const fileData = parseDataUrl(imageData);
        if (!fileData) throw new Error("Invalid image data");

        const prompt = `You are an expert handwriting reader for a children's educational app.

TASK: Look at this image and determine if it contains handwritten English text.

RULES:
1. If the image does NOT contain any handwritten text (e.g. it's a random photo, meme, screenshot, drawing without text, etc.), respond with EXACTLY: NO_HANDWRITING
2. If the image DOES contain handwritten English text, respond with ONLY the exact text you can read from the handwriting. Do not add any explanation, punctuation corrections, or extra words. Just the raw text as written.
3. Ignore any printed/typed text - only read HANDWRITTEN text.
4. If the handwriting is too unclear to read, respond with: NO_HANDWRITING

Respond with ONLY the extracted text or NO_HANDWRITING. Nothing else.`;

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          },
          { text: prompt },
        ]);

        const responseText = result.response.text().trim();
        console.log(`[Gemini OCR] Response: "${responseText}"`);

        if (
          responseText === "NO_HANDWRITING" ||
          responseText.toUpperCase().includes("NO_HANDWRITING")
        ) {
          // Not handwriting — score is 0
          setExtractedText("");
          setAccuracy(0);
          setWritingDetails({
            targetPrompt: writingPrompt,
            extractedText: "No handwriting detected",
            accuracy: 0,
          });
        } else {
          // Got handwritten text — compare it
          setExtractedText(responseText);
          setScanComplete(true);

          // For open-ended writing, we just check if they wrote enough lines
          const lines = responseText
            .split(/[\n.!?]+/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          const lineFraction = Math.min(lines.length / lineCount, 1);
          const acc = Math.round(lineFraction * 100);

          setAccuracy(acc);
          setWritingDetails({
            targetPrompt: writingPrompt,
            extractedText: responseText,
            accuracy: acc,
          });
        }
      } catch (err) {
        console.error("Gemini OCR error:", err);
        setWritingDetails({
          targetPrompt: writingPrompt,
          extractedText: "Failed to scan handwriting",
          accuracy: 0,
        });
      }
    })();
  }, [writingPrompt, lineCount, setWritingDetails]);

  /* ---- camera capture logic ---- */
  const startCamera = async () => {
    setShowCamera(true);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError(
        "Could not access camera. Please allow camera permissions or upload an image instead."
      );
      setShowCamera(false);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");

      stopCamera();

      setUploadedImage(dataUrl);
      setHasUploaded(true);
      setScanComplete(false);
      setAccuracy(null);
      setExtractedText("");
      setMascotMood("thinking");
      setMascotMsg("Click Next when you are ready! 🧠");
      handleScanBackground(dataUrl);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  /* ---- retry with a new image ---- */
  const handleRetry = () => {
    setUploadedImage(null);
    setHasUploaded(false);
    setScanComplete(false);
    setAccuracy(null);
    setExtractedText("");
    setError("");
    setMascotMood("happy");
    setMascotMsg("Write neatly! ✨");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };



  const handleFollowUpNext = async () => {
    const q = followUpQuestions[followUpIdx];
    const isCorrect = selectedAnswer === q.answer;

    const newDetails = [
      ...writingFollowUpDetails,
      {
        prompt: q.prompt,
        userAnswer: selectedAnswer,
        correctAnswer: q.answer,
        isCorrect,
      },
    ];
    setWritingFollowUpDetails(newDetails);

    if (followUpIdx < followUpQuestions.length - 1) {
      setFollowUpIdx((i) => i + 1);
      setSelectedAnswer(null);
      setMascotMood("thinking");
      setMascotMsg("Next question! 💪");
    } else {
      // Calculate final writing score based on follow-up questions
      const correctCount = newDetails.filter((d) => d.isCorrect).length;
      const finalScore = Math.round((correctCount / followUpQuestions.length) * 100);
      setWritingScore(finalScore);

      // All follow-up done, save results and navigate
      setMascotMood("cheering");
      setMascotMsg("All done! Let's see your results! 🏆");
      await saveAndFinish(finalScore);
    }
  };

  /* ---- save results & navigate ---- */
  const saveAndFinish = async (finalScore) => {
    setIsSaving(true);
    try {
      const payload = {
        ageGroup: ageGroup || paramAge || "5-8",
        quizScore: quizAccuracy ?? 0,
        readingScore: readingScore ?? 0,
        writingScore: finalScore ?? 0,
      };

      await fetch(`${API_BASE}/api/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Could not save results to backend:", err);
    } finally {
      setIsSaving(false);
      navigate("/results");
    }
  };

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
              ✏️ Phase 3: Writing — Follow-Up Questions
            </span>
          </div>

          <div className="mb-6">
            <ProgressBar
              current={followUpIdx + 1}
              total={followUpQuestions.length}
              label="Follow-Up Progress"
            />
          </div>

          {/* Show the writing prompt for reference */}
          <div className="glass-card p-4 mb-4 animate-pop-in">
            <p className="text-xs font-bold text-forest-600 uppercase tracking-wider mb-1">
              ✏️ Your writing topic was:
            </p>
            <p
              className="text-sm text-forest-800 italic leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{writingPrompt}&rdquo;
            </p>
          </div>

          <div
            className="glass-card p-8 md:p-10 animate-slide-up flex flex-col items-center"
            key={`wfq-${followUpIdx}`}
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
                disabled={selectedAnswer === null || isSaving}
                className={`game-btn game-btn-primary ${
                  selectedAnswer === null || isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSaving
                  ? "⏳ Saving…"
                  : followUpIdx < followUpQuestions.length - 1
                    ? "➡️ Next Question"
                    : "🏆 See My Results!"}
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

  /* ============ WRITING PHASE ============ */
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
            ✏️ Phase 3: Writing Test
          </span>
          <h1
            className="text-3xl text-white drop-shadow-lg"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Write It Down!
          </h1>
        </div>

        <div className="glass-card p-8 w-full mb-6 animate-pop-in">
          {/* Chalkboard */}
          <div
            className="bg-linear-to-br from-green-900 to-green-800 rounded-2xl p-8 border-4 border-amber-700 shadow-inner mb-6 text-center"
            style={{
              boxShadow:
                "inset 0 4px 20px rgba(0,0,0,0.3), 0 8px 30px rgba(0,0,0,0.15)",
            }}
          >
            <p className="text-xs text-green-300 font-bold mb-2 uppercase tracking-wider">
              ✏️ Your writing task:
            </p>
            <p
              className="text-2xl md:text-3xl text-white font-bold leading-relaxed mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {writingPrompt}
            </p>
            <div className="bg-white/10 rounded-xl p-6 my-4 border border-white/20">
              <p
                className="text-3xl md:text-5xl text-yellow-300 font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                {writingHint}
              </p>
            </div>
            <div className="mt-3 inline-block bg-green-700/60 rounded-lg px-4 py-1">
              <p className="text-xs text-green-200 font-bold">
                📝 Write at least {lineCount} lines
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-sun-300/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-forest-800 font-bold">
              📝 Step 1: Write your answer on a piece of paper
            </p>
            <p className="text-forest-600 font-semibold text-sm mt-1">
              📸 Step 2: Take a clear photo of your writing
            </p>
            <p className="text-forest-500 text-xs mt-1 italic">
              Tip: Use dark ink on white paper for best results!
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="w-full bg-red-100 border-2 border-red-300 rounded-xl p-3 text-center mb-4 animate-pop-in">
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          {/* Camera View */}
          {showCamera && (
            <div className="text-center animate-pop-in mb-6">
              <div className="relative inline-block mb-4 border-4 border-forest-300 rounded-xl overflow-hidden shadow-lg w-full max-w-2xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={stopCamera}
                  className="game-btn game-btn-secondary text-lg"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={takeSnapshot}
                  className="game-btn game-btn-primary text-xl px-10 py-3"
                >
                  📸 Snap Photo!
                </button>
              </div>
            </div>
          )}

          {/* Upload buttons / Next */}
          {!hasUploaded && !showCamera && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-6">
              <button
                id="writing-camera-btn"
                onClick={startCamera}
                className="game-btn game-btn-primary text-xl px-8 py-4"
              >
                📸 Take a Photo
              </button>
              <button
                id="writing-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                className="game-btn game-btn-secondary text-xl px-8 py-4"
              >
                📁 Upload Image
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {hasUploaded && !showCamera && (
            <div className="text-center animate-pop-in mb-6">
              <div className="relative inline-block mb-4">
                <img
                  src={uploadedImage}
                  alt="Your handwriting"
                  className="max-w-full max-h-64 rounded-xl border-4 border-forest-300 shadow-lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="game-btn game-btn-secondary text-lg"
                >
                  🔄 Choose Different Photo
                </button>
                <button
                  onClick={() => {
                    setPhase("followup");
                    setFollowUpIdx(0);
                    setSelectedAnswer(null);
                  }}
                  className="game-btn game-btn-primary text-xl px-8"
                >
                  ➡️ Next
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
