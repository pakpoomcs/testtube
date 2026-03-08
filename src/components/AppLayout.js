// src/components/AppLayout.js
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HIDE_MENU = ["/test", "/report", "/onboarding", "/auth"];

function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const hideMenu = HIDE_MENU.some((path) => location.pathname.startsWith(path));
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const nameSeed = profile?.full_name || profile?.username || user?.email || "student";
  const initials = nameSeed
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || "")
    .join("") || "S";

  const menuItems = [
    { label: "Home", onClick: () => navigate("/") },
    { label: "Practice", onClick: () => navigate("/practice") },
    { label: "Profile & Progress", onClick: () => navigate("/profile") },
    ...(isAdmin ? [{ label: "Admin", onClick: () => navigate("/admin") }] : []),
    { label: "Sign Out", onClick: signOut, danger: true },
  ];

  return (
    <div className="relative pb-0">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_90%,rgba(125,211,252,0.08),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.08),transparent_30%)]" />
      {!hideMenu && (
        <div ref={menuRef} className="fixed right-4 top-[calc(env(safe-area-inset-top)+10px)] z-40 flex flex-col items-end">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-200/45 bg-gradient-to-br from-cyan-300/18 via-card/80 to-violet-300/14 p-[2px] text-[12px] font-bold text-text-primary shadow-[0_10px_22px_rgba(5,15,30,0.38)] backdrop-blur-xl transition-all hover:border-cyan-100/60"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full border border-white/35 object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-full border border-white/35 bg-card/70">
                {initials}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-2xl border border-border/70 bg-card/85 p-1.5 shadow-[0_16px_30px_rgba(3,10,20,0.35)] backdrop-blur-xl">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                    item.danger
                      ? "text-danger hover:bg-danger/10"
                      : "text-text-primary hover:bg-hover/45"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AppLayout;
