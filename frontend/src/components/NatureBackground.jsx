import React from "react";

export default function NatureBackground({ variant = "default" }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "night"
              ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)"
              : "linear-gradient(180deg, #87CEEB 0%, #B0E0FF 30%, #98FB98 70%, #72d572 100%)",
        }}
      />

      {/* Sun */}
      {variant !== "night" && (
        <div
          className="absolute top-8 right-12 w-24 h-24 rounded-full"
          style={{
            background: "radial-gradient(circle, #FFE066 0%, #FFD700 50%, transparent 70%)",
            boxShadow: "0 0 60px rgba(255, 215, 0, 0.4)",
            animation: "pulse-glow 4s ease-in-out infinite",
          }}
        />
      )}

      {/* Clouds */}
      <div
        className="absolute top-[8%] w-32 h-10 bg-white/70 rounded-full"
        style={{ animation: "cloud-drift 25s linear infinite", left: "-10%" }}
      >
        <div className="absolute -top-4 left-4 w-12 h-12 bg-white/70 rounded-full" />
        <div className="absolute -top-6 left-12 w-16 h-16 bg-white/70 rounded-full" />
        <div className="absolute -top-3 right-3 w-10 h-10 bg-white/70 rounded-full" />
      </div>

      <div
        className="absolute top-[15%] w-40 h-12 bg-white/60 rounded-full"
        style={{ animation: "cloud-drift 35s linear infinite", animationDelay: "-10s", left: "-15%" }}
      >
        <div className="absolute -top-5 left-6 w-14 h-14 bg-white/60 rounded-full" />
        <div className="absolute -top-7 left-16 w-18 h-18 bg-white/60 rounded-full" />
        <div className="absolute -top-4 right-4 w-12 h-12 bg-white/60 rounded-full" />
      </div>

      <div
        className="absolute top-[22%] w-28 h-8 bg-white/50 rounded-full"
        style={{ animation: "cloud-drift 45s linear infinite", animationDelay: "-20s", left: "-10%" }}
      >
        <div className="absolute -top-3 left-3 w-10 h-10 bg-white/50 rounded-full" />
        <div className="absolute -top-5 left-10 w-12 h-12 bg-white/50 rounded-full" />
      </div>

      {/* Rolling hills */}
      <div className="absolute bottom-0 w-full h-[40%]">
        {/* Far hill */}
        <div
          className="absolute bottom-[15%] w-full h-[60%]"
          style={{
            background: "linear-gradient(180deg, #6BCB77 0%, #4CAF50 100%)",
            borderRadius: "50% 50% 0 0",
            transform: "scaleX(1.5)",
          }}
        />
        {/* Middle hill */}
        <div
          className="absolute bottom-[5%] left-[-10%] w-[70%] h-[50%]"
          style={{
            background: "linear-gradient(180deg, #5cb85c 0%, #45a049 100%)",
            borderRadius: "50% 50% 0 0",
          }}
        />
        {/* Near hill */}
        <div
          className="absolute bottom-0 right-[-10%] w-[70%] h-[45%]"
          style={{
            background: "linear-gradient(180deg, #4a9a4a 0%, #3d7a3d 100%)",
            borderRadius: "50% 50% 0 0",
          }}
        />
        {/* Ground */}
        <div
          className="absolute bottom-0 w-full h-[15%]"
          style={{
            background: "linear-gradient(180deg, #3d7a3d 0%, #2d5a2d 100%)",
          }}
        />
      </div>

      {/* Trees (simplified) */}
      <div className="absolute bottom-[18%] left-[5%]" style={{ animation: "sway 6s ease-in-out infinite" }}>
        <div className="w-4 h-16 bg-amber-800 mx-auto rounded" />
        <div className="w-20 h-20 bg-green-600 rounded-full -mt-8 mx-auto" style={{ background: "radial-gradient(circle at 40% 40%, #6BCB77, #2d5a2d)" }} />
      </div>

      <div className="absolute bottom-[22%] right-[8%]" style={{ animation: "sway 7s ease-in-out infinite", animationDelay: "-2s" }}>
        <div className="w-5 h-20 bg-amber-800 mx-auto rounded" />
        <div className="w-24 h-24 bg-green-700 rounded-full -mt-10 mx-auto" style={{ background: "radial-gradient(circle at 40% 40%, #5cb85c, #1a3a1a)" }} />
      </div>

      <div className="absolute bottom-[20%] left-[35%]" style={{ animation: "sway 5s ease-in-out infinite", animationDelay: "-4s" }}>
        <div className="w-3 h-12 bg-amber-800 mx-auto rounded" />
        <div className="w-16 h-16 bg-green-500 rounded-full -mt-6 mx-auto" style={{ background: "radial-gradient(circle at 40% 40%, #7ed87e, #3d7a3d)" }} />
      </div>

      {/* Flowers */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-xl"
          style={{
            bottom: `${8 + (i % 3) * 5}%`,
            left: `${10 + i * 15}%`,
            animation: `sway ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * -0.8}s`,
          }}
        >
          {["🌸", "🌼", "🌺", "🌻", "🌷", "💐"][i]}
        </div>
      ))}

      {/* Butterflies */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`bf-${i}`}
          className="absolute text-lg"
          style={{
            top: `${30 + i * 10}%`,
            left: `${20 + i * 25}%`,
            animation: `butterfly-fly ${5 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * -2}s`,
          }}
        >
          🦋
        </div>
      ))}
    </div>
  );
}
