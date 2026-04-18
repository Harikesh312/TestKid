import React, { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { calculateAccuracy } from "../utils/accuracyUtils";
import { API_BASE_URL } from "../apiConfig";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

/* ------------------------------------------------------------------ */
/*  10 curated writing sentences                                      */
/* ------------------------------------------------------------------ */
const WRITING_SENTENCES = [
  "I love my mom and dad.",
  "The bus is waiting for us.",
  "A small bee is on the flower.",
  "I like to eat sweet cake.",
  "The ball is under the table.",
  "Rain makes the trees look green.",
  "My favorite color is bright pink.",
  "The cow says moo in the farm.",
  "I can draw a round circle.",
  "Birds fly high in the blue sky.",
];

const API_BASE = API_BASE_URL;

/* ---- Gemini setup ---- */
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function WritingPage() {
  const { ageGroup: paramAge } = useParams();
  const { setWritingScore, quizAccuracy, readingScore, ageGroup, writingDetails, setWritingDetails } = useGame();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  /* ---- pick a random sentence once ---- */
  const [targetSentence] = useState(
    () =>
      WRITING_SENTENCES[Math.floor(Math.random() * WRITING_SENTENCES.length)],
  );

  /* ---- component state ---- */
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mascotMood, setMascotMood] = useState("happy");
  const [mascotMsg, setMascotMsg] = useState("Write neatly! ✨");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  /* ---- handle image upload ---- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target.result);
      setScanComplete(false);
      setAccuracy(null);
      setExtractedText("");
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

  /* ---- Gemini Vision scan ---- */
  const handleScan = useCallback(async () => {
    if (!uploadedImage) return;

    setIsScanning(true);
    setError("");
    setMascotMood("thinking");
    setMascotMsg("AI is reading your writing… 🔍");

    try {
      const fileData = parseDataUrl(uploadedImage);
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
        setWritingScore(0);
        setWritingDetails({
          targetSentence,
          extractedText: "No handwriting detected",
          accuracy: 0
        });
        setScanComplete(true);
        setMascotMood("cheering");
        setMascotMsg(
          "Assessment complete! You're doing great! 🌟",
        );
      } else {
        // Got handwritten text — compare it
        setExtractedText(responseText);
        setScanComplete(true);

        let acc = calculateAccuracy(responseText, targetSentence);
        if (acc < 100) acc = 0; // Strict zero marking if not perfectly matched
        
        setAccuracy(acc);
        setWritingScore(acc);
        setWritingDetails({
          targetSentence,
          extractedText: responseText,
          accuracy: acc
        });

        setMascotMood("cheering");
        setMascotMsg("Assessment complete! You're doing great! 🌟");
      }
    } catch (err) {
      console.error("Gemini OCR error:", err);
      setError("Something went wrong while scanning. Please try again.");
      setMascotMood("happy");
      setMascotMsg("Oops! Let's try again 🔄");
    } finally {
      setIsScanning(false);
    }
  }, [uploadedImage, targetSentence, setWritingScore]);

  /* ---- retry with a new image ---- */
  const handleRetry = () => {
    setUploadedImage(null);
    setScanComplete(false);
    setAccuracy(null);
    setExtractedText("");
    setError("");
    setMascotMood("happy");
    setMascotMsg("Write neatly! ✨");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  /* ---- save results & navigate ---- */
  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ageGroup: ageGroup || paramAge || "5-8",
        quizScore: quizAccuracy ?? 0,
        readingScore: readingScore ?? 0,
        writingScore: accuracy ?? 0,
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
              Write this sentence on paper:
            </p>
            <p
              className="text-2xl md:text-3xl text-white font-bold leading-relaxed"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{targetSentence}&rdquo;
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-sun-300/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-forest-800 font-bold">
              📝 Step 1: Write the sentence on a piece of paper
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

          {/* Upload buttons */}
          {!uploadedImage && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                id="writing-camera-btn"
                onClick={() => cameraInputRef.current?.click()}
                className="game-btn game-btn-primary text-lg"
              >
                📸 Take a Photo
              </button>
              <button
                id="writing-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                className="game-btn game-btn-secondary text-lg"
              >
                📁 Upload Image
              </button>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Uploaded image preview */}
          {uploadedImage && (
            <div className="text-center mb-6 animate-pop-in">
              <div className="relative inline-block">
                <img
                  src={uploadedImage}
                  alt="Your handwriting"
                  className="max-w-full max-h-64 rounded-xl border-4 border-forest-300 shadow-lg"
                />

                {/* Scan-line animation */}
                {isScanning && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-green-400/10" />
                  </div>
                )}
              </div>

              {/* Scan / retry buttons */}
              {!isScanning && !scanComplete && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    id="writing-scan-btn"
                    onClick={handleScan}
                    className="game-btn game-btn-warning text-lg"
                  >
                    🤖 Scan Handwriting
                  </button>
                  <button
                    onClick={handleRetry}
                    className="game-btn game-btn-secondary text-lg"
                  >
                    🔄 Choose Different Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== AI SCANNING ANIMATION ===== */}
          {isScanning && (
            <div className="text-center animate-pop-in">
              <div className="bg-linear-to-br from-sky-50 to-indigo-50 rounded-2xl p-10 border-2 border-sky-200 text-center">
                {/* Rotating spinner */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-28 h-28">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: "#38bdf8",
                        borderRightColor: "#818cf8",
                        animation: "ai-spin 1s linear infinite",
                      }}
                    />
                    <div
                      className="absolute inset-2 rounded-full border-4 border-transparent"
                      style={{
                        borderBottomColor: "#a78bfa",
                        borderLeftColor: "#f472b6",
                        animation: "ai-spin 1.5s linear infinite reverse",
                      }}
                    />
                    <div
                      className="absolute inset-4 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: "#34d399",
                        borderRightColor: "#fbbf24",
                        animation: "ai-spin 2s linear infinite",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="text-4xl"
                        style={{ animation: "ai-pulse 2s ease-in-out infinite" }}
                      >
                        🤖
                      </div>
                    </div>
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
                  AI is Reading Your Writing…
                </h3>
                <p className="text-sm text-sky-600 font-semibold mb-4">
                  AI is carefully reading your handwriting!
                </p>

                {/* Bouncing dots */}
                <div className="flex justify-center gap-2">
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
              </div>
            </div>
          )}

          {/* Results */}
          {scanComplete && accuracy !== null && (
            <div className="text-center animate-pop-in">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="writing-finish-btn"
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="game-btn game-btn-primary text-lg"
                >
                  {isSaving ? "⏳ Saving…" : "🏆 See My Results!"}
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
