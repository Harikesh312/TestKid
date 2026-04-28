import React, { createContext, useContext, useState } from "react";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [ageGroup, setAgeGroup] = useState(null); // "5-8" or "8-12"
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [readingScore, setReadingScore] = useState(0);
  const [writingScore, setWritingScore] = useState(0);

  const [quizDetails, setQuizDetails] = useState([]);
  const [readingDetails, setReadingDetails] = useState(null);
  const [writingDetails, setWritingDetails] = useState(null);

  // Follow-up question details for reading & writing
  const [readingFollowUpDetails, setReadingFollowUpDetails] = useState([]);
  const [writingFollowUpDetails, setWritingFollowUpDetails] = useState([]);

  const resetGame = () => {
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
  };

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
