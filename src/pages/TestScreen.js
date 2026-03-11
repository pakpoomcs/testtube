// src/pages/TestScreen.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";

// ── Sound Effects (Web Audio API) ──
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new AudioCtx();
  return _audioCtx;
}

function playTone(freq, duration, type = "sine", gain = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

function playSelectSound() {
  playTone(600, 0.08, "sine", 0.12);
  setTimeout(() => playTone(800, 0.06, "sine", 0.1), 50);
}

function playTypeSound() {
  const freq = 400 + Math.random() * 200;
  playTone(freq, 0.04, "square", 0.05);
}

function playCorrectSound() {
  playTone(523, 0.12, "sine", 0.18);
  setTimeout(() => playTone(659, 0.12, "sine", 0.18), 100);
  setTimeout(() => playTone(784, 0.2, "sine", 0.18), 200);
}

function playWrongSound() {
  playTone(300, 0.2, "sawtooth", 0.12);
  setTimeout(() => playTone(250, 0.3, "sawtooth", 0.12), 150);
}

// ── Timer helpers ──
function getTimerKey(examId) {
  return `testtube_timer_${examId}`;
}
function getProgressKey(examId) {
  return `testtube_progress_${examId}`;
}
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function normalizeDifficulty(value) {
  const lower = String(value || "")
    .trim()
    .toLowerCase();
  if (lower === "easy") return "Easy";
  if (lower === "medium") return "Medium";
  if (lower === "hard") return "Hard";
  return "";
}

function TestScreen() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAnswerQuestion, questionsRemaining, FREE_DAILY_LIMIT, refetchUsage } = useSubscription();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // ── Timer: start / resume / persist ──
  useEffect(() => {
    const saved = localStorage.getItem(getTimerKey(examId));
    if (saved) setElapsed(parseInt(saved, 10) || 0);
  }, [examId]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        localStorage.setItem(getTimerKey(examId), String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [examId]);

  // ── Restore saved progress ──
  useEffect(() => {
    const saved = localStorage.getItem(getProgressKey(examId));
    if (saved) {
      try {
        const { currentIndex: ci, answers: ans } = JSON.parse(saved);
        if (ci !== undefined) setCurrentIndex(ci);
        if (ans) setAnswers(ans);
      } catch (_) {}
    }
  }, [examId]);

  // ── Auto-save progress on change ──
  const saveProgressToLocal = useCallback(() => {
    localStorage.setItem(
      getProgressKey(examId),
      JSON.stringify({ currentIndex, answers })
    );
  }, [examId, currentIndex, answers]);

  useEffect(() => {
    saveProgressToLocal();
  }, [saveProgressToLocal]);

  const selectedDifficulties = React.useMemo(() => {
    const raw = new URLSearchParams(location.search).get("difficulty");
    if (!raw) return [];
    const values = raw.split(",").map(normalizeDifficulty).filter(Boolean);
    return Array.from(new Set(values));
  }, [location.search]);

  useEffect(() => {
    fetchExamAndQuestions();
  }, [examId, location.search]); // eslint-disable-line

  async function fetchExamAndQuestions() {
    try {
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();
      if (examError) throw examError;
      setExam(examData);

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId);
      if (questionsError) throw questionsError;

      const passageMap = {};
      questionsData.forEach((q) => {
        if (q.question_type === "reading" && !q.passage_id)
          passageMap[q.id] = q;
      });

      const enriched = questionsData.map((q) => {
        if (q.passage_id && passageMap[q.passage_id]) {
          return {
            ...q,
            passage_text:
              q.passage_text || passageMap[q.passage_id].passage_text,
            passage_title:
              q.passage_title || passageMap[q.passage_id].passage_title,
          };
        }
        return q;
      });

      const filteredQuestions = selectedDifficulties.length
        ? enriched.filter((q) =>
            selectedDifficulties.includes(normalizeDifficulty(q.difficulty))
          )
        : enriched;

      filteredQuestions.sort(() => Math.random() - 0.5);
      setQuestions(filteredQuestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswer = answers[currentIndex] !== undefined;

  function handleAnswer(value) {
    if (submitted) return;
    if (currentQuestion?.question_type !== "fill_blank") playSelectSound();
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  }

  function handleTypingAnswer(value) {
    if (submitted) return;
    playTypeSound();
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  }

  function handleSubmit() {
    if (!hasAnswer) return;
    setSubmitted(true);
    const correct = checkCorrect(currentQuestion, answers[currentIndex]);
    if (correct) playCorrectSound();
    else playWrongSound();
  }

  function handleSaveAndExit() {
    saveProgressToLocal();
    navigate("/practice");
  }

  async function handleNext() {
    await saveResult();
    await refetchUsage();
    if (isLastQuestion) {
      await saveSession();
      localStorage.removeItem(getTimerKey(examId));
      localStorage.removeItem(getProgressKey(examId));
      navigate("/report", { state: { answers, questions, exam } });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSubmitted(false);
    }
  }

  async function saveResult() {
    if (!user || !currentQuestion) return;
    try {
      await supabase.from("user_results").insert({
        user_id: user.id,
        question_id: currentQuestion.id,
        exam_id: examId,
        selected_option: String(answers[currentIndex]),
        is_correct: checkCorrect(currentQuestion, answers[currentIndex]),
      });
    } catch (err) {
      console.error("Save result error:", err.message);
    }
  }

  async function saveSession() {
    if (!user) return;
    setSaving(true);
    try {
      const total = questions.length;
      const correct = questions.filter(
        (q, i) => answers[i] !== undefined && checkCorrect(q, answers[i])
      ).length;
      await supabase.from("test_sessions").insert({
        user_id: user.id,
        exam_id: examId,
        score_percent: Math.round((correct / total) * 100),
        correct_count: correct,
        total_count: total,
      });
    } catch (err) {
      console.error("Save session error:", err.message);
    } finally {
      setSaving(false);
    }
  }

  function checkCorrect(question, answer) {
    if (!question || answer === undefined) return false;
    switch (question.question_type) {
      case "mcq":
      case "reading":
        return answer === question.correct_option;
      case "tfng":
        return answer === question.tfng_answer;
      case "fill_blank":
        return (
          String(answer).trim().toLowerCase() ===
          String(question.blank_answer).trim().toLowerCase()
        );
      default:
        return answer === question.correct_option;
    }
  }

  function getCorrectLabel(question) {
    switch (question.question_type) {
      case "mcq":
      case "reading":
        return `${question.correct_option.toUpperCase()} — ${question[`option_${question.correct_option}`]}`;
      case "tfng":
        return question.tfng_answer.replace("_", " ").toUpperCase();
      case "fill_blank":
        return question.blank_answer;
      default:
        return question.correct_option;
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case "mcq":
        return "Multiple Choice";
      case "reading":
        return "Reading";
      case "tfng":
        return "True / False / Not Given";
      case "fill_blank":
        return "Fill in the Blank";
      default:
        return "Multiple Choice";
    }
  }

  function formatQuestionText(text) {
    if (!text) return "";
    if (text.includes("[BLANK]")) {
      return text.split("[BLANK]").map((part, i, arr) => (
        <React.Fragment key={i}>
          {part}
          {i < arr.length - 1 && (
            <span className="text-teal font-bold border-b-2 border-teal px-1">
              ________
            </span>
          )}
        </React.Fragment>
      ));
    }
    return text;
  }

  // Daily limit reached — show paywall
  if (!loading && !canAnswerQuestion)
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning-bg border border-warning/30">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-warning" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="font-body font-bold text-[22px] text-text-primary">Daily limit reached</h2>
          <p className="font-body text-[14px] text-text-secondary mt-2 max-w-[300px] leading-relaxed">
            You've answered {FREE_DAILY_LIMIT} questions today. Upgrade to Premium for unlimited practice.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button
            onClick={() => navigate("/pricing")}
            className="w-full py-4 bg-teal text-base border-none rounded-xl font-body font-bold text-[15px] cursor-pointer shadow-[0_8px_24px_rgba(20,184,166,0.3)] hover:brightness-105 transition-all"
          >
            Upgrade to Premium — ฿99/mo
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-transparent border border-border text-text-secondary rounded-xl font-body font-semibold text-[14px] cursor-pointer hover:border-border-strong transition-colors"
          >
            Back to Home
          </button>
        </div>
        <p className="font-body text-[12px] text-text-tertiary">Resets at midnight · {FREE_DAILY_LIMIT} free questions/day</p>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <p className="font-body text-text-secondary">Loading questions...</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <p className="font-body text-danger">Error: {error}</p>
      </div>
    );
  if (questions.length === 0)
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4 p-6">
        <p className="font-body text-text-secondary">
          {selectedDifficulties.length
            ? `No ${selectedDifficulties.join(" / ")} questions available for ${exam?.name}.`
            : `No questions yet for ${exam?.name}.`}
        </p>
        <button
          onClick={() => navigate("/practice")}
          className="px-6 py-3 bg-teal text-base rounded-xl font-body font-bold border-none cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect =
    submitted && checkCorrect(currentQuestion, answers[currentIndex]);

  return (
    <div className="min-h-screen bg-base flex flex-col max-w-[720px] mx-auto pb-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button
          onClick={() => navigate("/practice")}
          className="bg-transparent border-none text-text-secondary text-[18px] cursor-pointer px-2 py-1 rounded-md hover:bg-elevated transition-colors"
        >
          ✕
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-body font-bold text-[15px] text-text-primary">
            {exam?.name}
          </span>
          <span className="font-body text-[12px] text-text-secondary">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {questionsRemaining !== Infinity && questionsRemaining <= 10 && (
            <span className="font-body text-[11px] text-warning bg-warning-bg border border-warning/20 px-2 py-0.5 rounded-full">
              {questionsRemaining} left today
            </span>
          )}
          <span className="font-mono text-[14px] text-teal font-bold min-w-[52px] text-right">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-border">
        <div
          className="h-[3px] bg-teal transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Badges */}
      <div className="flex gap-2 px-5 pt-4 flex-wrap">
        <span className="font-body text-[11px] font-semibold text-teal bg-teal/10 px-3 py-1 rounded-full">
          {getTypeLabel(currentQuestion?.question_type)}
        </span>
        {currentQuestion?.difficulty && (
          <span className="font-body text-[11px] text-text-secondary bg-elevated px-3 py-1 rounded-full border border-border">
            {normalizeDifficulty(currentQuestion.difficulty) ||
              currentQuestion.difficulty}
          </span>
        )}
        {currentQuestion?.topic && (
          <span className="font-body text-[11px] text-text-secondary bg-elevated px-3 py-1 rounded-full border border-border">
            {currentQuestion.topic}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-5 flex flex-col gap-5 overflow-y-auto">
        {/* Reading passage */}
        {currentQuestion?.passage_text && (
          <div className="bg-elevated border border-border rounded-xl p-5 max-h-[280px] overflow-y-auto">
            {currentQuestion.passage_title && (
              <p className="font-body font-bold text-[13px] text-text-secondary uppercase tracking-wider mb-3">
                {currentQuestion.passage_title}
              </p>
            )}
            <p className="font-body text-[14px] text-text-primary leading-[1.8]">
              {currentQuestion.passage_text}
            </p>
          </div>
        )}

        {/* Question */}
        <p className="font-body font-medium text-[17px] text-text-primary leading-relaxed">
          {formatQuestionText(currentQuestion?.question_text)}
        </p>

        {/* Answer inputs */}
        {currentQuestion?.question_type === "fill_blank" ? (
          <FillBlankInput
            value={answers[currentIndex] || ""}
            onChange={handleTypingAnswer}
            submitted={submitted}
            isCorrect={isCorrect}
            disabled={submitted}
          />
        ) : currentQuestion?.question_type === "tfng" ? (
          <TFNGInput
            value={answers[currentIndex]}
            onChange={handleAnswer}
            submitted={submitted}
            correct={currentQuestion?.tfng_answer}
            disabled={submitted}
          />
        ) : (
          <MCQInput
            question={currentQuestion}
            value={answers[currentIndex]}
            onChange={handleAnswer}
            submitted={submitted}
            isCorrect={isCorrect}
            disabled={submitted}
          />
        )}

        {/* Feedback */}
        {submitted && (
          <div
            className={`rounded-xl p-4 border ${
              isCorrect
                ? "bg-success-bg border-success/30"
                : "bg-danger-bg border-danger/30"
            }`}
          >
            <p className="font-body font-bold text-[14px] text-text-primary mb-1">
              {isCorrect
                ? "✅ Correct!"
                : `❌ Incorrect — ${getCorrectLabel(currentQuestion)}`}
            </p>
            {currentQuestion.explanation && (
              <p className="font-body text-[13px] text-text-secondary leading-relaxed">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer — sticky on mobile */}
      <div className="sticky bottom-0 px-5 py-4 border-t border-border bg-base flex flex-col gap-2.5 z-10">
        {!submitted ? (
          <>
            <button
              onClick={handleSubmit}
              disabled={!hasAnswer}
              className={`w-full py-4 bg-teal text-base rounded-xl text-[15px] font-bold font-body border-none cursor-pointer transition-opacity ${hasAnswer ? "opacity-100" : "opacity-30"}`}
            >
              Submit Answer
            </button>
            <button
              onClick={handleSaveAndExit}
              className="w-full py-3 bg-transparent text-text-secondary rounded-xl text-[14px] font-semibold font-body border border-border cursor-pointer hover:bg-elevated transition-colors"
            >
              Save Progress & Exit
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            disabled={saving}
            className={`w-full py-4 bg-teal text-base rounded-xl text-[15px] font-bold font-body border-none cursor-pointer transition-opacity ${saving ? "opacity-60" : "opacity-100"}`}
          >
            {saving
              ? "Saving..."
              : isLastQuestion
                ? "See Results →"
                : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──

function MCQInput({
  question,
  value,
  onChange,
  submitted,
  isCorrect,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {["a", "b", "c", "d"].map((opt) => {
        const text = question[`option_${opt}`];
        if (!text) return null;
        const selected = value === opt;
        const isCorrectOpt = submitted && opt === question.correct_option;
        const isWrongOpt = submitted && selected && !isCorrect;

        return (
          <button
            key={opt}
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-[1.5px] cursor-pointer text-left transition-all duration-150 ${
              isCorrectOpt
                ? "bg-success-bg border-success text-success"
                : isWrongOpt
                  ? "bg-danger-bg border-danger text-danger"
                  : selected
                    ? "bg-teal/10 border-teal text-teal"
                    : "bg-card border-border text-text-primary hover:border-border-strong"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center font-body font-bold text-[12px] flex-shrink-0 ${
                isCorrectOpt
                  ? "border-success text-success"
                  : isWrongOpt
                    ? "border-danger text-danger"
                    : selected
                      ? "border-teal text-teal"
                      : "border-border text-text-secondary"
              }`}
            >
              {opt.toUpperCase()}
            </span>
            <span className="font-body text-[14px] font-medium leading-snug">
              {text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TFNGInput({ value, onChange, submitted, correct, disabled }) {
  const options = [
    { value: "true", label: "True", emoji: "✓" },
    { value: "false", label: "False", emoji: "✗" },
    { value: "not_given", label: "Not Given", emoji: "?" },
  ];
  return (
    <div className="flex gap-2.5">
      {options.map((opt) => {
        const selected = value === opt.value;
        const isCorrectOpt = submitted && opt.value === correct;
        const isWrongOpt = submitted && selected && opt.value !== correct;
        return (
          <button
            key={opt.value}
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 ${
              isCorrectOpt
                ? "bg-success-bg border-success text-success"
                : isWrongOpt
                  ? "bg-danger-bg border-danger text-danger"
                  : selected
                    ? "bg-teal/10 border-teal text-teal"
                    : "bg-card border-border text-text-primary hover:border-border-strong"
            }`}
          >
            <span className="text-[22px] font-bold">{opt.emoji}</span>
            <span className="font-body font-semibold text-[13px]">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FillBlankInput({ value, onChange, submitted, isCorrect, disabled }) {
  return (
    <input
      placeholder="Type your answer here..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      autoFocus
      className={`w-full px-5 py-4 rounded-xl border-[1.5px] text-[16px] font-body text-text-primary outline-none transition-colors ${
        submitted
          ? isCorrect
            ? "bg-success-bg border-success"
            : "bg-danger-bg border-danger"
          : "bg-card border-border focus:border-teal"
      }`}
    />
  );
}

export default TestScreen;
