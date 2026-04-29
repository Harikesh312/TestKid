import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const GameContext = createContext(null);

const STORAGE_KEY = "kidtest_game_state";

// Load persisted game state from localStorage
function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted data – ignore
  }
  return null;
}

// Save game state to localStorage
function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full – ignore
  }
}

export function GameProvider({ children }) {
  const saved = loadPersistedState();

  const [ageGroup, setAgeGroup] = useState(saved?.ageGroup ?? null);
  const [quizScore, setQuizScore] = useState(saved?.quizScore ?? 0);
  const [quizTotal, setQuizTotal] = useState(saved?.quizTotal ?? 0);
  const [readingScore, setReadingScore] = useState(saved?.readingScore ?? 0);
  const [writingScore, setWritingScore] = useState(saved?.writingScore ?? 0);

  const [quizDetails, setQuizDetails] = useState(saved?.quizDetails ?? []);
  const [readingDetails, setReadingDetails] = useState(saved?.readingDetails ?? null);
  const [writingDetails, setWritingDetails] = useState(saved?.writingDetails ?? null);

  // Follow-up question details for reading & writing
  const [readingFollowUpDetails, setReadingFollowUpDetails] = useState(saved?.readingFollowUpDetails ?? []);
  const [writingFollowUpDetails, setWritingFollowUpDetails] = useState(saved?.writingFollowUpDetails ?? []);

  // Persist to localStorage whenever any value changes
  useEffect(() => {
    persistState({
      ageGroup,
      quizScore,
      quizTotal,
      readingScore,
      writingScore,
      quizDetails,
      readingDetails,
      writingDetails,
      readingFollowUpDetails,
      writingFollowUpDetails,
    });
  }, [
    ageGroup, quizScore, quizTotal, readingScore, writingScore,
    quizDetails, readingDetails, writingDetails,
    readingFollowUpDetails, writingFollowUpDetails,
  ]);

  const resetGame = useCallback(() => {
    setAgeGroup(null);
    setQuizScore(0);
    setQuizTotal(0);
    setReadingScore(0);
    setWritingScore(0);
    setQuizDetails([]);
    setReadingDetails(null);
    setWritingDetails(null);
    setReadingFollowUpDetails([]);
    setWritingFollowUpDetails([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const quizAccuracy = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;

  return (
    <GameContext.Provider
      value={{
        ageGroup,
        setAgeGroup,
        quizScore,
        setQuizScore,
        quizTotal,
        setQuizTotal,
        readingScore,
        setReadingScore,
        writingScore,
        setWritingScore,
        quizDetails,
        setQuizDetails,
        readingDetails,
        setReadingDetails,
        writingDetails,
        setWritingDetails,
        readingFollowUpDetails,
        setReadingFollowUpDetails,
        writingFollowUpDetails,
        setWritingFollowUpDetails,
        quizAccuracy,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};
