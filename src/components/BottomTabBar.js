// src/components/BottomTabBar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Icon({ name, active }) {
  const cls = active ? "text-text-primary" : "text-text-secondary/80";
  const stroke = active ? 2 : 1.8;
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "practice":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={stroke}>
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
        </svg>
      );
    case "progress":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path d="M4 20V11M10 20V7M16 20V13M22 20V4" strokeLinecap="round" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={stroke}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.6-3.2 4.3-5 8-5s6.4 1.8 8 5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path d="M12 3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L12 3z" />
        </svg>
      );
  }
}

function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, profile } = useAuth();

  const showBadge = profile && !profile.onboarding_completed;

  const tabs = [
    { label: "Home", icon: "home", path: "/" },
    { label: "Practice", icon: "practice", path: "/practice" },
    { label: "Progress", icon: "progress", path: "/dashboard" },
    { label: "Profile", icon: "profile", path: "/profile", badge: showBadge },
    ...(isAdmin ? [{ label: "Admin", icon: "admin", path: "/admin" }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(66px+env(safe-area-inset-bottom))] items-start justify-around border-t border-border/60 bg-card/70 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-8px_18px_rgba(3,10,20,0.14)] backdrop-blur-xl">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="tt-interactive relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-[3px] bg-transparent py-1.5"
          >
            {/* Active pill at top */}
            {active && (
              <div className="absolute left-1/2 top-0 h-[2px] w-6 -translate-x-1/2 rounded-b-sm bg-text-primary/80" />
            )}

            {/* Icon + badge */}
            <div className="relative flex items-center justify-center">
              <span className={`transition-all duration-200 ${active ? "scale-105 opacity-100" : "opacity-70"}`}>
                <Icon name={tab.icon} active={active} />
              </span>
              {tab.badge && (
                <div className="absolute -right-1 -top-0.5 h-[7px] w-[7px] rounded-full border-2 border-card bg-danger" />
              )}
            </div>

            {/* Label */}
            <span className={`text-[11px] font-body transition-all duration-200 ${
              active ? "font-semibold text-text-primary" : "font-medium text-text-secondary/90"
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BottomTabBar;
