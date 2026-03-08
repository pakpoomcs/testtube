import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import ProfileScreen from "./ProfileScreen";

function ProfileProgressPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tab = pathname.startsWith("/dashboard") ? "progress" : "profile";

  return (
    <div className="tt-page">
      <div className="mx-auto flex w-full max-w-[980px] gap-2 px-4 pb-2 pt-5">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className={`rounded-full border px-4 py-1.5 text-[12px] font-medium ${
            tab === "profile"
              ? "border-border-strong bg-card/85 text-text-primary"
              : "border-border/60 bg-card/45 text-text-secondary hover:border-border-strong"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className={`rounded-full border px-4 py-1.5 text-[12px] font-medium ${
            tab === "progress"
              ? "border-border-strong bg-card/85 text-text-primary"
              : "border-border/60 bg-card/45 text-text-secondary hover:border-border-strong"
          }`}
        >
          Progress
        </button>
      </div>
      {tab === "progress" ? <Dashboard /> : <ProfileScreen />}
    </div>
  );
}

export default ProfileProgressPage;
