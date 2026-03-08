import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();

  function isActive(path) {
    return location.pathname === path;
  }

  const baseLinkClass =
    "rounded-lg px-3.5 py-1.5 text-sm font-body transition-all duration-150";
  const inactiveLinkClass =
    "bg-transparent text-text-secondary hover:bg-card hover:text-text-primary";
  const activeLinkClass = "bg-teal/15 text-teal font-bold";

  return (
    <nav className="sticky top-0 z-[100] flex h-[60px] items-center justify-between bg-base px-8 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <button
        type="button"
        className="flex items-center gap-2 bg-transparent text-[20px]"
        onClick={() => navigate("/")}
      >
        🧪
        <span className="font-heading text-[22px] tracking-[2px] text-teal">
          TestTube
        </span>
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`${baseLinkClass} ${isActive("/practice") ? activeLinkClass : inactiveLinkClass}`}
          onClick={() => navigate("/practice")}
        >
          Exams
        </button>
        <button
          type="button"
          className={`${baseLinkClass} ${isActive("/dashboard") ? activeLinkClass : inactiveLinkClass}`}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
        {isAdmin && (
          <button
            type="button"
            className={`${baseLinkClass} ${isActive("/admin") ? activeLinkClass : "bg-warning-bg text-warning font-semibold"}`}
            onClick={() => navigate("/admin")}
          >
            ⚙️ Admin
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden max-w-[180px] truncate font-body text-[13px] text-text-secondary md:block">
          {user?.email}
        </span>
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3.5 py-1.5 font-body text-[13px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          onClick={signOut}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
