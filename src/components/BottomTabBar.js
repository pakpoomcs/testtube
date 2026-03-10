// src/components/BottomTabBar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function BottomTabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { label: "Home", icon: "home", path: "/" },
    { label: "Explore", icon: "explore", path: "/practice" },
    { label: "Progress", icon: "progress", path: "/dashboard" },
    { label: "Profile", icon: "profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(64px+env(safe-area-inset-bottom))] items-start justify-around border-t border-border/50 bg-card/75 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-6px_20px_rgba(3,10,20,0.18)] backdrop-blur-xl">
      {tabs.map((tab) => {
        const active =
          tab.path === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="relative flex flex-1 cursor-pointer flex-col items-center gap-[3px] bg-transparent py-1"
          >
            {active && (
              <div className="absolute left-1/2 top-0 h-[2px] w-6 -translate-x-1/2 rounded-b-sm bg-text-primary/70" />
            )}
            <span className={`transition-all duration-200 ${active ? "opacity-100" : "opacity-50"}`}>
              <TabIcon name={tab.icon} active={active} />
            </span>
            <span
              className={`font-body text-[11px] transition-all duration-200 ${
                active
                  ? "font-semibold text-text-primary"
                  : "font-medium text-text-secondary/70"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function TabIcon({ name, active }) {
  const cls = active ? "text-text-primary" : "text-text-secondary";
  const sw = active ? 2 : 1.7;

  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "explore":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <circle cx="12" cy="12" r="9" />
          <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z" strokeLinejoin="round" />
        </svg>
      );
    case "progress":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M4 20V11M10 20V7M16 20V13M22 20V4" strokeLinecap="round" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className={`h-[20px] w-[20px] ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.6-3.2 4.3-5 8-5s6.4 1.8 8 5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default BottomTabBar;
