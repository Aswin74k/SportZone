import React from "react";

const Logo = ({ fontSize = "2.5rem", light = false }) => {
  return (
    <span 
      className="sz-brand-text position-relative d-inline-block" 
      style={{ 
        fontFamily: "'Arial Black', Impact, sans-serif", 
        fontSize: fontSize,
        fontWeight: 900,
        fontStyle: "italic",
        letterSpacing: "-1.5px",
        lineHeight: 1,
        userSelect: "none"
      }}
    >
      <span style={{ color: light ? "#ffffff" : "#003366", marginRight: "1px" }}>SPORT</span>
      <span style={{ color: light ? "#f8fafc" : "#0f172a", position: "relative", display: "inline-block", zIndex: 0 }}>
        ZONE
        {/* Premium athletic gradient swoosh */}
        <svg 
          viewBox="0 0 100 25" 
          preserveAspectRatio="none"
          style={{ 
            position: "absolute", 
            left: "-4%", 
            bottom: "-0.25em", 
            width: "108%", 
            height: "0.38em",
            zIndex: -1,
            overflow: "visible"
          }}
        >
          <defs>
            <linearGradient id="sz-swoosh-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path 
            d="M 0,6 C 30,28 70,28 100,-2 C 70,18 30,14 0,6 Z" 
            fill="url(#sz-swoosh-gradient)" 
          />
        </svg>
      </span>
    </span>
  );
};

export default Logo;

