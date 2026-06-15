import React from "react";

/* The Jenash brandmark, recreated as crisp vector so it scales
   anywhere (header, splash, favicon). variant: "row" | "stacked" | "mark" */

function Mark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {/* navy J */}
      <path
        d="M66 22 L66 62 Q66 80 47 80 Q34 80 32 66"
        fill="none"
        stroke="#1f3a6b"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* orange up-arrow */}
      <path d="M40 80 L40 46" stroke="#ec7a2c" strokeWidth="12" strokeLinecap="round" />
      <path d="M40 28 L24 50 L56 50 Z" fill="#ec7a2c" />
    </svg>
  );
}

export default function Logo({ variant = "row", onLight = false }) {
  const wordColor = onLight ? "#ffffff" : "#1f3a6b";

  if (variant === "mark") return <Mark size={36} />;

  if (variant === "stacked") {
    return (
      <div className="jn-brand stacked">
        <span className="jn-brand-word" style={{ color: wordColor, fontSize: 52 }}>
          Jenash
        </span>
        <Mark size={64} />
        <span className="jn-brand-pill">E-COMMERCE</span>
      </div>
    );
  }

  // row (header / footer)
  return (
    <div className="jn-brand row">
      <Mark size={36} />
      <div className="jn-brand-stack">
        <span className="jn-brand-word" style={{ color: wordColor }}>
          Jenash
        </span>
        <span className="jn-brand-tag" style={{ color: onLight ? "#aab6d6" : "#697086" }}>
          E-COMMERCE
        </span>
      </div>
    </div>
  );
}
