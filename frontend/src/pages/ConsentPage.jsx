import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NatureBackground from "../components/NatureBackground";
import Mascot from "../components/Mascot";
import { API_BASE_URL } from "../apiConfig";
import "./ConsentPage.css";

const CONSENT_ITEMS = [
  { key: "isGuardian", text: "I confirm that I am the parent/teacher/legal guardian of the child." },
  { key: "understandsScreeningPurpose", text: "I understand that this screening tool is designed to identify potential learning difficulties, not to provide a medical diagnosis." },
  { key: "givesPermission", text: "I give permission for the child to participate in this assessment." },
  { key: "understandsDataUsage", text: "I understand that the data collected will be used only for educational and research purposes." },
  { key: "consentsAnonymousData", text: "I consent to the anonymous use of this data to improve the system." },
  { key: "understandsProfessionalInterpretation", text: "I understand that results should be interpreted by a qualified professional if needed." },
  { key: "canWithdrawConsent", text: "I can withdraw consent at any time before submitting the test." },
];

export default function ConsentPage() {
  const navigate = useNavigate();
  const [statements, setStatements] = useState(
    CONSENT_ITEMS.reduce((acc, item) => ({ ...acc, [item.key]: false }), {})
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowItems(true), 300);
    return () => clearTimeout(t);
  }, []);

  const allStatementsChecked = Object.values(statements).every(Boolean);

  const handleStatementToggle = (key) => {
    setStatements((prev) => ({ ...prev, [key]: !prev[key] }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!allStatementsChecked || !agreedToTerms) {
      setError("Please acknowledge all statements and check the consent box.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const sessionId = localStorage.getItem("kidtest_consent_session") || `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("kidtest_consent_session", sessionId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consentStatements: statements, agreedToTerms, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save consent.");
      localStorage.setItem("kidtest_consent_given", "true");
      localStorage.setItem("kidtest_consent_id", data.consentId);
      navigate("/auth-choice");
    } catch (err) {
      console.warn("Consent save failed, using fallback:", err.message);
      localStorage.setItem("kidtest_consent_given", "true");
      localStorage.setItem("kidtest_consent_session", sessionId);
      navigate("/auth-choice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="consent-page">
      <NatureBackground />
      <div className="consent-page__body">
        <div className="consent-page__container">
          <div className={`consent-page__transition ${showItems ? "consent-page__transition--visible" : ""}`}>
            {/* Header */}
            <div className="consent-page__header">
              <div className="consent-page__badge">
                <span className="consent-page__badge-emoji">📋</span>
                <span className="consent-page__badge-text">Step 2 of 2</span>
              </div>
            </div>

            {/* Main card */}
            <div className="glass-card consent-page__card">
              <div className="consent-page__title-area">
                <h1 className="consent-page__title">📜 Consent Form</h1>
                <p className="consent-page__subtitle">Please review and acknowledge each statement below</p>
              </div>

              <div className="consent-page__mascot">
                <Mascot mood="thinking" message="Please read carefully! 📖" size="sm" />
              </div>

              <div className="consent-page__items">
                {CONSENT_ITEMS.map((item, index) => (
                  <div
                    key={item.key}
                    onClick={() => handleStatementToggle(item.key)}
                    className={`consent-page__item ${statements[item.key] ? "consent-page__item--checked" : ""}`}
                    style={{ opacity: showItems ? 1 : 0, transition: `all 0.3s ease, opacity 0.5s ease ${index * 0.08}s` }}
                  >
                    <div className={`consent-page__checkbox ${statements[item.key] ? "consent-page__checkbox--checked" : ""}`}>
                      {statements[item.key] && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-pop-in">
                          <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="consent-page__item-text-wrap">
                      <p className={`consent-page__item-text ${statements[item.key] ? "consent-page__item-text--checked" : ""}`}>
                        <span className="consent-page__item-emoji">{item.emoji}</span>
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="consent-page__divider" />

              {/* Master consent */}
              <div
                onClick={() => { if (allStatementsChecked) { setAgreedToTerms(!agreedToTerms); setError(""); } }}
                className={`consent-page__master ${agreedToTerms ? "consent-page__master--agreed" : allStatementsChecked ? "consent-page__master--enabled" : ""}`}
              >
                <div className={`consent-page__master-checkbox ${agreedToTerms ? "consent-page__master-checkbox--checked" : ""}`}>
                  {agreedToTerms && (
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="animate-pop-in">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className={`consent-page__master-text ${agreedToTerms ? "consent-page__master-text--agreed" : ""}`}>
                   I agree to the above terms and give consent.
                </p>
              </div>

              {error && (
                <div className="consent-page__error animate-shake">
                  <p className="consent-page__error-text">🚫 {error}</p>
                </div>
              )}

              <button
                id="consent-continue-btn"
                onClick={handleSubmit}
                disabled={!agreedToTerms || isSubmitting}
                className={`game-btn game-btn-primary consent-page__continue ${!agreedToTerms ? "consent-page__continue--disabled" : ""}`}
              >
                {isSubmitting ? (<span className="animate-wiggle consent-page__continue-loading">🦉 Saving...</span>) : "📝 Continue"}
              </button>

              <div className="consent-page__back">
                <Link to="/welcome" className="consent-page__back-link">← Back to Welcome</Link>
              </div>
            </div>

            <div className="consent-page__ground">
              {["🌿", "🦔", "🍀", "🌼"].map((emoji, i) => (
                <span key={i} className="animate-bounce-gentle" style={{ animationDelay: `${i * 0.2}s` }}>{emoji}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
