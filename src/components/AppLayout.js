// src/components/AppLayout.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import ProfileBubble from "./ProfileBubble";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const HIDE_CHROME = ["/test", "/report", "/onboarding", "/auth"];

function AppLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const hideChrome = HIDE_CHROME.some((p) => pathname.startsWith(p));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Redirect to onboarding if logged in but not yet completed
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (pathname === "/onboarding" || pathname === "/auth") return;
    if (profile && profile.onboarding_completed === false) {
      navigate("/onboarding");
    }
  }, [user, profile, loading, pathname, navigate]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_85%,rgba(20,184,166,0.05),transparent_70%),radial-gradient(ellipse_50%_40%_at_80%_15%,rgba(167,139,250,0.04),transparent_70%)]" />

      {!hideChrome && (
        <header className="relative z-20 mx-auto flex max-w-[980px] items-center justify-between px-4 pb-1 pt-[calc(env(safe-area-inset-top)+14px)]">
          <Logo size={28} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-text-secondary backdrop-blur-lg transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-text-primary"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L20 20" strokeLinecap="round" />
              </svg>
            </button>
            <ProfileBubble
              isMenuOpen={isMenuOpen}
              onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
              onMenuClose={() => setIsMenuOpen(false)}
            />
          </div>
        </header>
      )}

      <div className={`relative z-10 ${!hideChrome ? "pb-24" : ""}`}>{children}</div>

      {!hideChrome && <BottomTabBar />}
    </div>
  );
}

export default AppLayout;
