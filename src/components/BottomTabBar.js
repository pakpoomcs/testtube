// src/components/BottomTabBar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, profile } = useAuth();

  const showBadge = profile && !profile.onboarding_completed;

  const tabs = [
    { label: "Home", icon: "🏠", path: "/" },
    { label: "Practice", icon: "📝", path: "/practice" },
    { label: "Progress", icon: "📊", path: "/dashboard" },
    { label: "Profile", icon: "👤", path: "/profile", badge: showBadge },
    ...(isAdmin ? [{ label: "Admin", icon: "⚙️", path: "/admin" }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-elevated border-t border-border flex items-center justify-around z-50"
         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] bg-transparent border-none cursor-pointer py-2 relative"
          >
            {/* Active pill at top */}
            {active && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-teal rounded-b-sm" />
            )}

            {/* Icon + badge */}
            <div className="relative flex items-center justify-center">
              <span className={`text-[20px] transition-all duration-200 ${active ? "opacity-100" : "opacity-30"}`}>
                {tab.icon}
              </span>
              {tab.badge && (
                <div className="absolute -top-0.5 -right-1 w-[7px] h-[7px] bg-danger rounded-full border-2 border-elevated" />
              )}
            </div>

            {/* Label */}
            <span className={`text-[11px] font-body transition-all duration-200 ${
              active ? "font-bold text-teal" : "font-medium text-text-tertiary"
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
