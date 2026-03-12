// src/components/BottomTabBar.js
import React, { useRef, useLayoutEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TABS = [
  { label: "Home", icon: "home", path: "/" },
  { label: "Explore", icon: "explore", path: "/practice" },
  { label: "Progress", icon: "progress", path: "/dashboard" },
  { label: "Profile", icon: "profile", path: "/profile" },
];

function BottomTabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  const activeIndex = TABS.findIndex((t) =>
    t.path === "/" ? pathname === "/" : pathname.startsWith(t.path)
  );

  const measure = useCallback(() => {
    const activePath = TABS[activeIndex]?.path;
    const el = tabRefs.current[activePath];
    if (!el) return;
    setPill({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
      ready: true,
    });
  }, [activeIndex]);

  // Re-measure whenever the active tab changes or on mount
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Re-measure after fonts/layout settle
  useLayoutEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [measure]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[calc(12px+env(safe-area-inset-bottom))]">
      <nav
        className="relative flex items-center gap-1 rounded-[22px] border border-white/[0.12] px-2 py-1.5"
        style={{
          background: "rgba(30, 30, 36, 0.55)",
          backdropFilter: "blur(48px) saturate(1.9)",
          WebkitBackdropFilter: "blur(48px) saturate(1.9)",
          boxShadow: [
            "0 12px 40px rgba(0,0,0,0.35)",
            "0 2px 8px rgba(0,0,0,0.2)",
            "inset 0 0.5px 0 rgba(255,255,255,0.14)",
            "inset 0 -0.5px 0 rgba(255,255,255,0.04)",
          ].join(", "),
        }}
      >
        {/* Sliding selection pill */}
        <div
          className="pointer-events-none absolute rounded-2xl"
          style={{
            left: pill.left,
            top: pill.top,
            width: pill.width,
            height: pill.height,
            background: "rgba(255, 255, 255, 0.1)",
            boxShadow:
              "inset 0 0.5px 0 rgba(255,255,255,0.14), 0 1px 4px rgba(0,0,0,0.12)",
            transition: pill.ready
              ? "left 400ms cubic-bezier(0.4, 0, 0.1, 1), width 400ms cubic-bezier(0.4, 0, 0.1, 1)"
              : "none",
          }}
        />

        {TABS.map((tab) => {
          const active =
            tab.path === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              ref={(el) => {
                tabRefs.current[tab.path] = el;
              }}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className="relative z-10 flex cursor-pointer items-center gap-1.5 rounded-2xl bg-transparent px-3.5 py-2"
            >
              <span
                className={`transition-opacity duration-250 ${active ? "opacity-100" : "opacity-45"}`}
              >
                <TabIcon name={tab.icon} active={active} />
              </span>
              <span
                className="overflow-hidden font-body text-[12px] font-semibold text-text-primary transition-all duration-350"
                style={{
                  maxWidth: active ? 80 : 0,
                  opacity: active ? 1 : 0,
                  marginLeft: active ? 0 : -6,
                  transition: [
                    "max-width 400ms cubic-bezier(0.4, 0, 0.1, 1)",
                    "opacity 250ms ease",
                    "margin-left 400ms cubic-bezier(0.4, 0, 0.1, 1)",
                  ].join(", "),
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function TabIcon({ name, active }) {
  const cls = active ? "text-text-primary" : "text-text-secondary";
  const size = "h-[18px] w-[18px]";
  const sw = active ? 2 : 1.6;

  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "explore":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <circle cx="12" cy="12" r="9" />
          <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z" strokeLinejoin="round" />
        </svg>
      );
    case "progress":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M4 20V11M10 20V7M16 20V13M22 20V4" strokeLinecap="round" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${cls}`} fill="none" stroke="currentColor" strokeWidth={sw}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.6-3.2 4.3-5 8-5s6.4 1.8 8 5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default BottomTabBar;
