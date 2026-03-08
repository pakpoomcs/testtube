// src/pages/AuthScreen.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
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
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created! Check your email to confirm, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
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

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6 relative overflow-hidden">
      {/* Top background accent */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-elevated z-0" />

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl w-full max-w-[420px] relative z-10 overflow-hidden shadow-lg">

        {/* Tab switcher */}
        <div className="flex border-b border-border">
          {["signin", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-4 text-[15px] font-body cursor-pointer border-none transition-all duration-200 ${
                mode === m
                  ? "font-bold text-text-primary bg-card border-b-2 border-teal"
                  : "font-medium text-text-tertiary bg-base border-b-2 border-transparent"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Animated content */}
        <div
          className="p-8 flex flex-col gap-4"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(6px)" : "translateY(0)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-[22px]">🧪</span>
            <span className="font-heading text-[22px] text-teal tracking-[2px]">TestTube</span>
          </div>

          <div>
            <h1 className="font-body font-bold text-[24px] text-text-primary leading-tight">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <p className="font-body text-[14px] text-text-secondary mt-1 leading-relaxed">
              {isSignIn
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
              className="px-4 py-3 rounded-xl border border-border bg-elevated text-text-primary text-[15px] font-body outline-none focus:border-teal transition-colors"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[13px] font-semibold text-text-secondary">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-elevated text-text-primary text-[15px] font-body outline-none focus:border-teal transition-colors"
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

          {!isSignIn && (
            <p className="font-body text-[12px] text-text-tertiary leading-relaxed">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-[14px] rounded-xl text-[16px] font-bold font-body text-white border-none cursor-pointer transition-opacity mt-1 ${
              isSignIn ? "bg-teal" : "bg-teal"
            } ${loading ? "opacity-60" : "opacity-100"}`}
          >
            {loading ? "Please wait..." : isSignIn ? "Sign In →" : "Create Account →"}
          </button>

          {/* Toggle */}
          <p className="font-body text-[14px] text-text-secondary text-center">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(isSignIn ? "signup" : "signin")}
              className="bg-transparent border-none text-teal font-bold text-[14px] font-body cursor-pointer p-0"
            >
              {isSignIn ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
