import React from "react";

const Logo = ({ fontSize = "2.5rem" }) => {
  return (
    <span 
      className="sz-brand-text position-relative d-inline-block" 
      style={{ 
        fontFamily: "'Arial Black', Impact, sans-serif", 
        fontSize: fontSize,
        fontWeight: 900,
        fontStyle: "italic",
        letterSpacing: "-2px",
        lineHeight: 1
      }}
    >
      <span style={{ color: "#003366", marginRight: "1px" }}>SPORT</span>
      <span style={{ color: "#000000", position: "relative", display: "inline-block", zIndex: 0 }}>
        ZONE
        {/* Independent dynamic swoosh */}
        <svg 
          viewBox="0 0 100 25" 
          preserveAspectRatio="none"
          style={{ 
            position: "absolute", 
            left: "-3%", 
            bottom: "-0.2em", 
            width: "88%", 
            height: "0.35em",
            zIndex: -1,
            overflow: "visible"
          }}
        >
          <path 
            d="M 0,5 C 25,30 65,30 100,-5 C 65,20 25,15 0,5 Z" 
            fill="#000000" 
          />
        </svg>
      </span>
    </span>
  );
};

export default Logo;
