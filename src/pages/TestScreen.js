// src/pages/TestScreen.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function TestScreen() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExamAndQuestions(); }, [examId]); // eslint-disable-line

  async function fetchExamAndQuestions() {
    try {
      const { data: examData, error: examError } = await supabase
        .from("exams").select("*").eq("id", examId).single();
      if (examError) throw examError;
      setExam(examData);

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions").select("*").eq("exam_id", examId);
      if (questionsError) throw questionsError;

      const passageMap = {};
      questionsData.forEach((q) => {
        if (q.question_type === "reading" && !q.passage_id) passageMap[q.id] = q;
      });

      const enriched = questionsData.map((q) => {
        if (q.passage_id && passageMap[q.passage_id]) {
          return {
            ...q,
            passage_text: q.passage_text || passageMap[q.passage_id].passage_text,
            passage_title: q.passage_title || passageMap[q.passage_id].passage_title,
          };
        }
        return q;
      });

      enriched.sort(() => Math.random() - 0.5);
      setQuestions(enriched);
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
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  }

  function handleSubmit() {
    if (!hasAnswer) return;
    setSubmitted(true);
  }

  async function handleNext() {
    await saveResult();
    if (isLastQuestion) {
      await saveSession();
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
    } catch (err) { console.error("Save result error:", err.message); }
  }

  async function saveSession() {
    if (!user) return;
    setSaving(true);
    try {
      const total = questions.length;
      const correct = questions.filter((q, i) => answers[i] !== undefined && checkCorrect(q, answers[i])).length;
      await supabase.from("test_sessions").insert({
        user_id: user.id, exam_id: examId,
        score_percent: Math.round((correct / total) * 100),
        correct_count: correct, total_count: total,
      });
    } catch (err) { console.error("Save session error:", err.message); }
    finally { setSaving(false); }
  }

  function checkCorrect(question, answer) {
    if (!question || answer === undefined) return false;
    switch (question.question_type) {
      case "mcq": case "reading": return answer === question.correct_option;
      case "tfng": return answer === question.tfng_answer;
      case "fill_blank": return String(answer).trim().toLowerCase() === String(question.blank_answer).trim().toLowerCase();
      default: return answer === question.correct_option;
    }
  }

  function getCorrectLabel(question) {
    switch (question.question_type) {
      case "mcq": case "reading": return `${question.correct_option.toUpperCase()} — ${question[`option_${question.correct_option}`]}`;
      case "tfng": return question.tfng_answer.replace("_", " ").toUpperCase();
      case "fill_blank": return question.blank_answer;
      default: return question.correct_option;
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case "mcq": return "Multiple Choice";
      case "reading": return "Reading";
      case "tfng": return "True / False / Not Given";
      case "fill_blank": return "Fill in the Blank";
      default: return "Multiple Choice";
    }
  }

  function formatQuestionText(text) {
    if (!text) return "";
    if (text.includes("[BLANK]")) {
      return text.split("[BLANK]").map((part, i, arr) => (
        <React.Fragment key={i}>
          {part}
          {i < arr.length - 1 && (
            <span className="text-teal font-bold border-b-2 border-teal px-1">________</span>
          )}
        </React.Fragment>
      ));
    }
    return text;
  }

  if (loading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="font-body text-text-secondary">Loading questions...</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="font-body text-danger">Error: {error}</p>
    </div>
  );
  if (questions.length === 0) return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4 p-6">
      <p className="font-body text-text-secondary">No questions yet for {exam?.name}.</p>
      <button onClick={() => navigate("/")} className="px-6 py-3 bg-teal text-base rounded-xl font-body font-bold border-none cursor-pointer">
        Go Back
      </button>
    </div>
  );

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = submitted && checkCorrect(currentQuestion, answers[currentIndex]);

  return (
    <div className="min-h-screen bg-base flex flex-col max-w-[720px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={() => navigate("/")}
          className="bg-transparent border-none text-text-secondary text-[18px] cursor-pointer px-2 py-1 rounded-md hover:bg-elevated transition-colors">
          ✕
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-body font-bold text-[15px] text-text-primary">{exam?.name}</span>
          <span className="font-body text-[12px] text-text-secondary">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-border">
        <div className="h-[3px] bg-teal transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Badges */}
      <div className="flex gap-2 px-5 pt-4 flex-wrap">
        <span className="font-body text-[11px] font-semibold text-teal bg-teal/10 px-3 py-1 rounded-full">
          {getTypeLabel(currentQuestion?.question_type)}
        </span>
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
          <FillBlankInput value={answers[currentIndex] || ""} onChange={handleAnswer}
            submitted={submitted} isCorrect={isCorrect} disabled={submitted} />
        ) : currentQuestion?.question_type === "tfng" ? (
          <TFNGInput value={answers[currentIndex]} onChange={handleAnswer}
            submitted={submitted} correct={currentQuestion?.tfng_answer} disabled={submitted} />
        ) : (
          <MCQInput question={currentQuestion} value={answers[currentIndex]} onChange={handleAnswer}
            submitted={submitted} isCorrect={isCorrect} disabled={submitted} />
        )}

        {/* Feedback */}
        {submitted && (
          <div className={`rounded-xl p-4 border ${
            isCorrect ? "bg-success-bg border-success/30" : "bg-danger-bg border-danger/30"
          }`}>
            <p className="font-body font-bold text-[14px] text-text-primary mb-1">
              {isCorrect ? "✅ Correct!" : `❌ Incorrect — ${getCorrectLabel(currentQuestion)}`}
            </p>
            {currentQuestion.explanation && (
              <p className="font-body text-[13px] text-text-secondary leading-relaxed">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border bg-base">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!hasAnswer}
            className={`w-full py-4 bg-teal text-base rounded-xl text-[15px] font-bold font-body border-none cursor-pointer transition-opacity ${hasAnswer ? "opacity-100" : "opacity-30"}`}>
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNext} disabled={saving}
            className={`w-full py-4 bg-teal text-base rounded-xl text-[15px] font-bold font-body border-none cursor-pointer transition-opacity ${saving ? "opacity-60" : "opacity-100"}`}>
            {saving ? "Saving..." : isLastQuestion ? "See Results →" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──

function MCQInput({ question, value, onChange, submitted, isCorrect, disabled }) {
  return (
    <div className="flex flex-col gap-2.5">
      {["a", "b", "c", "d"].map((opt) => {
        const text = question[`option_${opt}`];
        if (!text) return null;
        const selected = value === opt;
        const isCorrectOpt = submitted && opt === question.correct_option;
        const isWrongOpt = submitted && selected && !isCorrect;

        return (
          <button key={opt} onClick={() => !disabled && onChange(opt)} disabled={disabled}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-[1.5px] cursor-pointer text-left transition-all duration-150 ${
              isCorrectOpt ? "bg-success-bg border-success text-success" :
              isWrongOpt ? "bg-danger-bg border-danger text-danger" :
              selected ? "bg-teal/10 border-teal text-teal" :
              "bg-card border-border text-text-primary hover:border-border-strong"
            }`}>
            <span className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center font-body font-bold text-[12px] flex-shrink-0 ${
              isCorrectOpt ? "border-success text-success" :
              isWrongOpt ? "border-danger text-danger" :
              selected ? "border-teal text-teal" : "border-border text-text-secondary"
            }`}>
              {opt.toUpperCase()}
            </span>
            <span className="font-body text-[14px] font-medium leading-snug">{text}</span>
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
          <button key={opt.value} onClick={() => !disabled && onChange(opt.value)} disabled={disabled}
            className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 ${
              isCorrectOpt ? "bg-success-bg border-success text-success" :
              isWrongOpt ? "bg-danger-bg border-danger text-danger" :
              selected ? "bg-teal/10 border-teal text-teal" :
              "bg-card border-border text-text-primary hover:border-border-strong"
            }`}>
            <span className="text-[22px] font-bold">{opt.emoji}</span>
            <span className="font-body font-semibold text-[13px]">{opt.label}</span>
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
          ? isCorrect ? "bg-success-bg border-success" : "bg-danger-bg border-danger"
          : "bg-card border-border focus:border-teal"
      }`}
    />
  );
}

export default TestScreen;
