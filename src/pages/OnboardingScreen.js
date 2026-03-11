// src/pages/OnboardingScreen.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";

const EXAMS = [
  { key: "IELTS", label: "IELTS", sub: "Global English proficiency" },
  { key: "TOEFL", label: "TOEFL iBT", sub: "University-level English" },
  { key: "TOEIC", label: "TOEIC", sub: "Workplace English" },
  { key: "SAT", label: "SAT", sub: "US college admissions" },
  { key: "DET", label: "Duolingo DET", sub: "Online English test" },
  { key: "GED", label: "GED", sub: "High school equivalency" },
  { key: "O-NET", label: "O-NET", sub: "สอบวัดผลการศึกษาระดับชาติ" },
  { key: "TCAS", label: "TCAS", sub: "Thai university entrance" },
];

const LEVELS = [
  { key: "beginner", label: "Beginner", desc: "Just starting out" },
  { key: "intermediate", label: "Intermediate", desc: "Some experience" },
  { key: "advanced", label: "Advanced", desc: "Near exam-ready" },
];

const GOALS = [
  { value: 10, label: "10 questions", sub: "~10 min/day" },
  { value: 20, label: "20 questions", sub: "~20 min/day" },
  { value: 30, label: "30 questions", sub: "~30 min/day" },
];

const TOTAL_STEPS = 3;

function OnboardingScreen() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const { updatePreferences } = usePreferences();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [fullName, setFullName] = useState("");
  const [selectedExams, setSelectedExams] = useState([]);
  const [level, setLevel] = useState("intermediate");
  const [dailyGoal, setDailyGoal] = useState(20);

  function toggleExam(key) {
    setSelectedExams((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function canAdvance() {
    if (step === 1) return fullName.trim().length >= 2;
    if (step === 2) return selectedExams.length > 0;
    return true;
  }

  async function handleFinish() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ full_name: fullName.trim(), onboarding_completed: true });
      await updatePreferences({
        self_assessed_level: level,
        target_exams: selectedExams,
        daily_goal: dailyGoal,
      });
      navigate("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else handleFinish();
  }

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="tt-page relative flex items-center justify-center overflow-hidden p-6">
      {/* Background accents */}
      <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-teal/15 blur-3xl pointer-events-none" />
      <div className="absolute -right-16 bottom-20 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

      <div className="tt-panel relative z-10 w-full max-w-[480px] overflow-hidden">
        {/* Progress bar */}
        <div className="h-[3px] bg-border">
          <div
            className="h-[3px] bg-teal transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[20px]">🧪</span>
              <span className="font-heading text-[18px] text-teal tracking-[2px]">TestTube</span>
            </div>
            <span className="font-body text-[13px] text-text-tertiary">
              {step} / {TOTAL_STEPS}
            </span>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="font-body font-bold text-[24px] text-text-primary leading-tight">
                  Welcome! What's your name?
                </h1>
                <p className="font-body text-[14px] text-text-secondary mt-1.5">
                  We'll personalise your experience.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[13px] font-semibold text-text-secondary">
                  Full name
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Pakpoom Sungtong"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
                  className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-[15px] font-body text-text-primary outline-none transition-colors focus:border-teal"
                />
              </div>
            </div>
          )}

          {/* Step 2: Target exams */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="font-body font-bold text-[24px] text-text-primary leading-tight">
                  Which exams are you preparing for?
                </h1>
                <p className="font-body text-[14px] text-text-secondary mt-1.5">
                  Pick one or more — you can change this later.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EXAMS.map(({ key, label, sub }) => {
                  const selected = selectedExams.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleExam(key)}
                      className={`flex flex-col items-start gap-0.5 rounded-xl border-[1.5px] px-4 py-3 text-left transition-all duration-150 cursor-pointer ${
                        selected
                          ? "border-teal bg-teal/10 text-teal"
                          : "border-border bg-card text-text-primary hover:border-border-strong"
                      }`}
                    >
                      <span className="font-body font-bold text-[14px]">{label}</span>
                      <span className={`font-body text-[11px] leading-snug ${selected ? "text-teal/80" : "text-text-tertiary"}`}>
                        {sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Level + Daily goal */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-body font-bold text-[24px] text-text-primary leading-tight">
                  Almost done!
                </h1>
                <p className="font-body text-[14px] text-text-secondary mt-1.5">
                  Set your level and daily practice goal.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-body font-semibold text-[13px] text-text-secondary">Current level</p>
                <div className="flex flex-col gap-2">
                  {LEVELS.map(({ key, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLevel(key)}
                      className={`flex items-center justify-between rounded-xl border-[1.5px] px-4 py-3 text-left cursor-pointer transition-all duration-150 ${
                        level === key
                          ? "border-teal bg-teal/10"
                          : "border-border bg-card hover:border-border-strong"
                      }`}
                    >
                      <span className={`font-body font-bold text-[14px] ${level === key ? "text-teal" : "text-text-primary"}`}>
                        {label}
                      </span>
                      <span className="font-body text-[12px] text-text-tertiary">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-body font-semibold text-[13px] text-text-secondary">Daily goal</p>
                <div className="flex gap-2">
                  {GOALS.map(({ value, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDailyGoal(value)}
                      className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl border-[1.5px] py-3 cursor-pointer transition-all duration-150 ${
                        dailyGoal === value
                          ? "border-teal bg-teal/10 text-teal"
                          : "border-border bg-card text-text-primary hover:border-border-strong"
                      }`}
                    >
                      <span className="font-body font-bold text-[13px]">{label}</span>
                      <span className={`font-body text-[11px] ${dailyGoal === value ? "text-teal/80" : "text-text-tertiary"}`}>
                        {sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-danger-bg text-danger border border-danger rounded-xl p-3 text-[13px] font-body">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-3 rounded-xl border border-border bg-transparent text-text-secondary font-body font-semibold text-[14px] cursor-pointer hover:border-border-strong transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || saving}
              className={`flex-1 py-3 rounded-xl font-body font-bold text-[15px] border-none text-white transition-all duration-200 hover:-translate-y-0.5 ${
                canAdvance() && !saving
                  ? "bg-teal cursor-pointer shadow-[0_8px_20px_rgba(24,211,188,0.3)]"
                  : "bg-teal/40 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : step === TOTAL_STEPS ? "Start Practicing →" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingScreen;
