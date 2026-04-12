import React from "react";

export default function StarRating({ percentage }) {
  const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : percentage >= 30 ? 1 : 0;

  return (
    <div className="flex gap-1 items-center justify-center">
      {[1, 2, 3].map((star) => (
        <span
          key={star}
          className={`text-3xl transition-all duration-500 ${
            star <= stars ? "animate-pop-in" : "opacity-30 grayscale"
          }`}
          style={{ animationDelay: `${star * 0.2}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
