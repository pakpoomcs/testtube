// src/pages/ProfileScreen.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

const EXAMS = ["IELTS", "TOEFL", "TOEIC", "SAT", "GED", "DET", "ONET", "TCAS"];
const LEVELS = [
  { value: "beginner", label: "🌱 Beginner" },
  { value: "elementary", label: "📘 Elementary" },
  { value: "intermediate", label: "📗 Intermediate" },
  { value: "upper_intermediate", label: "📙 Upper Intermediate" },
  { value: "advanced", label: "🏆 Advanced" },
];
const GOALS = [5, 10, 20, 30];

function ProfileScreen() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    username: profile?.username || "",
    self_assessed_level: profile?.self_assessed_level || null,
    target_exams: profile?.target_exams || [],
    daily_goal: profile?.daily_goal || 10,
  });

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
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id, ...form, onboarding_completed: true,
      });
      if (error) throw error;
      await refreshProfile();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isComplete = profile?.onboarding_completed;
  const initials = form.username ? form.username[0].toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-base px-5 pt-8 pb-24 flex flex-col gap-4">

      {/* Header card */}
      <div className="bg-elevated border border-border rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center text-[22px] font-bold font-body text-base flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="font-body font-bold text-[20px] text-text-primary">{profile?.username || "Your Profile"}</h1>
          <p className="font-body text-[13px] text-text-secondary">{user?.email}</p>
        </div>
      </div>

      {/* Incomplete banner */}
      {!isComplete && !editing && (
        <div className="bg-teal/10 border border-teal/20 rounded-2xl px-5 py-4 flex justify-between items-center gap-3">
          <div>
            <p className="font-body font-bold text-[15px] text-text-primary mb-0.5">🎯 Complete your profile</p>
            <p className="font-body text-[13px] text-text-secondary">Help us personalise your experience</p>
          </div>
          <button onClick={() => setEditing(true)}
            className="bg-teal text-base border-none rounded-xl px-4 py-2.5 font-body font-bold text-[14px] cursor-pointer whitespace-nowrap">
            Set up →
          </button>
        </div>
      )}

      {saved && (
        <div className="bg-success-bg border border-success/30 rounded-xl px-4 py-3 font-body text-[14px] font-semibold text-success">
          ✅ Profile saved successfully!
        </div>
      )}

      {/* Profile section */}
      <div className="bg-elevated border border-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-body font-bold text-[17px] text-text-primary">My Profile</h2>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="bg-transparent border border-teal text-teal rounded-lg px-4 py-1.5 font-body font-semibold text-[13px] cursor-pointer">
              Edit
            </button>
          )}
        </div>

        {/* Username */}
        <Field label="Username">
          {editing ? (
            <input value={form.username} maxLength={30} placeholder="Enter username"
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[15px] font-body outline-none focus:border-teal transition-colors" />
          ) : (
            <p className="font-body text-[15px] text-text-primary font-medium">{profile?.username || "—"}</p>
          )}
        </Field>

        {/* Level */}
        <Field label="English Level">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <Chip key={l.value} active={form.self_assessed_level === l.value}
                  onClick={() => setForm((p) => ({ ...p, self_assessed_level: l.value }))}>
                  {l.label}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="font-body text-[15px] text-text-primary font-medium">
              {LEVELS.find((l) => l.value === profile?.self_assessed_level)?.label || "—"}
            </p>
          )}
        </Field>

        {/* Target exams */}
        <Field label="Target Exams">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {EXAMS.map((exam) => (
                <Chip key={exam} active={form.target_exams.includes(exam)} onClick={() => toggleExam(exam)}>
                  {exam}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="font-body text-[15px] text-text-primary font-medium">
              {profile?.target_exams?.length > 0 ? profile.target_exams.join(", ") : "—"}
            </p>
          )}
        </Field>

        {/* Daily goal */}
        <Field label="Daily Goal">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Chip key={g} active={form.daily_goal === g}
                  onClick={() => setForm((p) => ({ ...p, daily_goal: g }))}>
                  {g} questions
                </Chip>
              ))}
            </div>
          ) : (
            <p className="font-body text-[15px] text-text-primary font-medium">
              {profile?.daily_goal ? `${profile.daily_goal} questions/day` : "—"}
            </p>
          )}
        </Field>

        {editing && (
          <div className="flex gap-2.5 mt-1">
            <button onClick={() => setEditing(false)}
              className="flex-1 py-3 bg-transparent border border-border text-text-secondary rounded-xl font-body font-semibold text-[14px] cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`flex-[2] py-3 bg-teal text-base border-none rounded-xl font-body font-bold text-[14px] cursor-pointer transition-opacity ${saving ? "opacity-60" : "opacity-100"}`}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="bg-elevated border border-border rounded-2xl p-4">
        <button onClick={signOut}
          className="w-full py-3.5 bg-transparent border border-danger/40 text-danger rounded-xl font-body font-semibold text-[15px] cursor-pointer hover:bg-danger-bg transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-body font-semibold text-[12px] text-text-tertiary uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3.5 py-2 rounded-full border font-body font-medium text-[13px] cursor-pointer transition-all duration-150 ${
        active
          ? "border-teal bg-teal/10 text-teal font-semibold"
          : "border-border bg-transparent text-text-secondary hover:border-border-strong"
      }`}>
      {children}
    </button>
  );
}

export default ProfileScreen;
