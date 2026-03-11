// src/components/Logo.js
// TestTube brand logo — icon + optional wordmark
// Usage:
//   <Logo />                  icon + wordmark, default size
//   <Logo size={48} />        bigger
//   <Logo wordmark={false} /> icon only
//   <Logo variant="light" />  for dark backgrounds (default)

import React from "react";

function Logo({ size = 32, wordmark = true, className = "" }) {
  const h = size;
  const w = Math.round(size * 0.52);     // tube aspect ratio
  const liquidFill = 0.48;               // 48% full

  // Key measurements derived from size
  const tubeW      = w;
  const tubeH      = h;
  const r          = tubeW / 2;          // inner radius
  const wallT      = Math.max(1.5, size * 0.055); // wall thickness
  const tipR       = r - wallT + wallT * 0.4;      // rounded tip radius
  const openingW   = tubeW - wallT * 2;
  const openingX   = wallT;

  // Liquid level (from bottom)
  const liquidY    = tubeH * (1 - liquidFill) - tipR * 0.5;

  // Font sizes scale with the icon
  const fs1 = Math.round(size * 0.72);   // "Test"
  const fs2 = Math.round(size * 0.72);   // "Tube"
  const gap  = Math.round(size * 0.38);  // space between icon and text

  return (
    <span
      className={`inline-flex items-center select-none ${className}`}
      style={{ gap }}
      aria-label="TestTube logo"
    >
      {/* ── Icon ── */}
      <svg
        width={tubeW}
        height={tubeH}
        viewBox={`0 0 ${tubeW} ${tubeH}`}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {/* Liquid gradient — teal with depth */}
          <linearGradient id="tt-liquid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="rgba(20,184,166,0.95)" />
            <stop offset="60%"  stopColor="rgba(13,148,136,0.92)" />
            <stop offset="100%" stopColor="rgba(10,120,108,0.88)" />
          </linearGradient>

          {/* Glass wall gradient — subtle highlight left side */}
          <linearGradient id="tt-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
            <stop offset="35%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
          </linearGradient>

          {/* Liquid shimmer */}
          <linearGradient id="tt-shimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
            <stop offset="50%"  stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
          </linearGradient>

          {/* Clip for liquid (stays inside tube inner wall) */}
          <clipPath id="tt-inner-clip">
            <rect
              x={openingX}
              y={0}
              width={openingW}
              height={tubeH - tipR}
            />
            <circle
              cx={tubeW / 2}
              cy={tubeH - tipR}
              r={tipR}
            />
          </clipPath>
        </defs>

        {/* ── Outer tube shell (dark glass) ── */}
        <rect
          x={wallT / 2}
          y={0}
          width={tubeW - wallT}
          height={tubeH - tipR}
          rx={r * 0.35}
          ry={r * 0.35}
          fill="rgba(30,30,36,0.7)"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth={wallT * 0.7}
        />
        {/* Rounded bottom tip */}
        <circle
          cx={tubeW / 2}
          cy={tubeH - tipR}
          r={tipR + wallT / 2 - wallT * 0.15}
          fill="rgba(30,30,36,0.7)"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth={wallT * 0.7}
        />

        {/* ── Liquid fill (clipped to inner tube) ── */}
        <g clipPath="url(#tt-inner-clip)">
          {/* Liquid body */}
          <rect
            x={openingX}
            y={liquidY}
            width={openingW}
            height={tubeH}
            fill="url(#tt-liquid)"
          />
          {/* Liquid shimmer highlight */}
          <rect
            x={openingX}
            y={liquidY}
            width={openingW * 0.38}
            height={tubeH}
            fill="url(#tt-shimmer)"
          />
          {/* Bubble 1 */}
          <circle
            cx={tubeW * 0.38}
            cy={liquidY + (tubeH - liquidY) * 0.38}
            r={size * 0.042}
            fill="rgba(255,255,255,0.28)"
          />
          {/* Bubble 2 — smaller */}
          <circle
            cx={tubeW * 0.62}
            cy={liquidY + (tubeH - liquidY) * 0.62}
            r={size * 0.025}
            fill="rgba(255,255,255,0.20)"
          />
        </g>

        {/* ── Glass wall highlight (overlay) ── */}
        <rect
          x={openingX}
          y={0}
          width={openingW * 0.35}
          height={tubeH - tipR}
          fill="url(#tt-glass)"
          style={{ pointerEvents: "none" }}
        />

        {/* ── Rim opening (top edge) ── */}
        <rect
          x={0}
          y={0}
          width={tubeW}
          height={wallT * 1.6}
          rx={wallT * 0.8}
          fill="rgba(255,255,255,0.10)"
        />
        <line
          x1={wallT}
          y1={wallT * 0.8}
          x2={tubeW - wallT}
          y2={wallT * 0.8}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={wallT * 0.55}
          strokeLinecap="round"
        />
      </svg>

      {/* ── Wordmark ── */}
      {wordmark && (
        <span
          style={{ fontSize: fs1, lineHeight: 1 }}
          className="font-heading text-text-primary tracking-[0.5px]"
        >
          Test
          <span className="text-teal">Tube</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
