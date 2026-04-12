import React from "react";

const owlSVG = {
  happy: (
    <svg viewBox="0 0 120 140" className="w-full h-full">
      {/* Body */}
      <ellipse cx="60" cy="85" rx="45" ry="50" fill="#8B6914" />
      <ellipse cx="60" cy="90" rx="35" ry="40" fill="#D4A843" />
      {/* Belly */}
      <ellipse cx="60" cy="100" rx="22" ry="25" fill="#F5E6C8" />
      {/* Eyes */}
      <circle cx="42" cy="65" r="18" fill="white" />
      <circle cx="78" cy="65" r="18" fill="white" />
      <circle cx="44" cy="65" r="10" fill="#2D1B00" />
      <circle cx="76" cy="65" r="10" fill="#2D1B00" />
      <circle cx="47" cy="62" r="4" fill="white" />
      <circle cx="79" cy="62" r="4" fill="white" />
      {/* Beak */}
      <polygon points="60,75 54,83 66,83" fill="#FF8C00" />
      {/* Ear tufts */}
      <polygon points="25,40 35,55 20,55" fill="#8B6914" />
      <polygon points="95,40 85,55 100,55" fill="#8B6914" />
      {/* Feet */}
      <ellipse cx="45" cy="132" rx="12" ry="6" fill="#FF8C00" />
      <ellipse cx="75" cy="132" rx="12" ry="6" fill="#FF8C00" />
      {/* Wings */}
      <ellipse cx="18" cy="90" rx="12" ry="25" fill="#7A5B10" transform="rotate(-15 18 90)" />
      <ellipse cx="102" cy="90" rx="12" ry="25" fill="#7A5B10" transform="rotate(15 102 90)" />
    </svg>
  ),
  cheering: (
    <svg viewBox="0 0 120 140" className="w-full h-full">
      {/* Body */}
      <ellipse cx="60" cy="85" rx="45" ry="50" fill="#8B6914" />
      <ellipse cx="60" cy="90" rx="35" ry="40" fill="#D4A843" />
      <ellipse cx="60" cy="100" rx="22" ry="25" fill="#F5E6C8" />
      {/* Happy squinting eyes */}
      <path d="M28,65 Q42,55 56,65" stroke="#2D1B00" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M64,65 Q78,55 92,65" stroke="#2D1B00" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Big open smile */}
      <path d="M42,82 Q60,100 78,82" stroke="#FF8C00" strokeWidth="3" fill="#FF6347" />
      {/* Ear tufts */}
      <polygon points="25,40 35,55 20,55" fill="#8B6914" />
      <polygon points="95,40 85,55 100,55" fill="#8B6914" />
      {/* Wings up! */}
      <ellipse cx="10" cy="60" rx="12" ry="25" fill="#7A5B10" transform="rotate(-40 10 60)" />
      <ellipse cx="110" cy="60" rx="12" ry="25" fill="#7A5B10" transform="rotate(40 110 60)" />
      {/* Feet */}
      <ellipse cx="45" cy="132" rx="12" ry="6" fill="#FF8C00" />
      <ellipse cx="75" cy="132" rx="12" ry="6" fill="#FF8C00" />
      {/* Stars */}
      <text x="2" y="35" fontSize="16">⭐</text>
      <text x="100" y="30" fontSize="16">🌟</text>
    </svg>
  ),
  thinking: (
    <svg viewBox="0 0 120 140" className="w-full h-full">
      {/* Body */}
      <ellipse cx="60" cy="85" rx="45" ry="50" fill="#8B6914" />
      <ellipse cx="60" cy="90" rx="35" ry="40" fill="#D4A843" />
      <ellipse cx="60" cy="100" rx="22" ry="25" fill="#F5E6C8" />
      {/* One eye big, one squinting */}
      <circle cx="42" cy="65" r="18" fill="white" />
      <circle cx="44" cy="67" r="10" fill="#2D1B00" />
      <circle cx="47" cy="64" r="4" fill="white" />
      <path d="M64,65 Q78,60 92,65" stroke="#2D1B00" strokeWidth="3" fill="none" />
      {/* Beak */}
      <polygon points="60,75 54,83 66,83" fill="#FF8C00" />
      {/* Ear tufts */}
      <polygon points="25,40 35,55 20,55" fill="#8B6914" />
      <polygon points="95,40 85,55 100,55" fill="#8B6914" />
      {/* Thinking wing */}
      <ellipse cx="18" cy="80" rx="12" ry="25" fill="#7A5B10" transform="rotate(-5 18 80)" />
      <ellipse cx="102" cy="90" rx="12" ry="25" fill="#7A5B10" transform="rotate(15 102 90)" />
      {/* Feet */}
      <ellipse cx="45" cy="132" rx="12" ry="6" fill="#FF8C00" />
      <ellipse cx="75" cy="132" rx="12" ry="6" fill="#FF8C00" />
      {/* Question mark */}
      <text x="95" y="40" fontSize="20" fill="#FF8C00" fontWeight="bold">?</text>
    </svg>
  ),
};

export default function Mascot({ mood = "happy", message = "", size = "md" }) {
  const sizeClasses = {
    sm: "w-20 h-24",
    md: "w-28 h-32",
    lg: "w-36 h-44",
    xl: "w-48 h-56",
  };

  const animClass =
    mood === "cheering"
      ? "animate-celebrate"
      : mood === "thinking"
      ? "animate-wiggle"
      : "animate-bounce-gentle";

  return (
    <div className="flex flex-col items-center gap-2">
      {message && (
        <div
          className="relative bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-forest-300 max-w-[220px] text-center animate-pop-in"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <p className="text-sm font-bold text-forest-800">{message}</p>
          {/* Speech bubble triangle */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
            }}
          />
        </div>
      )}
      <div className={`${sizeClasses[size]} ${animClass}`}>
        {owlSVG[mood] || owlSVG.happy}
      </div>
    </div>
  );
}
