import React from "react";

export default function ProgressBar({ current, total, label = "" }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full max-w-lg mx-auto">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-forest-800" style={{ fontFamily: "var(--font-display)" }}>
            {label}
          </span>
          <span className="text-sm font-bold text-forest-600">
            {current}/{total}
          </span>
        </div>
      )}
      <div className="progress-vine-track">
        <div
          className="progress-vine-fill"
          style={{ width: `${percentage}%`, "--target-width": `${percentage}%` }}
        />
      </div>
    </div>
  );
}
