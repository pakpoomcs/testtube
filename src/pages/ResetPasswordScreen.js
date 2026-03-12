// src/pages/ResetPasswordScreen.js
// Handles the link Supabase emails after resetPasswordForEmail().
// Supabase sets a session via the URL hash — we listen for the
// PASSWORD_RECOVERY event then let the user choose a new password.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Logo from "../components/Logo";

function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);     // session recovered from link
  const [linkExpired, setLinkExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  // Supabase fires PASSWORD_RECOVERY when the user lands via the email link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    const timeout = setTimeout(() => setLinkExpired(true), 30000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleReset() {
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    if (password !== confirm) {
      setError("Passwords don't match."); return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tt-page relative flex items-center justify-center overflow-hidden p-6">
      <div className="absolute -left-20 top-16 h-44 w-44 rounded-full bg-teal/22 blur-3xl pointer-events-none" />
      <div className="absolute -right-8 bottom-12 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

      <div className="tt-panel relative z-10 w-full max-w-[430px] p-8 flex flex-col gap-5">
        <Logo size={26} />

        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg border border-success/30">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-success" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-body font-bold text-[22px] text-text-primary">Password updated!</h1>
            <p className="font-body text-[14px] text-text-secondary">Redirecting you home…</p>
          </div>
        ) : !ready ? (
          <div className="flex flex-col gap-3 py-4">
            <h1 className="font-body font-bold text-[22px] text-text-primary">
              {linkExpired ? "Link expired" : "Waiting for link…"}
            </h1>
            <p className="font-body text-[14px] text-text-secondary leading-relaxed">
              {linkExpired
                ? "This reset link has expired or is invalid. Please request a new one."
                : "Open the reset link from your email to continue. If you didn't request a reset,"}
              {" "}
              <button
                onClick={() => navigate("/auth")}
                className="bg-transparent border-none text-teal font-bold text-[14px] font-body cursor-pointer p-0"
              >
                {linkExpired ? "Request a new link" : "go back"}
              </button>.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-body font-bold text-[24px] text-text-primary leading-tight">
                Choose a new password
              </h1>
              <p className="font-body text-[14px] text-text-secondary mt-1">
                Must be at least 6 characters.
              </p>
            </div>

            {error && (
              <div className="bg-danger-bg text-danger border border-danger rounded-xl p-3 text-[14px] font-body">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[13px] font-semibold text-text-secondary">New password</label>
              <div className="relative flex items-center">
                <input
                  autoFocus
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-card/60 px-4 py-3 pr-12 text-[15px] font-body text-text-primary outline-none transition-colors focus:border-teal"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bg-transparent border-none cursor-pointer text-[16px] text-text-secondary"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[13px] font-semibold text-text-secondary">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-[15px] font-body text-text-primary outline-none transition-colors focus:border-teal"
              />
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className={`w-full rounded-xl py-[14px] text-[16px] font-body font-bold text-white border-none cursor-pointer bg-teal shadow-[0_10px_26px_rgba(24,211,188,0.34)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 ${loading ? "opacity-60" : "opacity-100"}`}
            >
              {loading ? "Updating…" : "Set New Password →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordScreen;
