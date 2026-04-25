import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import WelcomePage from "./pages/WelcomePage";
import ConsentPage from "./pages/ConsentPage";
import AuthChoicePage from "./pages/AuthChoicePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ObserverQuestionsPage from "./pages/ObserverQuestionsPage";
import QuizPage from "./pages/QuizPage";
import ReadingPage from "./pages/ReadingPage";
import WritingPage from "./pages/WritingPage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";

const App = () => {
  return (
    <AuthProvider>
      <GameProvider>
        {/* Global Navbar — hides itself on login/signup */}
        <Navbar />
        <Routes>
          {/* Onboarding flow: Welcome → Consent → Auth Choice */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/consent" element={<ConsentPage />} />
          <Route path="/auth-choice" element={<AuthChoicePage />} />

          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/observer-questions"
            element={
              <ProtectedRoute>
                <ObserverQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:ageGroup"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading/:ageGroup"
            element={
              <ProtectedRoute>
                <ReadingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/writing/:ageGroup"
            element={
              <ProtectedRoute>
                <WritingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </GameProvider>
    </AuthProvider>
  );
};

export default App;
