// src/pages/PracticeScreen.js
import React from "react";
import { useNavigate } from "react-router-dom";

const EXAMS = [
  { name: "IELTS", emoji: "🇬🇧", color: "#4F46E5" },
  { name: "TOEIC", emoji: "💼", color: "#0EA5E9" },
  { name: "TOEFL", emoji: "🎓", color: "#8B5CF6" },
  { name: "ONET", emoji: "🇹🇭", color: "#F59E0B" },
  { name: "TCAS", emoji: "📐", color: "#10B981" },
  { name: "SAT", emoji: "🏫", color: "#EF4444" },
  { name: "GED", emoji: "📜", color: "#EC4899" },
  { name: "DET", emoji: "💻", color: "#06B6D4" },
];

function PracticeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base px-5 pt-8 pb-24">

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
            className="bg-elevated border border-border rounded-2xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer hover:border-border-strong transition-all duration-150 hover:-translate-y-0.5"
            style={{ borderTop: `3px solid ${exam.color}` }}
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
              className="bg-elevated border border-border rounded-xl px-5 py-4 flex justify-between items-center cursor-pointer hover:border-border-strong transition-colors"
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
