import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";

export default function WritingPage() {
  const { ageGroup: paramAge } = useParams();
  const { setWritingScore } = useGame();
  const navigate = useNavigate();

  const sentences = {
    "5-8": "The sun is bright.",
    "8-12": "A beautiful garden has many flowers.",
  };

  const targetSentence = sentences[paramAge] || sentences["5-8"];

  const [uploadedImage, setUploadedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning animation
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);
          const simScore = Math.floor(Math.random() * 26) + 70; // 70-95
          setAccuracy(simScore);
          setWritingScore(simScore);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  };

  const handleNext = () => {
    navigate("/results");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
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
              📸 Step 2: Take a photo or upload an image of your writing
            </p>
          </div>

          {/* Upload buttons */}
          {!uploadedImage && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="game-btn game-btn-primary text-lg"
              >
                📸 Take a Photo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="game-btn game-btn-secondary text-lg"
              >
                📁 Upload Image
              </button>

              {/* Hidden inputs */}
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

                {/* Scan line animation */}
                {isScanning && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div
                      className="absolute left-0 w-full h-1 bg-linear-to-r from-transparent via-green-400 to-transparent"
                      style={{
                        top: `${scanProgress}%`,
                        boxShadow: "0 0 15px rgba(74, 222, 128, 0.8)",
                        transition: "top 0.1s linear",
                      }}
                    />
                    <div className="absolute inset-0 bg-green-400/10" />
                  </div>
                )}
              </div>

              {/* Scan button */}
              {!isScanning && !scanComplete && (
                <div className="mt-4">
                  <button
                    onClick={handleScan}
                    className="game-btn game-btn-warning text-lg"
                  >
                    🤖 Scan Handwriting
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scanning progress */}
          {isScanning && (
            <div className="text-center animate-pop-in">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="text-3xl animate-wiggle">🤖</div>
                <p
                  className="text-lg font-bold text-forest-800"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Scanning Handwriting...
                </p>
              </div>
              <div className="w-full max-w-sm mx-auto bg-forest-100 rounded-full h-4 overflow-hidden border-2 border-forest-300">
                <div
                  className="h-full bg-linear-to-r from-forest-500 to-sky-500 rounded-full transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-sm text-forest-600 font-semibold mt-2">
                {scanProgress}% complete
              </p>
            </div>
          )}

          {/* Results */}
          {scanComplete && accuracy !== null && (
            <div className="text-center animate-pop-in">
              <div className="inline-block bg-linear-to-r from-forest-500 to-candy-purple text-white rounded-2xl px-8 py-4 mb-4">
                <p className="text-sm font-bold opacity-80">Writing Accuracy</p>
                <p
                  className="text-4xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {accuracy}%
                </p>
              </div>
              <div>
                <button
                  onClick={handleNext}
                  className="game-btn game-btn-primary text-lg"
                >
                  🏆 See My Results!
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mascot */}
        <div className="animate-slide-up">
          <Mascot
            mood={scanComplete ? "cheering" : isScanning ? "thinking" : "happy"}
            message={
              scanComplete
                ? "Great writing! 🎉"
                : isScanning
                  ? "Analyzing your writing... 🔍"
                  : "Write neatly! ✨"
            }
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
