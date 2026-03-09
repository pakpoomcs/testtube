import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

/* ── Per-exam metadata & theme ── */

const EXAM_META = {
  IELTS: {
    tag: "ACADEMIC",
    desc: "Global standard for English proficiency",
    badgeCls: "bg-emerald-500/20 border-emerald-400/40 text-emerald-300",
    buttonCls: "from-rose-500 to-pink-500",
    barCls: "bg-rose-400",
    barText: "text-rose-400",
    toggleCls: "border-cyan-400/50 bg-cyan-500/25 text-cyan-300",
  },
  SAT: {
    tag: "US COLLEGE",
    desc: "US college admissions examination",
    badgeCls: "bg-blue-500/20 border-blue-400/40 text-blue-300",
    buttonCls: "from-blue-500 to-indigo-500",
    barCls: "bg-blue-400",
    barText: "text-blue-400",
    toggleCls: "border-cyan-400/50 bg-cyan-500/25 text-cyan-300",
  },
  TOEFL: {
    tag: "UNIVERSITY",
    desc: "Academic English for university entry",
    badgeCls: "bg-purple-500/20 border-purple-400/40 text-purple-300",
    buttonCls: "from-purple-500 to-violet-500",
    barCls: "bg-purple-400",
    barText: "text-purple-400",
    toggleCls: "border-rose-400/50 bg-rose-500/25 text-rose-300",
  },
  TOEIC: {
    tag: "WORKPLACE",
    desc: "Professional English for career growth",
    badgeCls: "bg-rose-500/20 border-rose-400/40 text-rose-300",
    buttonCls: "from-teal-600 to-emerald-500",
    barCls: "bg-teal-400",
    barText: "text-teal-400",
    toggleCls: "border-rose-400/50 bg-rose-500/25 text-rose-300",
  },
  DET: {
    tag: "ONLINE",
    desc: "Modern online English proficiency test",
    badgeCls: "bg-emerald-500/20 border-emerald-400/40 text-emerald-300",
    buttonCls: "from-rose-500 to-pink-500",
    barCls: "bg-rose-400",
    barText: "text-rose-400",
    toggleCls: "border-cyan-400/50 bg-cyan-500/25 text-cyan-300",
  },
  GED: {
    tag: "HIGH SCHOOL",
    desc: "High school equivalency credential",
    badgeCls: "bg-blue-500/20 border-blue-400/40 text-blue-300",
    buttonCls: "from-blue-500 to-indigo-500",
    barCls: "bg-blue-400",
    barText: "text-blue-400",
    toggleCls: "border-cyan-400/50 bg-cyan-500/25 text-cyan-300",
  },
  "O-NET": {
    tag: "THAI NATIONAL",
    desc: "\u0e2a\u0e2d\u0e1a\u0e27\u0e31\u0e14\u0e1c\u0e25\u0e01\u0e32\u0e23\u0e28\u0e36\u0e01\u0e29\u0e32\u0e23\u0e30\u0e14\u0e31\u0e1a\u0e0a\u0e32\u0e15\u0e34",
    badgeCls: "bg-purple-500/20 border-purple-400/40 text-purple-300",
    buttonCls: "from-purple-500 to-violet-500",
    barCls: "bg-purple-400",
    barText: "text-purple-400",
    toggleCls: "border-rose-400/50 bg-rose-500/25 text-rose-300",
  },
  TCAS: {
    tag: "UNIVERSITY ENTRY",
    desc: "Thai university entrance system",
    badgeCls: "bg-rose-500/20 border-rose-400/40 text-rose-300",
    buttonCls: "from-rose-500 to-pink-500",
    barCls: "bg-rose-400",
    barText: "text-rose-400",
    toggleCls: "border-rose-400/50 bg-rose-500/25 text-rose-300",
  },
};

const DEFAULT_META = {
  tag: "EXAM",
  desc: "Practice test",
  badgeCls: "bg-slate-500/20 border-slate-400/40 text-slate-300",
  buttonCls: "from-slate-500 to-slate-600",
  barCls: "bg-slate-400",
  barText: "text-slate-400",
  toggleCls: "border-cyan-400/50 bg-cyan-500/25 text-cyan-300",
};

function getMeta(name) {
  return EXAM_META[String(name || "").trim().toUpperCase()] || EXAM_META[String(name || "").trim()] || DEFAULT_META;
}

/* ── News sources ── */

const SOURCES = [
  { subreddit: "IELTS", label: "IELTS" },
  { subreddit: "SAT", label: "SAT" },
  { subreddit: "ApplyingToCollege", label: "College" },
  { subreddit: "education", label: "Education" },
];

const NEWS_COLORS = {
  IELTS: { border: "border-l-cyan-400", badge: "bg-cyan-500/18 text-cyan-300" },
  SAT: { border: "border-l-blue-400", badge: "bg-blue-500/18 text-blue-300" },
  College: { border: "border-l-violet-400", badge: "bg-violet-500/18 text-violet-300" },
  Education: { border: "border-l-emerald-400", badge: "bg-emerald-500/18 text-emerald-300" },
};
const DEFAULT_NEWS = { border: "border-l-slate-400", badge: "bg-slate-500/18 text-slate-300" };

/* ── Helpers ── */

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

function toDifficultyParam(level) {
  return String(level || "").trim().toLowerCase();
}

function normalizeDifficulty(level) {
  const v = String(level || "").trim().toLowerCase();
  if (v === "easy") return "Easy";
  if (v === "medium") return "Medium";
  if (v === "hard") return "Hard";
  return "";
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Component ── */

function HomeNews() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stories, setStories] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [exams, setExams] = useState([]);
  const [examLoading, setExamLoading] = useState(true);
  const [examError, setExamError] = useState(null);
  const [examFilter, setExamFilter] = useState("All");
  const [examDifficultyFilters, setExamDifficultyFilters] = useState({});
  const [examQuestionStats, setExamQuestionStats] = useState({});
  const [examProgressStats, setExamProgressStats] = useState({});

  /* ── Data fetching ── */

  useEffect(() => {
    fetchStories();
    fetchExams();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id) fetchExams();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchExams() {
    setExamLoading(true);
    setExamError(null);
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*, questions(count)")
        .order("name");
      if (error) throw error;
      const nextExams = data || [];
      const examIds = nextExams.map((e) => e.id);
      let statsMap = {};
      let difficultyByQuestionId = {};
      if (examIds.length > 0) {
        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .select("id, exam_id, difficulty")
          .in("exam_id", examIds);
        if (qErr) throw qErr;
        statsMap = (qData || []).reduce((acc, row) => {
          if (!acc[row.exam_id]) acc[row.exam_id] = { total: 0, byDifficulty: { Easy: 0, Medium: 0, Hard: 0 } };
          const norm = normalizeDifficulty(row.difficulty);
          difficultyByQuestionId[row.id] = norm;
          acc[row.exam_id].total += 1;
          if (norm) acc[row.exam_id].byDifficulty[norm] += 1;
          return acc;
        }, {});
      }
      setExams(nextExams);
      setExamQuestionStats(statsMap);
      if (user?.id && examIds.length > 0) {
        const { data: uData, error: uErr } = await supabase
          .from("user_results")
          .select("exam_id, question_id")
          .eq("user_id", user.id)
          .in("exam_id", examIds);
        if (uErr) throw uErr;
        const seen = new Set();
        const progressMap = (uData || []).reduce((acc, row) => {
          const key = `${row.exam_id}:${row.question_id}`;
          if (seen.has(key)) return acc;
          seen.add(key);
          if (!acc[row.exam_id]) acc[row.exam_id] = { taken: 0, byDifficulty: { Easy: 0, Medium: 0, Hard: 0 } };
          acc[row.exam_id].taken += 1;
          const d = difficultyByQuestionId[row.question_id];
          if (d) acc[row.exam_id].byDifficulty[d] += 1;
          return acc;
        }, {});
        setExamProgressStats(progressMap);
      } else {
        setExamProgressStats({});
      }
      setExamDifficultyFilters((prev) => {
        const next = { ...prev };
        nextExams.forEach((e) => {
          if (!next[e.id] || next[e.id].length === 0) next[e.id] = [...DIFFICULTY_LEVELS];
        });
        return next;
      });
    } catch (_) {
      setExamError("Could not load tests right now.");
      setExams([]);
      setExamQuestionStats({});
      setExamProgressStats({});
    } finally {
      setExamLoading(false);
    }
  }

  async function fetchStories() {
    setNewsLoading(true);
    try {
      const responses = await Promise.all(
        SOURCES.map(async ({ subreddit, label }) => {
          const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=6`);
          if (!res.ok) throw new Error(`r/${subreddit}`);
          const json = await res.json();
          return (json.data?.children || []).map(({ data: d }) => ({
            id: d.id,
            title: d.title,
            source: label,
            url: d.url_overridden_by_dest || d.url || `https://www.reddit.com${d.permalink}`,
            createdAt: (d.created_utc || 0) * 1000,
          }));
        })
      );
      const merged = Array.from(new Map(responses.flat().map((s) => [s.id, s])).values());
      merged.sort((a, b) => b.createdAt - a.createdAt);
      setStories(merged.slice(0, 12));
    } catch (_) {
      setStories([]);
    } finally {
      setNewsLoading(false);
    }
  }

  /* ── Derived state ── */

  const examCategories = useMemo(() => ["All", ...new Set(exams.map((e) => e.category))], [exams]);
  const filteredExams = useMemo(
    () => (examFilter === "All" ? exams : exams.filter((e) => e.category === examFilter)),
    [examFilter, exams]
  );
  const newsItems = useMemo(() => stories.slice(0, 3), [stories]);

  function toggleDifficulty(examId, level) {
    setExamDifficultyFilters((prev) => {
      const cur = prev[examId] || [...DIFFICULTY_LEVELS];
      const has = cur.includes(level);
      if (has && cur.length === 1) return prev;
      return { ...prev, [examId]: has ? cur.filter((l) => l !== level) : [...cur, level] };
    });
  }

  function getTestUrl(examId, levels) {
    const vals = (levels?.length ? levels : DIFFICULTY_LEVELS).map(toDifficultyParam);
    return `/test/${examId}?difficulty=${vals.join(",")}`;
  }

  /* ── Render ── */

  return (
    <div className="tt-page">
      <div className="mx-auto max-w-[980px] px-4 pt-4">

        {/* ── Hero ── */}
        <section className="tt-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-cyan-200">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor"><path d="M8 0l1.8 5.2H15l-4.2 3 1.6 5.2L8 10.5l-4.4 3 1.6-5.2-4.2-3h5.2z" /></svg>
              AI-Powered Practice
            </span>
            <h1 className="mt-4 font-heading text-[clamp(34px,7vw,52px)] leading-[1.08] tracking-[0.5px] text-text-primary">
              Master Your
              <br />
              <span className="text-cyan-400">Target Exam.</span>
            </h1>
            <p className="mt-3 max-w-[440px] font-body text-[14px] leading-relaxed text-text-secondary">
              Personalised practice for IELTS, SAT, TCAS and 5 more standardised tests — designed for Thai students.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("exam-grid")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-500/18 px-5 py-3 font-body text-[14px] font-bold text-cyan-50 transition-colors hover:bg-cyan-500/28"
              >
                Start Now
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                className="rounded-xl border border-border/70 bg-card/50 px-5 py-3 font-body text-[14px] font-semibold text-text-primary transition-colors hover:bg-hover/40"
              >
                View Plans
              </button>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-[300px] w-[300px] rounded-full border border-border/20" />
          <div className="pointer-events-none absolute right-12 top-10 h-[180px] w-[180px] rounded-full border border-border/15" />
        </section>

        {/* ── Category filters ── */}
        <div className="mt-4 flex flex-wrap gap-2">
          {examCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setExamFilter(cat)}
              className={`cursor-pointer rounded-full border px-4 py-1.5 font-body text-[12px] font-medium transition-all duration-150 ${
                examFilter === cat
                  ? "border-cyan-400/50 bg-cyan-500/15 font-semibold text-cyan-200"
                  : "border-border/60 bg-card/40 text-text-secondary hover:border-border-strong hover:bg-card/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Section header ── */}
        <div id="exam-grid" className="mt-5 flex items-baseline justify-between">
          <h2 className="font-body text-[18px] font-bold text-text-primary">All Exams</h2>
          <span className="font-mono text-[13px] text-text-tertiary">
            {filteredExams.length} available
          </span>
        </div>

        {/* ── Exam grid ── */}
        {examLoading ? (
          <div className="mt-4 flex items-center justify-center py-12">
            <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-400" />
            <span className="ml-3 font-body text-[14px] text-text-secondary">Loading exams...</span>
          </div>
        ) : examError ? (
          <div className="mt-4 tt-panel p-6 text-center text-danger">{examError}</div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filteredExams.map((exam) => {
              const meta = getMeta(exam.name);
              const selectedDiffs = examDifficultyFilters[exam.id] || DIFFICULTY_LEVELS;
              const stats = examQuestionStats[exam.id];
              const totalQ = stats?.total ?? (exam.questions?.[0]?.count ?? 0);
              const filteredQ = stats
                ? selectedDiffs.reduce((s, l) => s + (stats.byDifficulty[l] || 0), 0)
                : totalQ;
              const progress = examProgressStats[exam.id];
              const takenQ = progress
                ? selectedDiffs.reduce((s, l) => s + (progress.byDifficulty[l] || 0), 0)
                : 0;
              const pct = filteredQ > 0 ? Math.round((takenQ / filteredQ) * 100) : 0;
              const hasQuestions = filteredQ > 0;

              return (
                <div
                  key={exam.id}
                  className="tt-panel tt-interactive flex flex-col gap-3 overflow-hidden p-4 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {/* Badge + count */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.6px] ${meta.badgeCls}`}>
                      {meta.tag}
                    </span>
                    <span className="font-mono text-[12px] tracking-wide text-text-tertiary">
                      {totalQ} Q
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-heading text-[32px] leading-none tracking-[0.3px] text-text-primary">
                    {exam.name}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-[13px] leading-snug text-text-secondary">
                    {meta.desc}
                  </p>

                  {/* Completion bar */}
                  <div className="mt-auto pt-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-body text-[12px] text-text-secondary">Completion</span>
                      <span className={`font-mono text-[12px] font-semibold ${meta.barText}`}>{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-[3px] rounded-full bg-border/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${meta.barCls}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Difficulty toggles */}
                  <div className="flex gap-1.5">
                    {DIFFICULTY_LEVELS.map((level) => {
                      const active = selectedDiffs.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => toggleDifficulty(exam.id, level)}
                          className={`flex-1 rounded-md border py-1 text-[11px] font-semibold transition-colors ${
                            active
                              ? meta.toggleCls
                              : "border-border/50 bg-card/40 text-text-tertiary hover:border-border-strong"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>

                  {/* Start button */}
                  {hasQuestions ? (
                    <button
                      type="button"
                      onClick={() => navigate(getTestUrl(exam.id, selectedDiffs))}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r py-3 text-[13px] font-bold text-white transition-opacity hover:opacity-90 ${meta.buttonCls}`}
                    >
                      Start Practice
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-border/40 bg-card/30 py-3 text-[13px] font-semibold text-text-tertiary"
                    >
                      {totalQ > 0 ? "No Match" : "Coming Soon"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── News section ── */}
        {newsItems.length > 0 && (
          <section className="mb-4 mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-body text-[18px] font-bold text-text-primary">
                Exam News & Updates
              </h2>
              <button
                type="button"
                onClick={fetchStories}
                className="font-body text-[13px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
              >
                See all &rarr;
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {newsItems.map((story) => {
                const nc = NEWS_COLORS[story.source] || DEFAULT_NEWS;
                return (
                  <a
                    key={story.id}
                    href={story.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`tt-panel tt-interactive block border-l-[3px] p-4 transition-colors hover:bg-hover/20 ${nc.border}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] ${nc.badge}`}>
                        {story.source}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" /></svg>
                        3 min read
                      </span>
                    </div>
                    <h4 className="mt-2 font-body text-[15px] font-bold leading-snug text-text-primary line-clamp-2">
                      {story.title}
                    </h4>
                    <p className="mt-2 font-body text-[12px] text-text-tertiary">
                      {formatDate(story.createdAt)}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {newsLoading && newsItems.length === 0 && (
          <p className="mt-6 text-center font-body text-[13px] text-text-secondary">Loading news...</p>
        )}
      </div>
    </div>
  );
}

export default HomeNews;
