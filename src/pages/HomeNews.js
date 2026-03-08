import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

const SOURCES = [
  { subreddit: "IELTS", label: "IELTS" },
  { subreddit: "SAT", label: "SAT" },
  { subreddit: "ApplyingToCollege", label: "College" },
  { subreddit: "education", label: "Education" },
];

const FALLBACK_STORIES = [
  {
    id: "fallback-1",
    title: "How Students Build Better Study Systems With Short Daily Reviews",
    source: "Education Digest",
    url: "https://www.edutopia.org/",
    score: 0,
    comments: 0,
    createdAt: Date.now(),
  },
  {
    id: "fallback-2",
    title: "Exam Anxiety: Practical Strategies From Learning Science",
    source: "Learning Research",
    url: "https://www.apa.org/topics/learning-memory/study-techniques",
    score: 0,
    comments: 0,
    createdAt: Date.now() - 1000 * 60 * 60,
  },
];

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
const DAILY_LINES = [
  "Small steps beat perfect plans. Do one set now.",
  "Your future score is built by today's consistency.",
  "If focus is low, do just 5 questions to start.",
  "Progress loves routine. Even 10 minutes counts.",
];

function getDailyLine() {
  const day = new Date().getDate();
  return DAILY_LINES[day % DAILY_LINES.length];
}

function buildCoachReply(input, snapshot) {
  const text = String(input || "").toLowerCase();
  if (!text) return "Ask me anything about study strategy, test planning, or motivation.";
  if (text.includes("plan") || text.includes("schedule")) {
    return "Try this: 25 min practice, 5 min review, then one mistake log. Repeat twice.";
  }
  if (text.includes("score") || text.includes("improve")) {
    return `Your current average is ${snapshot.avgScore}%. Focus on Medium first, then Hard for growth.`;
  }
  if (text.includes("motivat") || text.includes("tired") || text.includes("burnout")) {
    return "Use the 5-minute rule: start tiny, then decide if you continue. Starting is the hard part.";
  }
  if (text.includes("ielts") || text.includes("toefl") || text.includes("toeic")) {
    return "For English tests: alternate reading + vocabulary days and review wrong answers immediately.";
  }
  return "Good question. Prioritize one weak topic today, finish one timed set, then review every mistake.";
}

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

function formatRelativeTime(ts) {
  const diffMs = ts - Date.now();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffMs) < hour) return rtf.format(Math.round(diffMs / minute), "minute");
  if (Math.abs(diffMs) < day) return rtf.format(Math.round(diffMs / hour), "hour");
  return rtf.format(Math.round(diffMs / day), "day");
}

function HomeNews() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stories, setStories] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  const [exams, setExams] = useState([]);
  const [examLoading, setExamLoading] = useState(true);
  const [examError, setExamError] = useState(null);
  const [examFilter, setExamFilter] = useState("All");
  const [examDifficultyFilters, setExamDifficultyFilters] = useState({});
  const [examQuestionStats, setExamQuestionStats] = useState({});
  const [examProgressStats, setExamProgressStats] = useState({});
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingTestUrl, setPendingTestUrl] = useState("");

  const [snapshot, setSnapshot] = useState({
    testsTaken: 0,
    avgScore: 0,
    recentScore: null,
  });
  const [chatInput, setChatInput] = useState("");
  const [dailyLine] = useState(() => getDailyLine());
  const [chatMessages, setChatMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am your study coach. Ask for a plan, motivation, or exam strategy.",
    },
  ]);

  useEffect(() => {
    fetchStories();
    fetchExams();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id) fetchExams();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id) fetchSnapshot(user.id);
  }, [user?.id]);

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
    } catch (_err) {
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
    setNewsError(null);

    try {
      const responses = await Promise.all(
        SOURCES.map(async ({ subreddit, label }) => {
          const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=8`);
          if (!res.ok) throw new Error(`Failed to load r/${subreddit}`);
          const json = await res.json();

          return (json.data?.children || []).map(({ data }) => ({
            id: data.id,
            title: data.title,
            source: label,
            subreddit,
            url:
              data.url_overridden_by_dest ||
              data.url ||
              `https://www.reddit.com${data.permalink}`,
            score: data.score || 0,
            comments: data.num_comments || 0,
            createdAt: (data.created_utc || 0) * 1000,
            thumbnail:
              typeof data.thumbnail === "string" &&
              /^https?:\/\//.test(data.thumbnail)
                ? data.thumbnail
                : data.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") || null,
          }));
        })
      );

      const merged = responses.flat();
      const deduped = Array.from(new Map(merged.map((item) => [item.id, item])).values());
      deduped.sort((a, b) => b.createdAt - a.createdAt);
      setStories(deduped.slice(0, 16));
    } catch (_err) {
      setNewsError("Live student news is unavailable right now. Showing fallback reading list.");
      setStories(FALLBACK_STORIES);
    } finally {
      setNewsLoading(false);
    }
  }

  async function fetchSnapshot(userId) {
    try {
      const { data, error } = await supabase
        .from("test_sessions")
        .select("score_percent, completed_at")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      const testsTaken = data?.length || 0;
      const avgScore =
        testsTaken > 0
          ? Math.round(data.reduce((sum, row) => sum + (row.score_percent || 0), 0) / testsTaken)
          : 0;
      const recentScore = testsTaken > 0 ? data[0].score_percent : null;

      setSnapshot({ testsTaken, avgScore, recentScore });
    } catch (_err) {
      setSnapshot({ testsTaken: 0, avgScore: 0, recentScore: null });
    }
  }

  const displayName = useMemo(() => {
    const email = user?.email || "";
    if (!email) return "Student";
    return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }, [user?.email]);

  const highlights = useMemo(() => stories.slice(0, 3), [stories]);
  const feed = useMemo(() => stories.slice(3), [stories]);
  const sourceCount = useMemo(
    () => new Set(stories.map((story) => story.source)).size,
    [stories]
  );
  const examCategories = useMemo(() => ["All", ...new Set(exams.map((e) => e.category))], [exams]);
  const filteredExams = useMemo(
    () => (examFilter === "All" ? exams : exams.filter((e) => e.category === examFilter)),
    [examFilter, exams]
  );

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

  function openTest(examId, selectedLevels) {
    const url = getTestUrl(examId, selectedLevels);
    if (!user) {
      setPendingTestUrl(url);
      setShowAuthPrompt(true);
      return;
    }
    navigate(url);
  }

  function sendChatMessage() {
    const message = chatInput.trim();
    if (!message) return;
    const userMsg = { id: `u-${Date.now()}`, role: "user", text: message };
    const assistantMsg = {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      text: buildCoachReply(message, snapshot),
    };
    setChatMessages((prev) => [...prev, userMsg, assistantMsg].slice(-8));
    setChatInput("");
  }

  return (
    <div className="tt-page">
      <div className="tt-shell">
        <section className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="tt-panel relative overflow-hidden p-3.5">
            <span className="tt-pill inline-flex">Daily Brief</span>
            <h1 className="mt-2 font-body text-[22px] font-semibold leading-tight text-text-primary">
              Welcome back, {displayName}
            </h1>
            <p className="mt-1 text-[12px] text-text-secondary">{dailyLine}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="tt-panel-soft p-2">
                <p className="text-[10px] uppercase tracking-wide text-text-tertiary">Tests</p>
                <p className="text-[16px] font-bold text-text-primary">{snapshot.testsTaken}</p>
              </div>
              <div className="tt-panel-soft p-2">
                <p className="text-[10px] uppercase tracking-wide text-text-tertiary">Avg</p>
                <p className="text-[16px] font-bold text-text-primary">{snapshot.avgScore}%</p>
              </div>
              <div className="tt-panel-soft p-2">
                <p className="text-[10px] uppercase tracking-wide text-text-tertiary">Last</p>
                <p className="text-[16px] font-bold text-text-primary">
                  {snapshot.recentScore === null ? "—" : `${snapshot.recentScore}%`}
                </p>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 h-[220px] w-[220px] rounded-full border border-border/25" />
          </div>

          <div className="tt-panel p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">AI Study Coach</p>
              <span className="text-[11px] text-text-secondary">Beta</span>
            </div>
            <div className="tt-panel-soft flex h-[116px] flex-col gap-1.5 overflow-y-auto p-2.5">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[92%] rounded-lg px-2.5 py-1.5 text-[12px] ${
                    msg.role === "assistant"
                      ? "self-start border border-border/60 bg-card/70 text-text-primary"
                      : "self-end border border-cyan-200/30 bg-cyan-400/18 text-cyan-50"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChatMessage();
                }}
                placeholder="Ask for a study plan..."
                className="w-full rounded-xl border border-border/70 bg-card/65 px-3 py-2 text-[13px] text-text-primary outline-none transition-colors focus:border-border-strong"
              />
              <button type="button" onClick={sendChatMessage} className="tt-cta px-3 py-2 text-[12px]">
                Send
              </button>
            </div>
          </div>
        </section>

        <section className="mt-3">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="font-body text-[16px] font-bold text-text-primary">Practice Tests</h3>
            <button type="button" onClick={fetchExams} className="tt-cta px-4 py-2 text-[13px]">
              Refresh
            </button>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {examCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setExamFilter(cat)}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                  examFilter === cat
                    ? "border-border-strong bg-card/85 text-text-primary"
                    : "border-border/60 bg-card/45 text-text-secondary hover:border-border-strong"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {examLoading ? (
            <div className="tt-panel p-5 text-center text-text-secondary">Loading tests...</div>
          ) : examError ? (
            <div className="tt-panel p-5 text-center text-danger">{examError}</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {filteredExams.map((exam) => {
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
                    className={`tt-panel tt-interactive relative flex h-full min-h-[202px] flex-col overflow-hidden border bg-gradient-to-br p-4 pr-[124px] duration-300 ease-out hover:-translate-y-0.5 ${theme.border} ${theme.shell}`}
                  >
                    <div className={`pointer-events-none absolute -bottom-10 right-2 h-24 w-24 rounded-full blur-2xl ${theme.glow}`} />

                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <h2 className="font-body text-[34px] font-semibold leading-none tracking-[0.2px] text-white">
                        {exam.name}
                      </h2>
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
                          onClick={() => openTest(exam.id, selectedDifficulties)}
                          className="mt-auto h-12 w-full rounded-lg border border-warning/35 bg-warning/30 px-2 text-[12px] font-bold text-amber-50 transition-all duration-300 ease-out hover:bg-warning/40"
                        >
                          Unlock →
                        </button>
                      ) : (
                        <button
                          onClick={() => openTest(exam.id, selectedDifficulties)}
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
          )}
        </section>

        <section className="mt-4 grid gap-2.5 md:grid-cols-3">
          <div className="tt-panel-soft p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Stories Loaded</p>
            <p className="mt-1 text-[24px] font-bold text-text-primary">{stories.length}</p>
            <p className="text-[12px] text-text-secondary">Across {sourceCount} communities.</p>
          </div>
          <div className="tt-panel-soft p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Daily Habit</p>
            <p className="mt-1 text-[24px] font-bold text-text-primary">15 min</p>
            <p className="text-[12px] text-text-secondary">Read updates after one test set.</p>
          </div>
          <div className="tt-panel-soft p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Momentum</p>
            <p className="mt-1 text-[24px] font-bold text-text-primary">{snapshot.testsTaken > 0 ? "On" : "Start"}</p>
            <p className="text-[12px] text-text-secondary">Keep your prep streak consistent.</p>
          </div>
        </section>

        <section className="mt-3 grid gap-2.5 md:grid-cols-3">
          {highlights.map((story) => (
            <a
              key={story.id}
              href={story.url}
              target="_blank"
              rel="noreferrer"
              className="tt-panel tt-interactive group overflow-hidden p-3.5 hover:-translate-y-0.5 hover:border-border-strong"
            >
              {story.thumbnail && (
                <div className="mb-2 h-20 overflow-hidden rounded-lg border border-border/40 bg-elevated/70">
                  <img
                    src={story.thumbnail}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              )}
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                {story.source}
              </p>
              <h2 className="mt-1.5 font-body text-[14px] font-bold leading-snug text-text-primary">
                {story.title}
              </h2>
              <p className="mt-3 text-[12px] text-text-secondary">
                {formatRelativeTime(story.createdAt)} •{" "}
                <span className="font-semibold text-text-primary">{story.score}</span> votes •{" "}
                <span className="font-semibold text-text-primary">{story.comments}</span> comments
              </p>
            </a>
          ))}
        </section>

        <section className="mt-3">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="font-body text-[16px] font-bold text-text-primary">Live Feed</h3>
            <button type="button" onClick={fetchStories} className="tt-cta px-4 py-2 text-[13px]">
              Refresh
            </button>
          </div>

          {newsLoading ? (
            <div className="tt-panel p-5 text-center font-body text-text-secondary">Loading stories...</div>
          ) : (
            <div className="tt-panel flex flex-col divide-y divide-border/50">
              {feed.map((story) => (
                <a
                  key={story.id}
                  href={story.url}
                  target="_blank"
                  rel="noreferrer"
                  className="tt-interactive grid grid-cols-[1fr_auto] gap-3 p-4 transition-colors hover:bg-hover/35 md:grid-cols-[72px_1fr_auto]"
                >
                  {story.thumbnail ? (
                    <div className="hidden h-[56px] w-[72px] overflow-hidden rounded-md border border-border/40 bg-elevated/70 md:block">
                      <img src={story.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="hidden h-[56px] w-[72px] items-center justify-center rounded-md border border-border/40 bg-elevated/70 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary md:flex">
                      News
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                      {story.source}
                    </p>
                    <p className="mt-1 font-body text-[14px] font-semibold leading-snug text-text-primary line-clamp-2">
                      {story.title}
                    </p>
                    <p className="mt-1 text-[12px] text-text-secondary">
                      {formatRelativeTime(story.createdAt)} • {story.score} votes • {story.comments} comments
                    </p>
                  </div>
                  <span className="mt-1 shrink-0 text-[13px] font-semibold text-text-secondary">Open ↗</span>
                </a>
              ))}
            </div>
          )}

          {newsError && <p className="mt-3 text-[13px] text-warning">{newsError}</p>}
        </section>
      </div>
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close sign-in prompt"
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]"
            onClick={() => setShowAuthPrompt(false)}
          />
          <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-3xl border border-cyan-200/35 bg-gradient-to-br from-slate-900/95 via-slate-800/94 to-slate-900/96 p-6 shadow-[0_28px_80px_rgba(5,15,30,0.62)]">
            <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-cyan-300/18 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-emerald-300/14 blur-3xl" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-cyan-200/35 bg-cyan-300/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.9px] text-cyan-100">
                Members Only For Test Start
              </p>
              <h3 className="mt-3 font-body text-[28px] font-bold leading-tight text-white">
                Sign in to start this test
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-200/90">
                Free tests are available, but you need an account to save progress and submit answers.
              </p>
              <div className="mt-5 rounded-2xl border border-white/12 bg-black/20 p-3 text-[12px] text-slate-200/85">
                Selected test URL: <span className="font-semibold text-white">{pendingTestUrl || "New test"}</span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/auth", { state: { returnTo: pendingTestUrl } })}
                  className="rounded-xl border border-cyan-200/40 bg-cyan-400/18 px-4 py-3 text-[14px] font-bold text-cyan-50 transition-colors hover:bg-cyan-400/28"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/auth", { state: { defaultMode: "signup", returnTo: pendingTestUrl } })
                  }
                  className="rounded-xl border border-emerald-200/40 bg-emerald-400/18 px-4 py-3 text-[14px] font-bold text-emerald-50 transition-colors hover:bg-emerald-400/30"
                >
                  Create Account
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthPrompt(false)}
                className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/16"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeNews;
