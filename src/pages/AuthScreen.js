// src/pages/AuthScreen.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Logo from "../components/Logo";

function AuthScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = location.state?.defaultMode === "signup" ? "signup" : "signin";
  const returnTo = location.state?.returnTo;
  const [mode, setMode] = useState(initialMode); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [animating, setAnimating] = useState(false);

  async function handleSubmit() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("Check your email — we sent a password reset link.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          navigate("/onboarding");
        } else {
          setMessage("Account created! Check your email to confirm, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(returnTo || "/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  function switchMode(newMode) {
    if (newMode === mode || animating) return;
    setAnimating(true);
    setError(null);
    setMessage(null);
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 200);
  }

  const isSignIn = mode === "signin";
  const isForgot = mode === "forgot";

  return (
    <div className="tt-page relative flex items-center justify-center overflow-hidden p-6">
      {/* Top background accent */}
      <div className="absolute left-0 right-0 top-0 z-0 h-1/2 bg-elevated/45" />
      <div className="absolute -left-20 top-16 h-44 w-44 rounded-full bg-teal/22 blur-3xl" />
      <div className="absolute -right-8 bottom-12 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />

      {/* Card */}
      <div className="tt-panel relative z-10 w-full max-w-[430px] overflow-hidden">

        {/* Tab switcher — hidden on forgot mode */}
        {!isForgot && (
          <div className="flex border-b border-border">
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-4 text-[15px] font-body cursor-pointer border-none transition-all duration-200 ${
                  mode === m
                    ? "bg-card/40 font-bold text-text-primary border-b-2 border-teal"
                    : "bg-transparent font-medium text-text-tertiary border-b-2 border-transparent"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {/* Animated content */}
        <div
          className={`flex flex-col gap-4 p-8 transition-all duration-200 ${
            animating ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <Logo size={26} />

          <div>
            <h1 className="font-body font-bold text-[24px] text-text-primary leading-tight">
              {isForgot ? "Reset your password" : isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <p className="font-body text-[14px] text-text-secondary mt-1 leading-relaxed">
              {isForgot
                ? "Enter your email and we'll send you a reset link."
                : isSignIn
                  ? "Sign in to continue your test prep."
                  : "Join students preparing smarter across Thailand."}
            </p>
          </div>

          {error && (
            <div className="bg-danger-bg text-danger border border-danger rounded-xl p-3 text-[14px] font-body">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-success-bg text-success border border-success rounded-xl p-3 text-[14px] font-body">
              {message}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[13px] font-semibold text-text-secondary">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-[15px] font-body text-text-primary outline-none transition-colors focus:border-teal"
            />
          </div>

          {/* Password — hidden on forgot mode */}
          {!isForgot && (
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[13px] font-semibold text-text-secondary">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-border/60 bg-card/60 px-4 py-3 pr-12 text-[15px] font-body text-text-primary outline-none transition-colors focus:border-teal"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 bg-transparent border-none cursor-pointer text-[16px] text-text-secondary"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          )}

          {!isSignIn && !isForgot && (
            <p className="font-body text-[12px] text-text-tertiary leading-relaxed">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-1 w-full rounded-xl py-[14px] text-[16px] font-body font-bold text-white border-none cursor-pointer shadow-[0_10px_26px_rgba(24,211,188,0.34)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 bg-teal ${loading ? "opacity-60" : "opacity-100"}`}
          >
            {loading ? "Please wait..." : isForgot ? "Send Reset Link →" : isSignIn ? "Sign In →" : "Create Account →"}
          </button>

          {/* Footer links */}
          {isForgot ? (
            <button
              onClick={() => switchMode("signin")}
              className="bg-transparent border-none text-text-secondary font-body text-[14px] cursor-pointer p-0 text-center w-full hover:text-text-primary transition-colors"
            >
              ← Back to sign in
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="font-body text-[14px] text-text-secondary text-center">
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => switchMode(isSignIn ? "signup" : "signin")}
                  className="bg-transparent border-none text-teal font-bold text-[14px] font-body cursor-pointer p-0"
                >
                  {isSignIn ? "Sign up free" : "Sign in"}
                </button>
              </p>
              {isSignIn && (
                <button
                  onClick={() => switchMode("forgot")}
                  className="bg-transparent border-none text-text-tertiary font-body text-[13px] cursor-pointer p-0 hover:text-text-secondary transition-colors"
                >
                  Forgot your password?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
