import React, { useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import PreferencesMenu from "./PreferencesMenu";

function ProfileBubble({ isMenuOpen, onMenuToggle, onMenuClose }) {
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

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onMenuToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition-all hover:border-border-strong"
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
