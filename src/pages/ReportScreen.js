// src/pages/ReportScreen.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function checkCorrect(question, answer) {
  if (!question || answer === undefined) return false;
  switch (question.question_type) {
    case "mcq": case "reading": return answer === question.correct_option;
    case "tfng": return answer === question.tfng_answer;
    case "fill_blank": return String(answer).trim().toLowerCase() === String(question.blank_answer).trim().toLowerCase();
    default: return answer === question.correct_option;
  }
}

function getAnswerLabel(question, answer) {
  if (!question || answer === undefined) return "—";
  switch (question.question_type) {
    case "mcq": case "reading": return `${String(answer).toUpperCase()} — ${question[`option_${answer}`] || ""}`;
    case "tfng": return String(answer).replace("_", " ").toUpperCase();
    case "fill_blank": return String(answer);
    default: return String(answer).toUpperCase();
  }
}

function getCorrectLabel(question) {
  if (!question) return "—";
  switch (question.question_type) {
    case "mcq": case "reading": return `${question.correct_option.toUpperCase()} — ${question[`option_${question.correct_option}`] || ""}`;
    case "tfng": return String(question.tfng_answer).replace("_", " ").toUpperCase();
    case "fill_blank": return question.blank_answer;
    default: return question.correct_option?.toUpperCase();
  }
}

function ReportScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) { navigate("/practice"); return null; }
  const { answers, questions, exam } = location.state || {};
  if (!questions || questions.length === 0) { navigate("/practice"); return null; }

  const totalQuestions = questions.length;
  const correctCount = questions.filter((q, i) => checkCorrect(q, answers[i])).length;
  const wrongCount = totalQuestions - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const topicBreakdown = questions.reduce((acc, q, i) => {
    const topic = q.topic || "General";
    if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
    acc[topic].total++;
    if (checkCorrect(q, answers[i])) acc[topic].correct++;
    return acc;
  }, {});

  function getGrade() {
    if (scorePercent >= 90) return { grade: "A", color: "text-success", bg: "bg-success-bg border-success/30", message: "Outstanding! You have a strong command of this material." };
    if (scorePercent >= 75) return { grade: "B", color: "text-teal", bg: "bg-teal/10 border-teal/30", message: "Great work! A little more practice on your weak topics and you'll ace it." };
    if (scorePercent >= 60) return { grade: "C", color: "text-warning", bg: "bg-warning-bg border-warning/30", message: "Decent effort. Focus on the topics highlighted below to push your score up." };
    return { grade: "D", color: "text-danger", bg: "bg-danger-bg border-danger/30", message: "Keep going — review each explanation carefully and try again." };
  }

  const { grade, color, bg, message } = getGrade();

  return (
    <div className="tt-page">

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-elevated/55 px-6 py-4 backdrop-blur-sm">
        <button onClick={() => navigate("/practice")}
          className="bg-transparent border border-border text-text-secondary px-4 py-1.5 rounded-lg text-[13px] font-body cursor-pointer hover:border-border-strong transition-colors">
          ← Exams
        </button>
        <span className="font-heading text-[22px] text-text-primary tracking-wide">{exam?.name}</span>
        <span className="font-body text-[13px] text-text-tertiary">Report</span>
      </div>

      <div className="mx-auto flex max-w-[700px] flex-col gap-5 px-6 pb-24 pt-8">

        {/* Score hero */}
        <div className="tt-panel p-10 flex flex-col items-center gap-3 text-center">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-heading text-[32px] ${bg} ${color}`}>
            {grade}
          </div>
          <p className={`font-heading text-[72px] leading-none tracking-wider ${color}`}>{scorePercent}%</p>
          <p className="font-body text-[15px] text-text-secondary">
            {correctCount} correct · {wrongCount} wrong · {totalQuestions} questions
          </p>
          <p className="font-body text-[14px] text-text-secondary max-w-[380px] leading-relaxed">{message}</p>
        </div>

        {/* Topic breakdown */}
        <div className="tt-panel p-6 flex flex-col gap-4">
          <h3 className="font-body font-bold text-[16px] text-text-primary">Performance by Topic</h3>
          {Object.entries(topicBreakdown).map(([topic, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            const barColor = pct >= 75 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-danger";
            const textColor = pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-danger";
            return (
              <div key={topic} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="font-body font-semibold text-[14px] text-text-primary">{topic}</span>
                  <span className={`font-body font-bold text-[14px] ${textColor}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggestions */}
        <div className="tt-panel p-6 flex flex-col gap-3">
          <h3 className="font-body font-bold text-[16px] text-text-primary">💡 How to Improve</h3>
          {Object.entries(topicBreakdown).filter(([, s]) => s.correct / s.total < 0.75).length === 0 ? (
            <p className="font-body text-[14px] text-text-secondary">No major weak areas — try a harder difficulty next time!</p>
          ) : (
            Object.entries(topicBreakdown).filter(([, s]) => s.correct / s.total < 0.75).map(([topic, stats]) => (
              <div key={topic} className="bg-warning-bg border border-warning/20 rounded-xl px-4 py-3">
                <p className="font-body font-bold text-[14px] text-text-primary mb-1">📌 {topic}</p>
                <p className="font-body text-[13px] text-text-secondary leading-relaxed">
                  You scored {stats.correct}/{stats.total} here. Practice more {topic.toLowerCase()} exercises and re-read the explanations for questions you missed.
                </p>
              </div>
            ))
          )}
        </div>

        {/* Question review */}
        <div className="tt-panel p-6 flex flex-col gap-3">
          <h3 className="font-body font-bold text-[16px] text-text-primary">📝 Question Review</h3>
          {questions.map((q, i) => {
            const isCorrect = checkCorrect(q, answers[i]);
            return (
              <div key={i} className={`tt-panel-soft border-l-4 p-4 ${isCorrect ? "border-l-success" : "border-l-danger"}`}>
                <p className="font-body font-semibold text-[14px] text-text-primary leading-relaxed mb-1.5">
                  {i + 1}. {q.question_text}
                </p>
                <p className={`font-body font-bold text-[13px] ${isCorrect ? "text-success" : "text-danger"}`}>
                  {isCorrect ? "✅ Correct" : `❌ You answered: ${getAnswerLabel(q, answers[i])} · Correct: ${getCorrectLabel(q)}`}
                </p>
                {!isCorrect && q.explanation && (
                  <p className="font-body text-[13px] text-text-secondary leading-relaxed mt-2 pt-2 border-t border-border">
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={() => navigate("/practice")}
            className="flex-1 py-4 bg-transparent border border-border text-text-primary rounded-xl font-body font-semibold text-[15px] cursor-pointer hover:border-border-strong transition-colors">
            ← Back to Exams
          </button>
          <button onClick={() => navigate(`/test/${exam.id}`)}
            className="flex-1 py-4 bg-teal text-base border-none rounded-xl font-body font-bold text-[15px] cursor-pointer hover:opacity-90 transition-opacity">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportScreen;
