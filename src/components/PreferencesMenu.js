import React, { useRef, useEffect, useState } from "react";
import { usePreferences } from "../context/PreferencesContext";

const EXAMS = ["IELTS", "TOEFL", "TOEIC", "SAT", "GED", "DET", "ONET", "TCAS"];
const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "elementary", label: "Elementary" },
  { value: "intermediate", label: "Intermediate" },
  { value: "upper_intermediate", label: "Upper Intermediate" },
  { value: "advanced", label: "Advanced" },
];
const GOALS = [5, 10, 20, 30];

function PreferencesMenu({ isOpen, onClose, triggerRef }) {
  const { preferences, updatePreferences } = usePreferences();
  const menuRef = useRef(null);
  const [form, setForm] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(preferences);
  }, [preferences]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !triggerRef?.current?.contains(e.target)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  function toggleExam(exam) {
    setForm((prev) => ({
      ...prev,
      target_exams: prev.target_exams.includes(exam)
        ? prev.target_exams.filter((e) => e !== exam)
        : [...prev.target_exams, exam],
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await updatePreferences(form);
      onClose();
    } catch (err) {
      setError(err?.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={menuRef}
        className="absolute right-4 top-[calc(64px+env(safe-area-inset-top)+8px)] w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/[0.12] bg-card/80 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.4),inset_0_0.5px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-[1.8]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-body text-[14px] font-bold text-text-primary">
            Your Preferences
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-card/70 hover:text-text-primary"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-danger/35 bg-danger/12 p-2 text-[12px] text-danger">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* English Level */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              English Level
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, self_assessed_level: level.value }))
                  }
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    form.self_assessed_level === level.value
                      ? "border-white/[0.18] bg-white/[0.1] text-text-primary"
                      : "border-white/[0.06] bg-white/[0.03] text-text-secondary hover:border-white/[0.12] hover:bg-white/[0.06]"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Exams */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Target Exams
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMS.map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => toggleExam(exam)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    form.target_exams.includes(exam)
                      ? "border-white/[0.18] bg-white/[0.1] text-text-primary"
                      : "border-white/[0.06] bg-white/[0.03] text-text-secondary hover:border-white/[0.12] hover:bg-white/[0.06]"
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Daily Goal
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, daily_goal: goal }))}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    form.daily_goal === goal
                      ? "border-white/[0.18] bg-white/[0.1] text-text-primary"
                      : "border-white/[0.06] bg-white/[0.03] text-text-secondary hover:border-white/[0.12] hover:bg-white/[0.06]"
                  }`}
                >
                  {goal}q
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] font-semibold text-text-secondary transition-all duration-200 hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg border border-teal/30 bg-teal/[0.12] px-3 py-2 text-[12px] font-bold text-teal backdrop-blur-md transition-all duration-200 hover:bg-teal/[0.2] disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreferencesMenu;
