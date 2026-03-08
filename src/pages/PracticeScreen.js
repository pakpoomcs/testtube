// src/pages/PracticeScreen.js
import React from "react";
import { useNavigate } from "react-router-dom";

const EXAMS = [
  { name: "IELTS", emoji: "🇬🇧", accentClass: "border-t-indigo-600" },
  { name: "TOEIC", emoji: "💼", accentClass: "border-t-sky-500" },
  { name: "TOEFL", emoji: "🎓", accentClass: "border-t-violet-500" },
  { name: "ONET", emoji: "🇹🇭", accentClass: "border-t-amber-500" },
  { name: "TCAS", emoji: "📐", accentClass: "border-t-emerald-500" },
  { name: "SAT", emoji: "🏫", accentClass: "border-t-red-500" },
  { name: "GED", emoji: "📜", accentClass: "border-t-pink-500" },
  { name: "DET", emoji: "💻", accentClass: "border-t-cyan-500" },
];

function PracticeScreen() {
  const navigate = useNavigate();

  return (
    <div className="tt-page px-5 pb-24 pt-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-[36px] text-text-primary tracking-[2px] leading-none mb-1">Practice</h1>
        <p className="font-body text-[14px] text-text-secondary">Pick an exam and start a test session</p>
      </div>

      {/* Exam grid */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {EXAMS.map((exam) => (
          <button
            key={exam.name}
            onClick={() => navigate("/")}
            className={`tt-panel flex cursor-pointer flex-col items-center gap-2 border-t-[3px] px-3 py-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/20 ${exam.accentClass}`}
          >
            <span className="text-[26px]">{exam.emoji}</span>
            <span className="font-body font-bold text-[12px] text-text-primary">{exam.name}</span>
          </button>
        ))}
      </div>

      {/* Quick practice */}
      <div>
        <h2 className="font-body font-bold text-[18px] text-text-primary mb-1">⚡ Quick Practice</h2>
        <p className="font-body text-[13px] text-text-secondary mb-4">Jump straight into a random set of questions</p>
        <div className="flex flex-col gap-2.5">
          {["10 Random Questions", "20 Random Questions", "30 Random Questions"].map((opt) => (
            <button
              key={opt}
              onClick={() => navigate("/")}
              className="tt-panel-soft flex cursor-pointer items-center justify-between rounded-xl px-5 py-4 transition-colors hover:border-white/20"
            >
              <span className="font-body font-semibold text-[15px] text-text-primary">{opt}</span>
              <span className="text-teal font-bold text-[18px]">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PracticeScreen;
