// src/components/PageTransition.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function PageTransition({ children }) {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  const [showChildren, setShowChildren] = useState(true);
  const [phase, setPhase] = useState("idle"); // idle | cover | reveal
  const prevPath = useRef(location.pathname);
  const timeouts = useRef([]);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    // Clear any pending timeouts
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    setTransitioning(true);
    setPhase("cover");

    // After cover animation completes, swap children and reveal
    timeouts.current.push(
      setTimeout(() => {
        setShowChildren(false);
        // Brief moment to let new page mount
        timeouts.current.push(
          setTimeout(() => {
            setShowChildren(true);
            setPhase("reveal");
            timeouts.current.push(
              setTimeout(() => {
                setPhase("idle");
                setTransitioning(false);
              }, 400)
            );
          }, 80)
        );
      }, 350)
    );

    return () => timeouts.current.forEach(clearTimeout);
  }, [location.pathname]);

  return (
    <>
      {showChildren && children}

      {transitioning && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          style={{ perspective: "600px" }}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              phase === "cover"
                ? "opacity-100"
                : phase === "reveal"
                  ? "opacity-0"
                  : "opacity-0"
            }`}
            style={{ background: "rgb(var(--color-base))" }}
          />

          {/* Logo mark */}
          <div
            className={`relative flex flex-col items-center gap-3 transition-all ${
              phase === "cover"
                ? "duration-300 opacity-100 scale-100 translate-y-0"
                : phase === "reveal"
                  ? "duration-300 opacity-0 scale-95 -translate-y-3"
                  : "opacity-0"
            }`}
          >
            {/* Flask icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M9 3h6v2H9zM10 5v6l-4 7h12l-4-7V5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8 15h8" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>

            {/* Text with letter stagger */}
            <div className="flex items-baseline gap-[1px]">
              {"TestTube".split("").map((char, i) => (
                <span
                  key={i}
                  className="font-body font-bold text-[22px] text-text-primary"
                  style={{
                    display: "inline-block",
                    animation:
                      phase === "cover"
                        ? `ttFadeInUp 0.3s ${i * 0.03}s both ease-out`
                        : undefined,
                    opacity: phase === "cover" ? 0 : 1,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* Subtle line */}
            <div
              className={`h-[2px] rounded-full bg-teal/40 transition-all duration-500 ease-out ${
                phase === "cover" ? "w-16 opacity-100" : "w-0 opacity-0"
              }`}
              style={{ transitionDelay: phase === "cover" ? "0.15s" : "0s" }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default PageTransition;
