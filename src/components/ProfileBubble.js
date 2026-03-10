import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PreferencesMenu from "./PreferencesMenu";

function ProfileBubble({ isMenuOpen, onMenuToggle, onMenuClose }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const buttonRef = useRef(null);

  const displayName = profile?.full_name || profile?.username || "User";
  const initials = useMemo(() => {
    const source = displayName || user?.email || "U";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() || "")
      .join("");
  }, [displayName, user?.email]);

  // Not logged in — show sign-in and sign-up buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="rounded-full border border-teal/40 bg-teal/[0.06] px-4 py-2 font-body text-[13px] font-bold text-teal backdrop-blur-md transition-all duration-200 hover:border-teal/60 hover:bg-teal/[0.12]"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => navigate("/auth", { state: { defaultMode: "signup" } })}
          className="rounded-full bg-teal px-4 py-2 font-body text-[13px] font-bold text-white transition-colors hover:brightness-110"
        >
          Sign up
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onMenuToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] backdrop-blur-lg transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.08]"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 font-body text-[12px] font-bold text-text-primary">
            {initials || "U"}
          </div>
        )}
      </button>

      <PreferencesMenu
        isOpen={isMenuOpen}
        onClose={onMenuClose}
        triggerRef={buttonRef}
      />
    </>
  );
}

export default ProfileBubble;
