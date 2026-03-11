// src/pages/PricingPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";

const FEATURES_FREE = [
  "50 questions per day",
  "All free exams (IELTS, TOEIC, SAT, TOEFL)",
  "Detailed explanations",
  "Progress dashboard",
  "Streak tracking",
];

const FEATURES_PREMIUM = [
  "Unlimited questions every day",
  "All exams + premium question sets",
  "Priority access to new exams",
  "Advanced topic performance analytics",
  "Everything in Free",
];

function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, questionsRemaining, FREE_DAILY_LIMIT } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleUpgrade() {
    if (!user) { navigate("/auth", { state: { returnTo: "/pricing" } }); return; }
    setLoading(true);
    setError(null);
    try {
      // TODO: replace with real Stripe checkout session call
      // const res = await fetch("/api/create-checkout-session", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userId: user.id, priceId: "price_XXXXX" }),
      // });
      // const { url } = await res.json();
      // window.location.href = url;

      // Placeholder — remove when Stripe is wired up
      setError("Payment processing coming soon. Check back shortly!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tt-page">
      <div className="mx-auto max-w-[980px] px-4 py-8 pb-24">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-teal mb-4">
            Simple Pricing
          </span>
          <h1 className="font-heading text-[clamp(32px,6vw,48px)] text-text-primary leading-tight">
            Study smarter,<br />not harder.
          </h1>
          <p className="font-body text-[15px] text-text-secondary mt-3 max-w-[400px] mx-auto leading-relaxed">
            Start free — upgrade when you're ready to go unlimited.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-[700px] mx-auto">

          {/* Free */}
          <div className="tt-panel p-6 flex flex-col gap-5">
            <div>
              <p className="font-body text-[12px] font-bold uppercase tracking-widest text-text-tertiary mb-2">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-[42px] text-text-primary leading-none">฿0</span>
                <span className="font-body text-[14px] text-text-secondary">/month</span>
              </div>
              <p className="font-body text-[13px] text-text-secondary mt-1">Forever free.</p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-2.5 font-body text-[13px] text-text-secondary">
                  <svg viewBox="0 0 16 16" className="h-4 w-4 text-teal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {!isPremium && (
              <div className="mt-auto rounded-xl border border-border bg-card/40 px-4 py-2.5 text-center">
                <p className="font-body text-[13px] font-semibold text-text-primary">
                  {questionsRemaining === FREE_DAILY_LIMIT
                    ? "Your current plan"
                    : `${questionsRemaining} questions left today`}
                </p>
              </div>
            )}
          </div>

          {/* Premium */}
          <div className="tt-panel p-6 flex flex-col gap-5 relative overflow-hidden border-teal/30">
            {/* Glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal/15 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-body text-[12px] font-bold uppercase tracking-widest text-teal">Premium</p>
                <span className="rounded-full bg-teal/15 border border-teal/25 px-2 py-0.5 text-[10px] font-bold text-teal uppercase tracking-wider">
                  Best value
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-[42px] text-text-primary leading-none">฿99</span>
                <span className="font-body text-[14px] text-text-secondary">/month</span>
              </div>
              <p className="font-body text-[13px] text-text-secondary mt-1">Cancel anytime.</p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {FEATURES_PREMIUM.map((f) => (
                <li key={f} className="flex items-start gap-2.5 font-body text-[13px] text-text-secondary">
                  <svg viewBox="0 0 16 16" className="h-4 w-4 text-teal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {isPremium ? (
                <div className="rounded-xl bg-teal/10 border border-teal/25 px-4 py-3 text-center">
                  <p className="font-body text-[13px] font-bold text-teal">✓ You're on Premium</p>
                </div>
              ) : (
                <>
                  {error && (
                    <p className="font-body text-[12px] text-warning text-center mb-3">{error}</p>
                  )}
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl bg-teal text-base font-body font-bold text-[15px] border-none cursor-pointer shadow-[0_8px_24px_rgba(20,184,166,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 ${loading ? "opacity-60" : "opacity-100"}`}
                  >
                    {loading ? "Loading…" : "Upgrade to Premium →"}
                  </button>
                  <p className="font-body text-[11px] text-text-tertiary text-center mt-2">
                    PromptPay · TrueMoney · Credit card
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-[560px] mx-auto flex flex-col gap-4">
          <h2 className="font-body font-bold text-[16px] text-text-primary text-center mb-2">Common questions</h2>
          {[
            { q: "Can I cancel anytime?", a: "Yes — cancel from your profile and you'll keep premium until the end of the billing period." },
            { q: "What payment methods are accepted?", a: "PromptPay, TrueMoney Wallet, credit/debit cards, and bank QR code." },
            { q: "Do unused questions carry over?", a: "No — the free 50-question daily limit resets at midnight each day." },
            { q: "Is there a student discount?", a: "Coming soon. Follow us on social for announcements." },
          ].map(({ q, a }) => (
            <div key={q} className="tt-panel-soft p-4 rounded-xl border border-border/50">
              <p className="font-body font-bold text-[14px] text-text-primary mb-1">{q}</p>
              <p className="font-body text-[13px] text-text-secondary leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
