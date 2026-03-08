// src/pages/ExamBrowser.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { isServiceUnavailableError } from "../supabaseClient";

const CARD_THEMES = {
  IELTS: {
    shell: "from-rose-500/26 via-rose-400/14 to-white/8",
    border: "border-rose-300/40",
    glow: "bg-rose-400/25",
    badge: "bg-rose-500/20 border-rose-300/45 text-rose-100",
    button: "border-rose-200/45 bg-rose-500/20 hover:bg-rose-500/28",
    toggleOff: "border-rose-300/60 bg-rose-500/32 text-rose-50 hover:bg-rose-500/42",
  },
  DUOLINGO: {
    shell: "from-emerald-500/26 via-emerald-400/14 to-white/8",
    border: "border-emerald-300/40",
    glow: "bg-emerald-400/25",
    badge: "bg-emerald-500/20 border-emerald-300/45 text-emerald-100",
    button: "border-emerald-200/45 bg-emerald-500/20 hover:bg-emerald-500/28",
    toggleOff: "border-emerald-300/60 bg-emerald-500/32 text-emerald-50 hover:bg-emerald-500/42",
  },
  DET: {
    shell: "from-emerald-500/26 via-emerald-400/14 to-white/8",
    border: "border-emerald-300/40",
    glow: "bg-emerald-400/25",
    badge: "bg-emerald-500/20 border-emerald-300/45 text-emerald-100",
    button: "border-emerald-200/45 bg-emerald-500/20 hover:bg-emerald-500/28",
    toggleOff: "border-emerald-300/60 bg-emerald-500/32 text-emerald-50 hover:bg-emerald-500/42",
  },
  SAT: {
    shell: "from-blue-500/26 via-blue-400/14 to-white/8",
    border: "border-blue-300/40",
    glow: "bg-blue-400/25",
    badge: "bg-blue-500/20 border-blue-300/45 text-blue-100",
    button: "border-blue-200/45 bg-blue-500/20 hover:bg-blue-500/28",
    toggleOff: "border-blue-300/60 bg-blue-500/32 text-blue-50 hover:bg-blue-500/42",
  },
  TOEFL: {
    shell: "from-amber-400/26 via-yellow-300/14 to-white/8",
    border: "border-amber-200/45",
    glow: "bg-amber-300/25",
    badge: "bg-amber-400/20 border-amber-200/45 text-amber-100",
    button: "border-amber-100/45 bg-amber-400/20 hover:bg-amber-400/28",
    toggleOff: "border-amber-200/60 bg-amber-400/34 text-amber-50 hover:bg-amber-400/44",
  },
  GED: {
    shell: "from-zinc-300/24 via-zinc-200/14 to-white/8",
    border: "border-zinc-200/45",
    glow: "bg-zinc-200/25",
    badge: "bg-zinc-300/18 border-zinc-200/45 text-zinc-100",
    button: "border-zinc-100/45 bg-zinc-300/16 hover:bg-zinc-300/24",
    toggleOff: "border-zinc-200/60 bg-zinc-300/34 text-zinc-50 hover:bg-zinc-300/44",
  },
};

const DEFAULT_THEME = {
  shell: "from-slate-400/20 via-slate-300/12 to-white/8",
  border: "border-border/70",
  glow: "bg-white/15",
  badge: "bg-card/55 border-border/70 text-text-secondary",
  button: "border-border/70 bg-card/70 hover:bg-card/80",
  toggleOff: "border-white/45 bg-white/30 text-white hover:bg-white/42",
};

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

function toDifficultyParam(level) {
  return String(level || "").trim().toLowerCase();
}

function normalizeDifficulty(level) {
  const value = String(level || "").trim().toLowerCase();
  if (value === "easy") return "Easy";
  if (value === "medium") return "Medium";
  if (value === "hard") return "Hard";
  return "";
}

function getTheme(name) {
  const key = String(name || "").trim().toUpperCase();
  return CARD_THEMES[key] || DEFAULT_THEME;
}

function ExamBrowser() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [examDifficultyFilters, setExamDifficultyFilters] = useState({});
  const [examQuestionStats, setExamQuestionStats] = useState({});
  const [examProgressStats, setExamProgressStats] = useState({});
  const { user, serviceUnavailable } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchExams() {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*, questions(count)")
        .order("name");
      if (error) throw error;
      const nextExams = data || [];
      const examIds = nextExams.map((exam) => exam.id);
      let statsMap = {};
      let difficultyByQuestionId = {};
      if (examIds.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("id, exam_id, difficulty")
          .in("exam_id", examIds);
        if (questionsError) throw questionsError;
        statsMap = (questionsData || []).reduce((acc, row) => {
          const examId = row.exam_id;
          if (!acc[examId]) acc[examId] = { total: 0, byDifficulty: { Easy: 0, Medium: 0, Hard: 0 } };
          const normalized = normalizeDifficulty(row.difficulty);
          difficultyByQuestionId[row.id] = normalized;
          acc[examId].total += 1;
          if (normalized) acc[examId].byDifficulty[normalized] += 1;
          return acc;
        }, {});
      }
      setExams(nextExams);
      setExamQuestionStats(statsMap);
      if (user?.id && examIds.length > 0) {
        const { data: userResults, error: userResultsError } = await supabase
          .from("user_results")
          .select("exam_id, question_id")
          .eq("user_id", user.id)
          .in("exam_id", examIds);
        if (userResultsError) throw userResultsError;

        const dedup = new Set();
        const progressMap = (userResults || []).reduce((acc, row) => {
          const dedupKey = `${row.exam_id}:${row.question_id}`;
          if (dedup.has(dedupKey)) return acc;
          dedup.add(dedupKey);

          if (!acc[row.exam_id]) {
            acc[row.exam_id] = { taken: 0, byDifficulty: { Easy: 0, Medium: 0, Hard: 0 } };
          }
          acc[row.exam_id].taken += 1;
          const diff = difficultyByQuestionId[row.question_id];
          if (diff) acc[row.exam_id].byDifficulty[diff] += 1;
          return acc;
        }, {});
        setExamProgressStats(progressMap);
      } else {
        setExamProgressStats({});
      }
      setExamDifficultyFilters((prev) => {
        const next = { ...prev };
        nextExams.forEach((exam) => {
          if (!next[exam.id] || next[exam.id].length === 0) next[exam.id] = [...DIFFICULTY_LEVELS];
        });
        return next;
      });
    } catch (err) {
      setError(
        isServiceUnavailableError(err)
          ? "Supabase is temporarily unavailable (HTTP 520). Please wait a moment and refresh."
          : "Failed to load exams. Please try again."
      );
      setExamQuestionStats({});
      setExamProgressStats({});
    } finally {
      setLoading(false);
    }
  }

  const categories = ["All", ...new Set(exams.map((e) => e.category))];
  const filtered = filter === "All" ? exams : exams.filter((e) => e.category === filter);
  function toggleExamDifficulty(examId, level) {
    setExamDifficultyFilters((prev) => {
      const current = prev[examId] || [...DIFFICULTY_LEVELS];
      const hasLevel = current.includes(level);
      if (hasLevel && current.length === 1) return prev;
      const nextLevels = hasLevel ? current.filter((item) => item !== level) : [...current, level];
      return { ...prev, [examId]: nextLevels };
    });
  }

  function getTestUrl(examId, selectedLevels) {
    const values = (selectedLevels?.length ? selectedLevels : DIFFICULTY_LEVELS).map(toDifficultyParam);
    return `/test/${examId}?difficulty=${values.join(",")}`;
  }

  if (loading)
    return (
      <div className="tt-page flex flex-col items-center justify-center gap-4">
        <div className="h-4 w-4 animate-pulse rounded-full bg-teal" />
        <p className="font-body text-[15px] text-text-secondary">Loading exams...</p>
      </div>
    );

  if (error || serviceUnavailable)
    return (
      <div className="tt-page flex items-center justify-center">
        <p className="font-body text-danger">
          {error || "Supabase is temporarily unavailable (HTTP 520). Please wait a moment and refresh."}
        </p>
      </div>
    );

  return (
    <div className="tt-page">
      <div className="tt-shell pb-6 pt-6">
        <div className="tt-panel relative overflow-hidden px-5 py-6 sm:px-6">
          <div className="relative z-10 max-w-[800px]">
            <div className="tt-pill mb-4 inline-flex items-center gap-2">TestTube</div>
            <h1 className="mb-3 font-heading text-[clamp(34px,7vw,56px)] leading-none tracking-[1px] text-text-primary">
              MASTER
              <br />
              EVERY EXAM
            </h1>
            <p className="max-w-[520px] font-body text-[13px] leading-relaxed text-text-secondary">
              Practice tests for IELTS, TOEIC, ONET, TCAS and more, with instant feedback and personalized reports.
            </p>
          </div>
          <div className="pointer-events-none absolute right-4 top-4 hidden opacity-90 md:block">
            <svg width="220" height="170" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="16" width="200" height="138" rx="24" fill="rgb(255 255 255 / 0.14)" />
              <rect x="24" y="34" width="88" height="10" rx="5" fill="rgb(255 255 255 / 0.45)" />
              <rect x="24" y="54" width="120" height="8" rx="4" fill="rgb(255 255 255 / 0.26)" />
              <rect x="24" y="73" width="106" height="8" rx="4" fill="rgb(255 255 255 / 0.2)" />
              <rect x="24" y="97" width="70" height="22" rx="11" fill="rgb(255 255 255 / 0.2)" />
              <rect x="100" y="97" width="64" height="22" rx="11" fill="rgb(255 255 255 / 0.14)" />
              <circle cx="184" cy="72" r="18" fill="rgb(255 255 255 / 0.28)" />
              <path
                d="M176 72L182 78L192 66"
                stroke="rgb(30 41 59 / 0.7)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="absolute -right-20 -top-24 z-0 h-[360px] w-[360px] rounded-full border border-border/30" />
          <div className="absolute right-16 top-12 z-0 h-[220px] w-[220px] rounded-full border border-border/20" />
          <div className="absolute bottom-0 right-[22%] z-0 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
        </div>
      </div>

      <div className="mx-auto flex max-w-[980px] flex-wrap gap-2 px-4 pt-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`cursor-pointer rounded-full border px-4 py-1.5 font-body text-[12px] font-medium transition-all duration-150 ${
              filter === cat
                ? "border-border-strong bg-card/85 font-semibold text-text-primary"
                : "border-border/60 bg-card/45 text-text-secondary hover:border-border-strong hover:bg-card/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-3 grid max-w-[980px] grid-cols-1 gap-3 px-4 pb-20 md:grid-cols-3">
        {filtered.map((exam) => {
          const totalQuestionCount = exam.questions?.[0]?.count ?? 0;
          const theme = getTheme(exam.name);
          const selectedDifficulties = examDifficultyFilters[exam.id] || DIFFICULTY_LEVELS;
          const stats = examQuestionStats[exam.id];
          const filteredQuestionCount = stats
            ? selectedDifficulties.reduce((sum, level) => sum + (stats.byDifficulty[level] || 0), 0)
            : totalQuestionCount;
          const progress = examProgressStats[exam.id];
          const filteredTakenCount = progress
            ? selectedDifficulties.reduce((sum, level) => sum + (progress.byDifficulty[level] || 0), 0)
            : 0;
          const hasAnyQuestions = (stats?.total ?? totalQuestionCount) > 0;
          const hasQuestions = filteredQuestionCount > 0;

          return (
            <div
              key={exam.id}
              className={`tt-panel tt-interactive relative flex min-h-[202px] flex-col overflow-hidden border bg-gradient-to-br p-4 pr-[124px] duration-300 ease-out hover:-translate-y-0.5 ${theme.border} ${theme.shell}`}
            >
              <div className={`pointer-events-none absolute -bottom-10 right-2 h-24 w-24 rounded-full blur-2xl ${theme.glow}`} />

              <div className="relative z-10 flex items-start justify-between gap-2">
                <h2 className="font-heading text-[34px] leading-none tracking-wide text-white">{exam.name}</h2>
                {exam.is_premium && (
                  <span className="whitespace-nowrap rounded-full border border-warning/30 bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-amber-50">
                    ✦ Premium
                  </span>
                )}
              </div>

              <p className="relative z-10 mt-auto pt-5 font-body text-[13px] font-medium text-white/90">
                {filteredQuestionCount > 0
                  ? `${filteredQuestionCount} question${filteredQuestionCount !== 1 ? "s" : ""}`
                  : "No questions yet"}
              </p>
              {hasAnyQuestions && (
                <p className="relative z-10 mt-1 font-body text-[12px] font-semibold text-white/90">
                  {filteredTakenCount}/{filteredQuestionCount || 0} completed
                </p>
              )}
              <div className="absolute bottom-2 right-2 top-2 z-20 flex w-[106px] flex-col gap-1.5 rounded-xl border border-white/20 bg-black/18 p-1.5 backdrop-blur-md">
                {DIFFICULTY_LEVELS.map((level) => {
                  const active = selectedDifficulties.includes(level);
                  return (
                    <button
                      key={`${exam.id}-${level}`}
                      type="button"
                      onClick={() => toggleExamDifficulty(exam.id, level)}
                      className={`h-6 w-full rounded-md border px-2 text-[10px] font-semibold tracking-[0.2px] transition-colors ${
                        active
                          ? "border-rose-200/90 bg-rose-500/72 text-rose-50 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.4)]"
                          : theme.toggleOff
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}

                {!hasQuestions ? (
                  <button
                    disabled
                    className="mt-auto h-12 w-full cursor-not-allowed rounded-lg border border-white/25 bg-white/10 px-2 text-[12px] font-semibold text-white/60"
                  >
                    {hasAnyQuestions ? "No Match" : "Coming Soon"}
                  </button>
                ) : exam.is_premium ? (
                  <button
                    onClick={() => navigate(getTestUrl(exam.id, selectedDifficulties))}
                    className="mt-auto h-12 w-full rounded-lg border border-warning/35 bg-warning/30 px-2 text-[12px] font-bold text-amber-50 transition-all duration-300 ease-out hover:bg-warning/40"
                  >
                    Unlock →
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(getTestUrl(exam.id, selectedDifficulties))}
                    className={`mt-auto h-12 w-full rounded-lg border px-2 text-[14px] font-bold text-white transition-all duration-300 ease-out ${theme.button}`}
                  >
                    Start →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pb-12 pt-4 text-center">
        <p className="font-body text-[13px] text-text-tertiary">TestTube 🧪 — Built for Thai students, accepted worldwide.</p>
      </div>
    </div>
  );
}

export default ExamBrowser;
