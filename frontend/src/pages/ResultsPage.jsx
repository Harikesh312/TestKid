import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import StarRating from "../components/StarRating";
import "./ResultsPage.css";

export default function ResultsPage() {
  const { user, logout } = useAuth();
  const { quizAccuracy, readingScore, writingScore, ageGroup, resetGame, quizDetails, readingDetails, writingDetails, readingFollowUpDetails, writingFollowUpDetails } = useGame();
  const navigate = useNavigate();
  const confettiFired = useRef(false);
  const [activeDetails, setActiveDetails] = useState(null);

  const observerSum = (user?.observerQuestions || []).reduce((a, b) => a + Number(b), 0);
  const observerRisk = observerSum / 20;
  const mcqRisk = 1.0 - (quizAccuracy / 100);

  let readingRisk = 0, readingLevel = "Fluent";
  if (readingScore >= 90) { readingRisk = 0; readingLevel = "Fluent"; }
  else if (readingScore >= 70) { readingRisk = 0.3; readingLevel = "Minor errors"; }
  else if (readingScore >= 40) { readingRisk = 0.6; readingLevel = "Frequent errors"; }
  else { readingRisk = 1; readingLevel = "Cannot read"; }

  let writingRisk = 0, writingLevel = "Clear writing";
  if (writingScore >= 90) { writingRisk = 0; writingLevel = "Clear writing"; }
  else if (writingScore >= 70) { writingRisk = 0.3; writingLevel = "Minor mistakes"; }
  else if (writingScore >= 40) { writingRisk = 0.6; writingLevel = "Poor structure"; }
  else { writingRisk = 1; writingLevel = "Cannot write"; }

  const finalRiskScore = (0.4 * observerRisk) + (0.2 * mcqRisk) + (0.2 * readingRisk) + (0.2 * writingRisk);

  let riskClassification = "", riskColorClass = "", riskMessage = "";
  if (finalRiskScore <= 0.3) {
    riskClassification = "No Difficulty";
    riskColorClass = "results-page__classification--green";
    riskMessage = "🌟 Doing Great! Keep it up!";
  } else if (finalRiskScore <= 0.6) {
    riskClassification = "At Risk";
    riskColorClass = "results-page__classification--amber";
    riskMessage = "💪 Good effort! Let's practice a bit more.";
  } else {
    riskClassification = "High Risk";
    riskColorClass = "results-page__classification--red";
    riskMessage = "🤝 We'll help you improve step by step!";
  }

  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#5cb85c", "#fbbf24", "#f472b6", "#0ea5e9", "#a78bfa"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#5cb85c", "#fbbf24", "#f472b6", "#0ea5e9", "#a78bfa"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, []);

  const handlePlayAgain = () => { resetGame(); navigate("/dashboard"); };
  const handleLogout = () => { resetGame(); logout(); navigate("/"); };

  const handleDownloadReport = () => {
    const date = new Date().toLocaleDateString();
    const esc = (str) => `"${String(str || "").replace(/"/g, '""')}"`;
    const observerAnswers = user?.observerQuestions || [];
    const OBSERVER_QUESTIONS = [
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
    const RATING_LABELS = { 0: "Never", 1: "Sometimes", 2: "Often" };

    let csv = "TestKid Student Report Card\n\n";
    csv += `Student Name,${esc(user?.studentName || "Explorer")}\n`;
    csv += `Age Group,${esc(ageGroup || "N/A")}\n`;
    csv += `Date,${esc(date)}\n\n`;

    // --- Summary ---
    csv += "--- SUMMARY ---\n";
    csv += "Category,Accuracy/Score,Difficulty Score,Level\n";
    csv += `Observer,${observerSum}/20,${observerRisk.toFixed(2)},-\n`;
    csv += `MCQ Quiz,${quizAccuracy}%,${mcqRisk.toFixed(2)},-\n`;
    csv += `Reading,${readingScore}%,${readingRisk.toFixed(2)},${esc(readingLevel)}\n`;
    csv += `Writing,${writingScore}%,${writingRisk.toFixed(2)},${esc(writingLevel)}\n\n`;

    csv += "--- FINAL CLASSIFICATION ---\n";
    csv += `Final Risk Score,${finalRiskScore.toFixed(2)}\n`;
    csv += `Classification,${esc(riskClassification)}\n\n`;

    // --- Observer Details ---
    csv += "--- OBSERVER QUESTIONS (Individual) ---\n";
    csv += "Q#,Statement,Rating,Rating Label\n";
    OBSERVER_QUESTIONS.forEach((q, i) => {
      const val = observerAnswers[i] !== undefined ? Number(observerAnswers[i]) : "-";
      const label = val !== "-" ? (RATING_LABELS[val] || val) : "-";
      csv += `${i + 1},${esc(q)},${val},${label}\n`;
    });
    csv += `\nObserver Total,${observerSum}/20\n\n`;

    // --- Quiz Details ---
    csv += "--- MCQ QUIZ (Individual Questions) ---\n";
    csv += "Q#,Question,Your Answer,Correct Answer,Result\n";
    if (quizDetails && quizDetails.length > 0) {
      quizDetails.forEach((q, i) => {
        csv += `${i + 1},${esc(q.prompt)},${esc(q.userAnswer)},${esc(q.correctAnswer)},${q.isCorrect ? "Correct" : "Incorrect"}\n`;
      });
    } else {
      csv += "No quiz data available\n";
    }
    csv += `\nQuiz Accuracy,${quizAccuracy}%\n\n`;

    // --- Reading Details ---
    csv += "--- READING TEST ---\n";
    if (readingDetails) {
      csv += `Passage,${esc(readingDetails.targetSentence)}\n`;
      csv += `What Was Heard,${esc(readingDetails.finalTranscript)}\n`;
      csv += `Accuracy,${readingDetails.accuracy}%\n`;
    } else {
      csv += "No reading data available\n";
    }
    if (readingFollowUpDetails && readingFollowUpDetails.length > 0) {
      csv += "\nReading Follow-Up Questions\n";
      csv += "Q#,Question,Your Answer,Correct Answer,Result\n";
      readingFollowUpDetails.forEach((q, i) => {
        csv += `${i + 1},${esc(q.prompt)},${esc(q.userAnswer)},${esc(q.correctAnswer)},${q.isCorrect ? "Correct" : "Incorrect"}\n`;
      });
    }
    csv += `\nReading Score,${readingScore}%\n\n`;

    // --- Writing Details ---
    csv += "--- WRITING TEST ---\n";
    if (writingDetails) {
      csv += `Writing Prompt,${esc(writingDetails.targetPrompt || writingDetails.targetSentence)}\n`;
      csv += `What Was Read,${esc(writingDetails.extractedText)}\n`;
      csv += `Accuracy,${writingDetails.accuracy}%\n`;
    } else {
      csv += "No writing data available\n";
    }
    if (writingFollowUpDetails && writingFollowUpDetails.length > 0) {
      csv += "\nWriting Follow-Up Questions\n";
      csv += "Q#,Question,Your Answer,Correct Answer,Result\n";
      writingFollowUpDetails.forEach((q, i) => {
        csv += `${i + 1},${esc(q.prompt)},${esc(q.userAnswer)},${esc(q.correctAnswer)},${q.isCorrect ? "Correct" : "Incorrect"}\n`;
      });
    }
    csv += `\nWriting Score,${writingScore}%\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${user?.studentName || "Student"}_Report_Card.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ScoreCard = ({ title, emoji, score, delay, onClick, subtitle, riskValue }) => (
    <div className="glass-card results-page__score-card animate-pop-in" style={{ animationDelay: `${delay}s` }} onClick={onClick}>
      <div className="results-page__card-emoji">{emoji}</div>
      <h3 className="results-page__card-title">{title}</h3>
      {subtitle && <p className="results-page__card-subtitle">{subtitle}</p>}
      <div className="results-page__difficulty-box">
        <p className="results-page__difficulty-label">Difficulty Score</p>
        <p className="results-page__difficulty-value">{riskValue.toFixed(2)}</p>
      </div>
      {score !== undefined && (
        <>
          <div className="results-page__progress-track">
            <div
              className="results-page__progress-fill"
              style={{
                width: `${score}%`,
                background: score >= 80 ? "linear-gradient(90deg, #5cb85c, #4a9a4a)" : score >= 50 ? "linear-gradient(90deg, #fbbf24, #f59e0b)" : "linear-gradient(90deg, #f472b6, #ec4899)",
                transitionDelay: `${delay + 0.3}s`,
              }}
            />
          </div>
          <p className="results-page__accuracy-text">Accuracy: {score}%</p>
          <StarRating percentage={score} />
        </>
      )}
    </div>
  );

  const DetailItem = ({ q, i }) => (
    <div className={`results-page__detail-item ${q.isCorrect ? "results-page__detail-item--correct" : "results-page__detail-item--incorrect"}`}>
      <p className="results-page__detail-question">Q{i + 1}: {q.prompt}</p>
      <p className="results-page__detail-answer"><span className="results-page__detail-answer-label">Your Answer:</span> {q.userAnswer}</p>
      {!q.isCorrect && (
        <p className="results-page__detail-correct-answer"><span className="results-page__detail-answer-label">Correct Answer:</span> <span className="results-page__detail-correct-value">{q.correctAnswer}</span></p>
      )}
      <div className="results-page__detail-status">
        {q.isCorrect ? <span className="results-page__status-correct">✅ Correct</span> : <span className="results-page__status-incorrect">❌ Incorrect</span>}
      </div>
    </div>
  );

  return (
    <div className="results-page">
      <NatureBackground />
      <div className="results-page__body">
        <div className="results-page__container">

        {/* Trophy */}
        <div className="results-page__celebration animate-slide-up">
          <div className="results-page__trophy animate-celebrate">🏆</div>
        </div>

        {/* Classification */}
        <div className={`results-page__classification ${riskColorClass} animate-pop-in`}>
          <p className="results-page__risk-message">{riskMessage}</p>
          <p className="results-page__risk-label">Classification: <span className="results-page__risk-label-bold">{riskClassification}</span></p>
          <p className="results-page__risk-score">Score: {finalRiskScore.toFixed(2)}</p>
        </div>

        {/* Score Cards */}
        <div className="results-page__cards-grid animate-slide-up">
          <ScoreCard title="Observer" emoji="👁️" subtitle={`Score: ${observerSum}/20`} riskValue={observerRisk} delay={0.1} onClick={() => {}} />
          <ScoreCard title="MCQ Quiz" emoji="📝" subtitle={`Correct: ${Math.round((quizAccuracy / 100) * 10)}/10`} score={quizAccuracy} riskValue={mcqRisk} delay={0.2} onClick={() => setActiveDetails('quiz')} />
          <ScoreCard title="Reading" emoji="🎤" subtitle={`Level: ${readingLevel}`} score={readingScore} riskValue={readingRisk} delay={0.3} onClick={() => setActiveDetails('reading')} />
          <ScoreCard title="Writing" emoji="✏️" subtitle={`Level: ${writingLevel}`} score={writingScore} riskValue={writingRisk} delay={0.4} onClick={() => setActiveDetails('writing')} />
        </div>

        {/* Age badge */}
        <div className="glass-card results-page__age-badge animate-pop-in" style={{ animationDelay: "0.8s" }}>
          <p className="results-page__age-text">Age Group: <span className="results-page__age-value">{ageGroup || "N/A"}</span> | Date: <span className="results-page__age-value">{new Date().toLocaleDateString()}</span></p>
        </div>

        <div className="results-page__mascot">
          <Mascot mood="cheering" message="I'm so proud of you! 🎊" size="lg" />
        </div>

        {/* Actions */}
        <div className="results-page__actions">
          <button onClick={handleDownloadReport} className="game-btn game-btn-secondary results-page__action-btn">📊 Download Report</button>
          <button onClick={handlePlayAgain} className="game-btn game-btn-primary results-page__action-btn">🔄 Play Again</button>
          <button onClick={handleLogout} className="game-btn game-btn-danger results-page__action-btn">🚪 Logout</button>
        </div>
      </div>

      {/* Details Modal */}
      {activeDetails && (
        <div className="results-page__overlay animate-fade-in" onClick={() => setActiveDetails(null)}>
          <div className="results-page__modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <button className="results-page__modal-close" onClick={() => setActiveDetails(null)}>✕</button>

            {activeDetails === "quiz" && (
              <div>
                <h2 className="results-page__modal-title">📝 Quiz Details</h2>
                {quizDetails && quizDetails.length > 0 ? (
                  <div className="results-page__detail-list">{quizDetails.map((q, i) => <DetailItem key={i} q={q} i={i} />)}</div>
                ) : <p className="results-page__no-data">No quiz details found. Complete a quiz to view them here.</p>}
              </div>
            )}

            {activeDetails === "reading" && (
              <div>
                <h2 className="results-page__modal-title">🎤 Reading Details</h2>
                {readingDetails ? (
                  <div className="results-page__reading-card">
                    <div>
                      <p className="results-page__detail-field-label results-page__detail-field-label--sky">Passage</p>
                      <p className="results-page__detail-passage">&ldquo;{readingDetails.targetSentence}&rdquo;</p>
                    </div>
                    <div>
                      <p className="results-page__detail-field-label results-page__detail-field-label--indigo">What We Heard</p>
                      <p className="results-page__detail-transcript">&ldquo;{readingDetails.finalTranscript}&rdquo;</p>
                    </div>
                    <div className="results-page__detail-accuracy-row">
                      <p className="results-page__detail-accuracy-label">Accuracy</p>
                      <div className="results-page__detail-accuracy-badge results-page__detail-accuracy-badge--sky">
                        <span className="results-page__detail-accuracy-value">{readingDetails.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ) : <p className="results-page__no-data">No reading details found. Read a passage to view them here.</p>}
                {readingFollowUpDetails && readingFollowUpDetails.length > 0 && (
                  <div className="results-page__followup">
                    <h3 className="results-page__followup-title">📝 Follow-Up Questions</h3>
                    <div className="results-page__followup-list">{readingFollowUpDetails.map((q, i) => <DetailItem key={i} q={q} i={i} />)}</div>
                  </div>
                )}
              </div>
            )}

            {activeDetails === "writing" && (
              <div>
                <h2 className="results-page__modal-title">✏️ Writing Details</h2>
                {writingDetails ? (
                  <div className="results-page__writing-card">
                    <div>
                      <p className="results-page__detail-field-label results-page__detail-field-label--amber">Writing Prompt</p>
                      <p className="results-page__detail-passage">&ldquo;{writingDetails.targetPrompt || writingDetails.targetSentence}&rdquo;</p>
                    </div>
                    <div>
                      <p className="results-page__detail-field-label results-page__detail-field-label--orange">What We Read</p>
                      <p className="results-page__detail-transcript">&ldquo;{writingDetails.extractedText}&rdquo;</p>
                    </div>
                    <div className="results-page__writing-accuracy-row">
                      <p className="results-page__detail-accuracy-label">Accuracy</p>
                      <div className="results-page__detail-accuracy-badge results-page__detail-accuracy-badge--amber">
                        <span className="results-page__detail-accuracy-value">{writingDetails.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ) : <p className="results-page__no-data">No writing details found. Complete the writing test to view them here.</p>}
                {writingFollowUpDetails && writingFollowUpDetails.length > 0 && (
                  <div className="results-page__followup">
                    <h3 className="results-page__followup-title">📝 Follow-Up Questions</h3>
                    <div className="results-page__followup-list">{writingFollowUpDetails.map((q, i) => <DetailItem key={i} q={q} i={i} />)}</div>
                  </div>
                )}
              </div>
            )}

            <div className="results-page__modal-footer">
              <button className="game-btn game-btn-secondary results-page__modal-close-btn" onClick={() => setActiveDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
