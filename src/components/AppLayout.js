// src/components/AppLayout.js
import React from "react";
import { useLocation } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";

const HIDE_CHROME = ["/test", "/report", "/onboarding", "/auth"];

function AppLayout({ children }) {
  const { pathname } = useLocation();
  const hideChrome = HIDE_CHROME.some((p) => pathname.startsWith(p));

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_90%,rgba(125,211,252,0.08),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.08),transparent_30%)]" />

      {!hideChrome && (
        <header className="relative z-20 mx-auto flex max-w-[980px] items-center justify-between px-4 pb-1 pt-[calc(env(safe-area-inset-top)+14px)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/15">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 3h6v2H9zM10 5v6l-4 7h12l-4-7V5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 15h8" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <span className="font-body text-[18px] font-bold tracking-[0.3px] text-text-primary">
              TestTube
            </span>
          </div>
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/50 text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L20 20" strokeLinecap="round" />
            </svg>
          </button>
        </header>
      )}

      <div className={`relative z-10 ${!hideChrome ? "pb-24" : ""}`}>{children}</div>

      {!hideChrome && <BottomTabBar />}
    </div>
  );
}

export default AppLayout;
