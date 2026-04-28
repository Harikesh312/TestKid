import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import StarRating from "../components/StarRating";

export default function ResultsPage() {
  const { user, logout } = useAuth();
  const { quizAccuracy, readingScore, writingScore, ageGroup, resetGame, quizDetails, readingDetails, writingDetails, readingFollowUpDetails, writingFollowUpDetails } =
    useGame();
  const navigate = useNavigate();
  const confettiFired = useRef(false);
  const [activeDetails, setActiveDetails] = useState(null);

  // Calculate risks (0.0 to 1.0) where 1.0 is max difficulty/risk
  const observerSum = (user?.observerQuestions || []).reduce((a, b) => a + Number(b), 0);
  const observerRisk = observerSum / 20; // 10 questions max 2 each = 20
  const mcqRisk = 1.0 - (quizAccuracy / 100);

  // Map reading score
  let readingRisk = 0;
  let readingLevel = "Fluent";
  if (readingScore >= 90) { readingRisk = 0; readingLevel = "Fluent"; }
  else if (readingScore >= 70) { readingRisk = 0.3; readingLevel = "Minor errors"; }
  else if (readingScore >= 40) { readingRisk = 0.6; readingLevel = "Frequent errors"; }
  else { readingRisk = 1; readingLevel = "Cannot read"; }

  // Map writing score
  let writingRisk = 0;
  let writingLevel = "Clear writing";
  if (writingScore >= 90) { writingRisk = 0; writingLevel = "Clear writing"; }
  else if (writingScore >= 70) { writingRisk = 0.3; writingLevel = "Minor mistakes"; }
  else if (writingScore >= 40) { writingRisk = 0.6; writingLevel = "Poor structure"; }
  else { writingRisk = 1; writingLevel = "Cannot write"; }

  const finalRiskScore = (0.4 * observerRisk) + (0.2 * mcqRisk) + (0.2 * readingRisk) + (0.2 * writingRisk);

  let riskClassification = "";
  let riskColor = "";
  let riskMessage = "";
  if (finalRiskScore <= 0.3) {
    riskClassification = "No Difficulty";
    riskColor = "from-green-500 to-emerald-600";
    riskMessage = "🌟 Doing Great! Keep it up!";
  } else if (finalRiskScore <= 0.6) {
    riskClassification = "At Risk";
    riskColor = "from-amber-400 to-orange-500";
    riskMessage = "💪 Good effort! Let's practice a bit more.";
  } else {
    riskClassification = "High Risk";
    riskColor = "from-rose-500 to-red-600";
    riskMessage = "🤝 We'll help you improve step by step!";
  }

  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;
      // Fire confetti!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#5cb85c", "#fbbf24", "#f472b6", "#0ea5e9", "#a78bfa"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#5cb85c", "#fbbf24", "#f472b6", "#0ea5e9", "#a78bfa"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, []);



  const handlePlayAgain = () => {
    resetGame();
    navigate("/dashboard");
  };

  const handleLogout = () => {
    resetGame();
    logout();
    navigate("/");
  };

  const handleDownloadReport = () => {
    const date = new Date().toLocaleDateString();
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "TestKid Student Report Card\n\n";
    csvContent += `Student Name,${user?.studentName || "Explorer"}\n`;
    csvContent += `Age Group,${ageGroup || "N/A"}\n`;
    csvContent += `Date,${date}\n\n`;

    csvContent += "--- MARKS DISTRIBUTION ---\n";
    csvContent += "Category,Accuracy/Score,Difficulty Score,Level\n";
    csvContent += `Observer,${observerSum}/20,${observerRisk.toFixed(2)},-\n`;
    csvContent += `MCQ Quiz,${quizAccuracy}%,${mcqRisk.toFixed(2)},-\n`;
    csvContent += `Reading,${readingScore}%,${readingRisk.toFixed(2)},${readingLevel}\n`;
    csvContent += `Writing,${writingScore}%,${writingRisk.toFixed(2)},${writingLevel}\n\n`;

    csvContent += "--- FINAL CLASSIFICATION ---\n";
    csvContent += `Final Risk Score,${finalRiskScore.toFixed(2)}\n`;
    csvContent += `Classification,${riskClassification}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${user?.studentName || "Student"}_Report_Card.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ScoreCard = ({ title, emoji, score, delay, onClick, subtitle, riskValue }) => (
    <div
      className="glass-card p-6 text-center animate-pop-in cursor-pointer hover:scale-105 transition-transform duration-300 hover:shadow-lg flex flex-col items-center"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h3
        className="text-xl text-forest-800 font-bold mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      {subtitle && <p className="text-sm font-semibold text-forest-600 mb-4">{subtitle}</p>}

      <div className="bg-white/50 w-full rounded-xl p-3 mb-4 border border-forest-100 shadow-inner">
         <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Difficulty Score</p>
         <p className="text-2xl font-black text-forest-700">{riskValue.toFixed(2)}</p>
      </div>

      {score !== undefined && (
        <>
          <div className="w-full bg-forest-100 rounded-full h-3 mb-2 overflow-hidden border border-forest-200">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${score}%`,
                background:
                  score >= 80
                    ? "linear-gradient(90deg, #5cb85c, #4a9a4a)"
                    : score >= 50
                      ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                      : "linear-gradient(90deg, #f472b6, #ec4899)",
                transitionDelay: `${delay + 0.3}s`,
              }}
            />
          </div>
          <p className="text-md font-bold text-forest-800 mb-2">Accuracy: {score}%</p>
          <StarRating percentage={score} />
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col pt-16 pb-8 overflow-y-scroll overflow-x-hidden relative">
      <NatureBackground />
      <div className="flex-1 flex flex-col justify-center items-center w-full p-4">
        <div className="relative z-10 w-full max-w-4xl py-8">
        {/* Trophy & Celebration */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="text-8xl mb-6 animate-celebrate leading-none mt-4">🏆</div>
          <h1
            className="text-4xl md:text-5xl text-white drop-shadow-lg mb-2"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Amazing Work!
          </h1>
          <p className="text-xl text-white/90 font-bold drop-shadow">
            {user?.studentName || "Explorer"}, here are your results!
          </p>
        </div>

        {/* Overall message & Classification */}
        <div
          className={`bg-linear-to-r ${riskColor} text-white rounded-3xl px-10 py-6 mb-12 animate-pop-in text-center shadow-xl max-w-2xl mx-auto`}
        >
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {riskMessage}
          </p>
          <p className="text-lg opacity-90 mt-1">
            Classification: <span className="text-2xl font-bold">{riskClassification}</span>
          </p>
          <p className="text-sm opacity-80 mt-1">
            Score: {finalRiskScore.toFixed(2)}
          </p>
        </div>

        {/* Score Board Formula Details */}
        <div className="glass-card p-6 md:p-8 mb-12 w-full animate-slide-up bg-white/80">
          <h2 className="text-2xl font-bold text-forest-800 mb-6 text-center" style={{ fontFamily: "var(--font-display)" }}>
            📊 Final Score Marks Distribution
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-lg font-bold text-forest-700 bg-forest-50 rounded-xl p-4 border border-forest-100 mb-8 overflow-x-auto text-center">
            <div className="whitespace-nowrap flex items-center">
              <span className="text-forest-900 bg-white px-3 py-1 rounded shadow-sm">0.4</span> <span className="mx-2">× Observer</span>
            </div>
            <span className="text-forest-400 hidden md:inline">+</span>
            <div className="whitespace-nowrap flex items-center">
              <span className="text-forest-900 bg-white px-3 py-1 rounded shadow-sm">0.2</span> <span className="mx-2">× MCQ</span>
            </div>
            <span className="text-forest-400 hidden md:inline">+</span>
            <div className="whitespace-nowrap flex items-center">
              <span className="text-forest-900 bg-white px-3 py-1 rounded shadow-sm">0.2</span> <span className="mx-2">× Reading</span>
            </div>
            <span className="text-forest-400 hidden md:inline">+</span>
            <div className="whitespace-nowrap flex items-center">
              <span className="text-forest-900 bg-white px-3 py-1 rounded shadow-sm">0.2</span> <span className="mx-2">× Writing</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <ScoreCard
              title="Observer"
              emoji="👁️"
              subtitle={`Score: ${observerSum}/20`}
              riskValue={observerRisk}
              delay={0.1}
              onClick={() => {}}
            />
            <ScoreCard
              title="MCQ Quiz"
              emoji="📝"
              subtitle={`Correct: ${Math.round((quizAccuracy / 100) * 10)}/10`}
              score={quizAccuracy}
              riskValue={mcqRisk}
              delay={0.2}
              onClick={() => setActiveDetails('quiz')}
            />
            <ScoreCard
              title="Reading"
              emoji="🎤"
              subtitle={`Level: ${readingLevel}`}
              score={readingScore}
              riskValue={readingRisk}
              delay={0.3}
              onClick={() => setActiveDetails('reading')}
            />
            <ScoreCard
              title="Writing"
              emoji="✏️"
              subtitle={`Level: ${writingLevel}`}
              score={writingScore}
              riskValue={writingRisk}
              delay={0.4}
              onClick={() => setActiveDetails('writing')}
            />
          </div>
        </div>

        {/* Age Group Badge */}
        <div
          className="glass-card px-6 py-3 mb-6 inline-block animate-pop-in"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="text-sm font-bold text-forest-700">
            Age Group:{" "}
            <span className="text-forest-900">{ageGroup || "N/A"}</span> | Date:{" "}
            <span className="text-forest-900">
              {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>

        {/* Mascot */}
        <div className="mb-10">
          <Mascot mood="cheering" message="I'm so proud of you! 🎊" size="lg" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={handleDownloadReport}
            className="game-btn game-btn-secondary text-xl px-10 py-4"
          >
            📊 Download Report
          </button>
          <button
            onClick={handlePlayAgain}
            className="game-btn game-btn-primary text-xl px-10 py-4"
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleLogout}
            className="game-btn game-btn-danger text-xl px-10 py-4"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {activeDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveDetails(null)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 font-bold transition flex justify-center items-center" onClick={() => setActiveDetails(null)}>✕</button>
            
            {activeDetails === "quiz" && (
              <div>
                 <h2 className="text-3xl font-bold text-forest-800 mb-6" style={{ fontFamily: "var(--font-display)" }}>📝 Quiz Details</h2>
                 {quizDetails && quizDetails.length > 0 ? (
                   <div className="space-y-4">
                     {quizDetails.map((q, i) => (
                       <div key={i} className={`p-4 rounded-xl border-2 ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                         <p className="font-bold text-gray-800 mb-2">Q{i+1}: {q.prompt}</p>
                         <p className="text-sm"><span className="font-semibold text-gray-600">Your Answer:</span> {q.userAnswer}</p>
                         {!q.isCorrect && (
                           <p className="text-sm mt-1"><span className="font-semibold text-gray-600">Correct Answer:</span> <span className="text-forest-700">{q.correctAnswer}</span></p>
                         )}
                         <div className="mt-2 text-sm font-bold">
                           {q.isCorrect ? <span className="text-green-600">✅ Correct</span> : <span className="text-red-600">❌ Incorrect</span>}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : <p className="text-gray-500 italic">No quiz details found. Complete a quiz to view them here.</p>}
              </div>
            )}

            {activeDetails === "reading" && (
              <div>
                 <h2 className="text-3xl font-bold text-forest-800 mb-6" style={{ fontFamily: "var(--font-display)" }}>🎤 Reading Details</h2>
                 {readingDetails ? (
                   <div className="p-5 rounded-xl border-2 border-sky-300 bg-linear-to-br from-sky-50 to-indigo-50 space-y-4">
                     <div>
                       <p className="font-bold text-sky-600 text-xs uppercase tracking-wider mb-1">Passage</p>
                       <p className="text-xl font-semibold text-forest-800">&ldquo;{readingDetails.targetSentence}&rdquo;</p>
                     </div>
                     <div>
                       <p className="font-bold text-indigo-600 text-xs uppercase tracking-wider mb-1">What We Heard</p>
                       <p className="text-lg text-forest-600 italic">&ldquo;{readingDetails.finalTranscript}&rdquo;</p>
                     </div>
                     <div className="pt-4 border-t border-sky-200 mt-2 flex justify-between items-center">
                       <p className="font-bold text-gray-800 text-lg">Accuracy</p>
                       <div className="inline-block bg-sky-500 text-white rounded-xl px-4 py-1">
                         <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{readingDetails.accuracy}%</span>
                       </div>
                     </div>
                   </div>
                 ) : <p className="text-gray-500 italic">No reading details found. Read a passage to view them here.</p>}

                 {/* Reading Follow-Up Questions */}
                 {readingFollowUpDetails && readingFollowUpDetails.length > 0 && (
                   <div className="mt-6">
                     <h3 className="text-xl font-bold text-forest-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>📝 Follow-Up Questions</h3>
                     <div className="space-y-3">
                       {readingFollowUpDetails.map((q, i) => (
                         <div key={i} className={`p-4 rounded-xl border-2 ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                           <p className="font-bold text-gray-800 mb-2">Q{i+1}: {q.prompt}</p>
                           <p className="text-sm"><span className="font-semibold text-gray-600">Your Answer:</span> {q.userAnswer}</p>
                           {!q.isCorrect && (
                             <p className="text-sm mt-1"><span className="font-semibold text-gray-600">Correct Answer:</span> <span className="text-forest-700">{q.correctAnswer}</span></p>
                           )}
                           <div className="mt-2 text-sm font-bold">
                             {q.isCorrect ? <span className="text-green-600">✅ Correct</span> : <span className="text-red-600">❌ Incorrect</span>}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}

            {activeDetails === "writing" && (
              <div>
                 <h2 className="text-3xl font-bold text-forest-800 mb-6" style={{ fontFamily: "var(--font-display)" }}>✏️ Writing Details</h2>
                 {writingDetails ? (
                   <div className="p-5 rounded-xl border-2 border-amber-300 bg-linear-to-br from-amber-50 to-orange-50 space-y-4">
                     <div>
                       <p className="font-bold text-amber-600 text-xs uppercase tracking-wider mb-1">Writing Prompt</p>
                       <p className="text-xl font-semibold text-forest-800">&ldquo;{writingDetails.targetPrompt || writingDetails.targetSentence}&rdquo;</p>
                     </div>
                     <div>
                       <p className="font-bold text-orange-600 text-xs uppercase tracking-wider mb-1">What We Read</p>
                       <p className="text-lg text-forest-600 italic">&ldquo;{writingDetails.extractedText}&rdquo;</p>
                     </div>
                     <div className="pt-4 border-t border-amber-200 mt-2 flex justify-between items-center">
                       <p className="font-bold text-gray-800 text-lg">Accuracy</p>
                       <div className="inline-block bg-amber-500 text-white rounded-xl px-4 py-1">
                         <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{writingDetails.accuracy}%</span>
                       </div>
                     </div>
                   </div>
                 ) : <p className="text-gray-500 italic">No writing details found. Complete the writing test to view them here.</p>}

                 {/* Writing Follow-Up Questions */}
                 {writingFollowUpDetails && writingFollowUpDetails.length > 0 && (
                   <div className="mt-6">
                     <h3 className="text-xl font-bold text-forest-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>📝 Follow-Up Questions</h3>
                     <div className="space-y-3">
                       {writingFollowUpDetails.map((q, i) => (
                         <div key={i} className={`p-4 rounded-xl border-2 ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                           <p className="font-bold text-gray-800 mb-2">Q{i+1}: {q.prompt}</p>
                           <p className="text-sm"><span className="font-semibold text-gray-600">Your Answer:</span> {q.userAnswer}</p>
                           {!q.isCorrect && (
                             <p className="text-sm mt-1"><span className="font-semibold text-gray-600">Correct Answer:</span> <span className="text-forest-700">{q.correctAnswer}</span></p>
                           )}
                           <div className="mt-2 text-sm font-bold">
                             {q.isCorrect ? <span className="text-green-600">✅ Correct</span> : <span className="text-red-600">❌ Incorrect</span>}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}
            
            <div className="mt-8 text-center">
              <button className="game-btn game-btn-secondary px-8" onClick={() => setActiveDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
