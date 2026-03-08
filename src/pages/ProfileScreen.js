import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const EXAMS = ["IELTS", "TOEFL", "TOEIC", "SAT", "GED", "DET", "ONET", "TCAS"];
const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "elementary", label: "Elementary" },
  { value: "intermediate", label: "Intermediate" },
  { value: "upper_intermediate", label: "Upper Intermediate" },
  { value: "advanced", label: "Advanced" },
];
const GOALS = [5, 10, 20, 30];

function normalizeWebsite(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image."));
      img.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

async function toCompressedAvatarDataUrl(file) {
  const img = await loadImageFromFile(file);
  const maxSize = 640;
  const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * ratio));
  const height = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.82);
}

function buildForm(profile) {
  return {
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    website: profile?.website || "",
    avatar_url: profile?.avatar_url || "",
    self_assessed_level: profile?.self_assessed_level || null,
    target_exams: Array.isArray(profile?.target_exams) ? profile.target_exams : [],
    daily_goal: typeof profile?.daily_goal === "number" ? profile.daily_goal : 10,
  };
}

function ProfileScreen() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [form, setForm] = useState(buildForm(profile));

  useEffect(() => {
    if (!editing) setForm(buildForm(profile));
  }, [profile, editing]);

  const isComplete = Boolean(profile?.onboarding_completed);
  const displayName = form.full_name || form.username || "Student";
  const initials = useMemo(() => {
    const source = displayName || user?.email || "S";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() || "")
      .join("");
  }, [displayName, user?.email]);

  function toggleExam(exam) {
    setForm((prev) => ({
      ...prev,
      target_exams: prev.target_exams.includes(exam)
        ? prev.target_exams.filter((e) => e !== exam)
        : [...prev.target_exams, exam],
    }));
  }

  function startEditing() {
    setError("");
    setSaved(false);
    setEditing(true);
  }

  function cancelEditing() {
    setError("");
    setForm(buildForm(profile));
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        ...form,
        website: normalizeWebsite(form.website),
        onboarding_completed: true,
      });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setImageLoading(true);
    setError("");
    try {
      const dataUrl = await toCompressedAvatarDataUrl(file);
      setForm((prev) => ({ ...prev, avatar_url: dataUrl }));
    } catch (err) {
      setError(err?.message || "Could not process image.");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="tt-page">
      <div className="tt-shell pt-5">
        <section className="tt-panel p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt="Profile"
                className="h-16 w-16 rounded-full border border-border/70 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border/70 bg-card/75 text-[20px] font-bold text-text-primary">
                {initials || "S"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-body text-[24px] font-bold text-text-primary">
                {profile?.full_name || profile?.username || "Your Profile"}
              </h1>
              <p className="truncate text-[13px] text-text-secondary">{user?.email}</p>
              {profile?.bio && (
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
                  {profile.bio}
                </p>
              )}
            </div>

            {!editing && (
              <button type="button" onClick={startEditing} className="tt-cta whitespace-nowrap px-4 py-2 text-[13px]">
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {!isComplete && !editing && (
          <section className="tt-panel-soft mt-3 flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[14px] font-bold text-text-primary">Complete your profile</p>
              <p className="text-[12px] text-text-secondary">Set your goals and preferences for better practice recommendations.</p>
            </div>
            <button type="button" onClick={startEditing} className="tt-cta px-4 py-2 text-[13px]">
              Set Up
            </button>
          </section>
        )}

        {saved && (
          <div className="tt-panel-soft mt-3 border-success/35 bg-success/15 p-3 text-[13px] font-semibold text-success">
            Profile saved successfully.
          </div>
        )}

        {error && (
          <div className="tt-panel-soft mt-3 border-danger/35 bg-danger/12 p-3 text-[13px] font-semibold text-danger">
            {error}
          </div>
        )}

        <section className="tt-panel mt-3 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Full Name">
              <input
                value={form.full_name}
                disabled={!editing}
                maxLength={60}
                placeholder="Your full name"
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full rounded-xl border border-border/70 bg-card/65 px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-border-strong disabled:opacity-80"
              />
            </Field>

            <Field label="Username">
              <input
                value={form.username}
                disabled={!editing}
                maxLength={30}
                placeholder="username"
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.replace(/\s+/g, "") }))}
                className="w-full rounded-xl border border-border/70 bg-card/65 px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-border-strong disabled:opacity-80"
              />
            </Field>

            <Field label="Location">
              <input
                value={form.location}
                disabled={!editing}
                maxLength={80}
                placeholder="City, Country"
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full rounded-xl border border-border/70 bg-card/65 px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-border-strong disabled:opacity-80"
              />
            </Field>

            <Field label="Website">
              <input
                value={form.website}
                disabled={!editing}
                maxLength={120}
                placeholder="https://..."
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                className="w-full rounded-xl border border-border/70 bg-card/65 px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-border-strong disabled:opacity-80"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Avatar URL">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleAvatarFileChange}
                      disabled={!editing || imageLoading}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={!editing || imageLoading}
                      onClick={() => fileInputRef.current?.click()}
                      className="tt-cta px-3 py-2 text-[12px] disabled:cursor-default disabled:opacity-70"
                    >
                      {imageLoading ? "Processing..." : "Upload From Device"}
                    </button>
                    {editing && form.avatar_url && (
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, avatar_url: "" }))}
                        className="rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-[12px] font-semibold text-text-secondary"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <input
                    value={form.avatar_url}
                    disabled={!editing}
                    maxLength={50000}
                    placeholder="https://image-url"
                    onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))}
                    className="w-full rounded-xl border border-border/70 bg-card/65 px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-border-strong disabled:opacity-80"
                  />
                </div>
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Bio">
                <textarea
                  rows={3}
                  value={form.bio}
                  disabled={!editing}
                  maxLength={280}
                  placeholder="Tell others about your goals and interests."
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full resize-y rounded-xl border border-border/70 bg-card/65 px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-border-strong disabled:opacity-80"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="tt-panel mt-3 p-4 sm:p-5">
          <Field label="English Level">
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <Chip
                  key={level.value}
                  active={form.self_assessed_level === level.value}
                  disabled={!editing}
                  onClick={() => editing && setForm((p) => ({ ...p, self_assessed_level: level.value }))}
                >
                  {level.label}
                </Chip>
              ))}
            </div>
          </Field>

          <div className="mt-3">
            <Field label="Target Exams">
              <div className="flex flex-wrap gap-2">
                {EXAMS.map((exam) => (
                  <Chip
                    key={exam}
                    active={form.target_exams.includes(exam)}
                    disabled={!editing}
                    onClick={() => editing && toggleExam(exam)}
                  >
                    {exam}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Daily Goal">
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <Chip
                    key={goal}
                    active={form.daily_goal === goal}
                    disabled={!editing}
                    onClick={() => editing && setForm((p) => ({ ...p, daily_goal: goal }))}
                  >
                    {goal} questions
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
        </section>

        {editing && (
          <section className="mt-3 flex gap-2">
            <button type="button" onClick={cancelEditing} className="tt-cta flex-1 bg-card/55 text-text-secondary hover:bg-card/75">
              Cancel
            </button>
            <button type="button" disabled={saving} onClick={handleSave} className="tt-cta flex-[1.4]">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </section>
        )}

        <section className="tt-panel-soft mb-6 mt-3 p-3">
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-xl border border-danger/35 bg-danger/12 px-4 py-3 text-[14px] font-semibold text-danger transition-colors hover:bg-danger/20"
          >
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</label>
      {children}
    </div>
  );
}

function Chip({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:cursor-default disabled:opacity-70 ${
        active
          ? "border-border-strong bg-card/90 text-text-primary"
          : "border-border/70 bg-card/50 text-text-secondary hover:border-border-strong"
      }`}
    >
      {children}
    </button>
  );
}

export default ProfileScreen;
