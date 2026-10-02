"use client";

import React from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  variant?: "light" | "dark";
}

export default function Logo({
  size = "medium",
  showText = true,
  variant = "light",
}: LogoProps) {
  const iconSizes = {
    small: 26,
    medium: 34,
    large: 48,
  };

  const currentSize = iconSizes[size] || 34;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "small" ? "8px" : "10px",
        userSelect: "none",
      }}
    >
      {/* Modern Gradient POS & Inventory SVG Emblem */}
      <svg
        width={currentSize}
        height={currentSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 2px 8px rgba(0, 210, 255, 0.35))",
          flexShrink: 0,
        }}
      >
        <defs>
          <linearGradient id="dposGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="50%" stopColor="#3a7bd5" />
            <stop offset="100%" stopColor="#00e676" />
          </linearGradient>
          <linearGradient id="dposGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c6ff" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>
          <linearGradient id="dposGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2af598" />
            <stop offset="100%" stopColor="#009efd" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon Shield Badge */}
        <path
          d="M50 5 L88 27 L88 73 L50 95 L12 73 L12 27 Z"
          fill="url(#dposGrad1)"
          opacity="0.12"
          stroke="url(#dposGrad1)"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* 3D Isometric Inventory Box & Cart Lines */}
        {/* Top Face of Box */}
        <polygon
          points="50,22 75,36 50,50 25,36"
          fill="url(#dposGlow)"
          opacity="0.85"
        />

        {/* Left Face of Box */}
        <polygon
          points="25,36 50,50 50,78 25,64"
          fill="url(#dposGrad2)"
          opacity="0.9"
        />

        {/* Right Face of Box */}
        <polygon
          points="50,50 75,36 75,64 50,78"
          fill="url(#dposGrad1)"
          opacity="0.95"
        />

        {/* Inner Box Ribbon / Smart Accent Line */}
        <path
          d="M50 22 L50 50 M25 36 L50 50 L75 36"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Upward Growth Arrow (Fast POS Checkout) */}
        <path
          d="M40 70 L65 42 M52 42 L65 42 L65 55"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Smart Sparkle Dot */}
        <circle cx="75" cy="25" r="4" fill="#00e676" />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 800,
              fontSize: size === "small" ? "1.05rem" : size === "large" ? "1.6rem" : "1.25rem",
              letterSpacing: "0.5px",
              color: variant === "dark" ? "#1e293b" : "#ffffff",
            }}
          >
            <span>DPOS</span>
            <span
              style={{
                fontSize: size === "small" ? "0.65rem" : "0.75rem",
                padding: "2px 6px",
                borderRadius: "4px",
                background: "linear-gradient(135deg, #00d2ff, #00e676)",
                color: "#0f172a",
                fontWeight: 900,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              PRO
            </span>
          </div>
          <span
            style={{
              fontSize: size === "small" ? "0.55rem" : "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.5px",
              color: variant === "dark" ? "#64748b" : "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            POS & Inventory
          </span>
        </div>
      )}
    </div>
  );
}
