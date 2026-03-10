// src/pages/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";

/* ── Helpers ── */

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scoreColor(pct) {
  if (pct >= 75) return { bg: "bg-emerald-500", text: "text-emerald-400", ring: "stroke-emerald-400" };
  if (pct >= 50) return { bg: "bg-amber-500", text: "text-amber-400", ring: "stroke-amber-400" };
  return { bg: "bg-rose-500", text: "text-rose-400", ring: "stroke-rose-400" };
}

const EXAM_ACCENT = {
  IELTS: "from-rose-500 to-pink-500",
  SAT: "from-blue-500 to-indigo-500",
  TOEFL: "from-purple-500 to-violet-500",
  TOEIC: "from-teal-500 to-emerald-500",
  DET: "from-rose-500 to-pink-500",
  GED: "from-blue-500 to-indigo-500",
  "O-NET": "from-purple-500 to-violet-500",
  TCAS: "from-rose-500 to-pink-500",
};

/* ── Circular progress ring ── */

function ProgressRing({ value, max, size = 120, strokeWidth = 8, color = "stroke-cyan-400", children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-border/30"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`${color} transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ── Stat card ── */

function StatCard({ icon, label, value, unit, accent }) {
  return (
    <div className="tt-panel flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent || "bg-cyan-500/15"}`}>
          {icon}
        </div>
        <span className="font-body text-[12px] font-medium text-text-secondary">{label}</span>
      </div>
      <p className="font-heading text-[28px] leading-none tracking-wide text-text-primary">
        {value}
        {unit && <span className="ml-0.5 text-[16px] text-text-secondary">{unit}</span>}
      </p>
    </div>
  );
}

/* ── Main component ── */

function Dashboard() {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [topicStats, setTopicStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function fetchDashboardData() {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("test_sessions")
        .select("*, exams(name)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      if (sessionError) throw sessionError;

      const { data: resultsData, error: resultsError } = await supabase
        .from("user_results")
        .select("is_correct, created_at, questions(topic)")
        .eq("user_id", user.id);
      if (resultsError) throw resultsError;

      // Topic stats
      const topicMap = (resultsData || []).reduce((acc, row) => {
        const topic = row.questions?.topic || "General";
        if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
        acc[topic].total++;
        if (row.is_correct) acc[topic].correct++;
        return acc;
      }, {});

      // Today's question count
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayAnswered = (resultsData || []).filter(
        (r) => new Date(r.created_at) >= todayStart
      ).length;

      setSessions(sessionData || []);
      setTodayCount(todayAnswered);
      setTopicStats(
        Object.entries(topicMap)
          .map(([topic, stats]) => ({
            topic,
            ...stats,
            percent: Math.round((stats.correct / stats.total) * 100),
          }))
          .sort((a, b) => b.total - a.total)
      );
    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalTests = sessions.length;
  const avgScore =
    totalTests > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.score_percent || 0), 0) / totalTests)
      : 0;
  const bestScore =
    totalTests > 0 ? Math.max(...sessions.map((s) => s.score_percent || 0)) : 0;
  const totalQuestions = sessions.reduce((sum, s) => sum + (s.total_count || 0), 0);

  // Streak: count consecutive days with at least one session
  const streak = useMemo(() => {
    if (sessions.length === 0) return 0;
    const days = new Set(
      sessions.map((s) => new Date(s.completed_at).toDateString())
    );
    let count = 0;
    const d = new Date();
    while (days.has(d.toDateString())) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [sessions]);

  // Recent 5 sessions
  const recentSessions = sessions.slice(0, 5);

  /* ── Loading ── */

  if (loading) {
    return (
      <div className="tt-page flex items-center justify-center py-20">
        <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-400" />
        <span className="ml-3 font-body text-[14px] text-text-secondary">
          Loading your progress...
        </span>
      </div>
    );
  }

  /* ── Signed-out / empty ── */

  if (!user) {
    return (
      <div className="tt-page">
        <div className="mx-auto max-w-[980px] px-4 pt-6">
          <h1 className="font-heading text-[28px] leading-tight tracking-[0.3px] text-text-primary">
            Progress
          </h1>
          <div className="tt-panel mt-6 flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 20V11M10 20V7M16 20V13M22 20V4" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-body text-[18px] font-bold text-text-primary">
              Track your learning journey
            </h2>
            <p className="max-w-sm font-body text-[14px] text-text-secondary">
              Sign in to see your scores, streaks, and progress across all exams.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="tt-cta mt-2"
            >
              Start Practicing
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ── */

  return (
    <div className="tt-page">
      <div className="mx-auto max-w-[980px] px-4 pt-2 pb-6">

        {/* ── Daily Goal & Streak hero ── */}
        <section className="tt-panel mt-2 p-5">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Daily goal ring */}
            <div className="flex flex-col items-center gap-3">
              <ProgressRing
                value={todayCount}
                max={preferences.daily_goal}
                size={110}
                strokeWidth={7}
                color={todayCount >= preferences.daily_goal ? "stroke-emerald-400" : "stroke-cyan-400"}
              >
                <span className="font-heading text-[26px] leading-none text-text-primary">
                  {todayCount}
                </span>
                <span className="text-[11px] text-text-tertiary">
                  / {preferences.daily_goal}
                </span>
              </ProgressRing>
              <div className="text-center">
                <p className="font-body text-[13px] font-semibold text-text-primary">
                  Daily Goal
                </p>
                <p className="text-[12px] text-text-secondary">
                  {todayCount >= preferences.daily_goal
                    ? "Goal reached!"
                    : `${preferences.daily_goal - todayCount} more to go`}
                </p>
              </div>
            </div>

            {/* Streak & quick stats */}
            <div className="flex flex-1 flex-col gap-3 sm:ml-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-400" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-heading text-[22px] leading-none text-text-primary">
                    {streak} day{streak !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[12px] text-text-secondary">Current streak</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border/50 bg-card/40 p-3">
                  <p className="font-heading text-[20px] leading-none text-text-primary">
                    {totalTests}
                  </p>
                  <p className="mt-1 text-[11px] text-text-secondary">Tests taken</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/40 p-3">
                  <p className="font-heading text-[20px] leading-none text-text-primary">
                    {totalQuestions}
                  </p>
                  <p className="mt-1 text-[11px] text-text-secondary">Questions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Score overview ── */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Average"
            value={avgScore}
            unit="%"
            accent="bg-cyan-500/15"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 20V11M10 20V7M16 20V13M22 20V4" strokeLinecap="round" />
              </svg>
            }
          />
          <StatCard
            label="Best"
            value={bestScore}
            unit="%"
            accent="bg-emerald-500/15"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.5 5.7 21l2.3-7.2-6-4.4h7.6z" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatCard
            label="Streak"
            value={streak}
            unit="d"
            accent="bg-amber-500/15"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            }
          />
          <StatCard
            label="Today"
            value={todayCount}
            unit={`/${preferences.daily_goal}`}
            accent="bg-violet-500/15"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            }
          />
        </div>

        {totalTests === 0 ? (
          /* ── Empty state ── */
          <section className="tt-panel mt-4 flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/70">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-text-tertiary" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="4" y="3" width="16" height="18" rx="3" />
                <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-body text-[17px] font-bold text-text-primary">
              No tests yet
            </h2>
            <p className="max-w-xs font-body text-[14px] text-text-secondary">
              Take your first practice test to start tracking your progress.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="tt-cta mt-1"
            >
              Browse Exams
            </button>
          </section>
        ) : (
          <>
            {/* ── Topic performance ── */}
            {topicStats.length > 0 && (
              <section className="tt-panel mt-4 p-5">
                <h2 className="mb-4 font-body text-[16px] font-bold text-text-primary">
                  Performance by Topic
                </h2>
                <div className="space-y-4">
                  {topicStats.map((t) => {
                    const sc = scoreColor(t.percent);
                    return (
                      <div key={t.topic}>
                        <div className="mb-1.5 flex items-baseline justify-between">
                          <span className="font-body text-[13px] font-semibold text-text-primary">
                            {t.topic}
                          </span>
                          <span className={`font-mono text-[12px] font-semibold ${sc.text}`}>
                            {t.percent}%
                            <span className="ml-1 text-text-tertiary">
                              ({t.correct}/{t.total})
                            </span>
                          </span>
                        </div>
                        <div className="h-[5px] overflow-hidden rounded-full bg-border/30">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${sc.bg}`}
                            style={{ width: `${t.percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Recent tests ── */}
            <section className="tt-panel mt-4 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-body text-[16px] font-bold text-text-primary">
                  Recent Tests
                </h2>
                {sessions.length > 5 && (
                  <span className="text-[12px] text-text-tertiary">
                    Showing latest 5 of {sessions.length}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {recentSessions.map((session) => {
                  const sc = scoreColor(session.score_percent || 0);
                  const examName = session.exams?.name || "Test";
                  const gradient = EXAM_ACCENT[examName] || "from-slate-500 to-slate-600";
                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-3 transition-colors hover:bg-card/50"
                    >
                      {/* Score circle */}
                      <ProgressRing
                        value={session.score_percent || 0}
                        max={100}
                        size={48}
                        strokeWidth={4}
                        color={sc.ring}
                      >
                        <span className={`text-[12px] font-bold ${sc.text}`}>
                          {session.score_percent || 0}%
                        </span>
                      </ProgressRing>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${gradient}`}
                          />
                          <p className="truncate font-body text-[14px] font-bold text-text-primary">
                            {examName}
                          </p>
                        </div>
                        <p className="mt-0.5 text-[12px] text-text-secondary">
                          {session.correct_count}/{session.total_count} correct
                          <span className="mx-1.5 text-text-tertiary">·</span>
                          {formatDate(session.completed_at)}
                        </p>
                      </div>

                      {/* Retake */}
                      <button
                        type="button"
                        onClick={() => navigate(`/test/${session.exam_id}`)}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card/40 text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
                        title="Retake"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
