// src/pages/ProfileScreen.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { theme } from "../styles/theme";

const { colors, fonts } = theme;

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
        id: user.id,
        ...form,
        onboarding_completed: true,
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

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {form.username ? form.username[0].toUpperCase() : "?"}
        </div>
        <div>
          <h1 style={styles.name}>{profile?.username || "Your Profile"}</h1>
          <p style={styles.email}>{user?.email}</p>
        </div>
      </div>

      {/* Incomplete banner */}
      {!isComplete && !editing && (
        <div style={styles.banner}>
          <div>
            <div style={styles.bannerTitle}>🎯 Complete your profile</div>
            <div style={styles.bannerSub}>
              Help us personalise your experience
            </div>
          </div>
          <button style={styles.bannerButton} onClick={() => setEditing(true)}>
            Set up →
          </button>
        </div>
      )}

      {saved && (
        <div style={styles.successBanner}>✅ Profile saved successfully!</div>
      )}

      {/* Profile info / edit form */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Profile</h2>
          {!editing && (
            <button style={styles.editButton} onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>

        {/* Username */}
        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          {editing ? (
            <input
              style={styles.input}
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              maxLength={30}
              placeholder="Enter username"
            />
          ) : (
            <p style={styles.value}>{profile?.username || "—"}</p>
          )}
        </div>

        {/* Level */}
        <div style={styles.field}>
          <label style={styles.label}>English Level</label>
          {editing ? (
            <div style={styles.chipRow}>
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  style={
                    form.self_assessed_level === l.value
                      ? styles.chipActive
                      : styles.chip
                  }
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      self_assessed_level: l.value,
                    }))
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          ) : (
            <p style={styles.value}>
              {LEVELS.find((l) => l.value === profile?.self_assessed_level)
                ?.label || "—"}
            </p>
          )}
        </div>

        {/* Target exams */}
        <div style={styles.field}>
          <label style={styles.label}>Target Exams</label>
          {editing ? (
            <div style={styles.chipRow}>
              {EXAMS.map((exam) => (
                <button
                  key={exam}
                  style={
                    form.target_exams.includes(exam)
                      ? styles.chipActive
                      : styles.chip
                  }
                  onClick={() => toggleExam(exam)}
                >
                  {exam}
                </button>
              ))}
            </div>
          ) : (
            <p style={styles.value}>
              {profile?.target_exams?.length > 0
                ? profile.target_exams.join(", ")
                : "—"}
            </p>
          )}
        </div>

        {/* Daily goal */}
        <div style={styles.field}>
          <label style={styles.label}>Daily Goal</label>
          {editing ? (
            <div style={styles.chipRow}>
              {GOALS.map((g) => (
                <button
                  key={g}
                  style={
                    form.daily_goal === g ? styles.chipActive : styles.chip
                  }
                  onClick={() =>
                    setForm((prev) => ({ ...prev, daily_goal: g }))
                  }
                >
                  {g} questions
                </button>
              ))}
            </div>
          ) : (
            <p style={styles.value}>
              {profile?.daily_goal
                ? `${profile.daily_goal} questions/day`
                : "—"}
            </p>
          )}
        </div>

        {editing && (
          <div style={styles.editActions}>
            <button
              style={styles.cancelButton}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button
              style={{ ...styles.saveButton, opacity: saving ? 0.6 : 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div style={styles.section}>
        <button style={styles.signOutButton} onClick={signOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.offWhite,
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: colors.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: colors.teal,
    color: colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "700",
    fontFamily: fonts.body,
    flexShrink: 0,
  },
  name: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "20px",
    color: colors.navy,
    marginBottom: "2px",
  },
  email: {
    fontFamily: fonts.body,
    fontSize: "13px",
    color: colors.gray500,
  },
  banner: {
    backgroundColor: colors.navy,
    borderRadius: "14px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  bannerTitle: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "15px",
    color: colors.white,
    marginBottom: "2px",
  },
  bannerSub: {
    fontFamily: fonts.body,
    fontSize: "13px",
    color: colors.gray300,
  },
  bannerButton: {
    backgroundColor: colors.teal,
    color: colors.navy,
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  successBanner: {
    backgroundColor: "#e6faf5",
    color: colors.success,
    border: `1px solid ${colors.success}`,
    borderRadius: "12px",
    padding: "12px 16px",
    fontFamily: fonts.body,
    fontSize: "14px",
    fontWeight: "600",
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "17px",
    color: colors.navy,
  },
  editButton: {
    backgroundColor: "transparent",
    border: `1.5px solid ${colors.teal}`,
    color: colors.teal,
    borderRadius: "8px",
    padding: "6px 14px",
    fontFamily: fonts.body,
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontFamily: fonts.body,
    fontWeight: "600",
    fontSize: "13px",
    color: colors.gray500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontFamily: fonts.body,
    fontSize: "15px",
    color: colors.navy,
    fontWeight: "500",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: `2px solid ${colors.gray100}`,
    fontSize: "15px",
    fontFamily: fonts.body,
    color: colors.navy,
    outline: "none",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  chip: {
    padding: "8px 14px",
    borderRadius: "100px",
    border: `1.5px solid ${colors.gray100}`,
    backgroundColor: "transparent",
    color: colors.gray700,
    fontFamily: fonts.body,
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer",
  },
  chipActive: {
    padding: "8px 14px",
    borderRadius: "100px",
    border: `1.5px solid ${colors.teal}`,
    backgroundColor: colors.tealLight,
    color: colors.teal,
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  editActions: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "transparent",
    border: `1.5px solid ${colors.gray100}`,
    borderRadius: "10px",
    fontFamily: fonts.body,
    fontWeight: "600",
    fontSize: "14px",
    color: colors.gray500,
    cursor: "pointer",
  },
  saveButton: {
    flex: 2,
    padding: "12px",
    backgroundColor: colors.teal,
    border: "none",
    borderRadius: "10px",
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "14px",
    color: colors.navy,
    cursor: "pointer",
  },
  signOutButton: {
    padding: "14px",
    backgroundColor: "transparent",
    border: `1.5px solid ${colors.danger}`,
    borderRadius: "12px",
    color: colors.danger,
    fontFamily: fonts.body,
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    width: "100%",
  },
};

export default ProfileScreen;
