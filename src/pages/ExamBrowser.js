// src/pages/ExamBrowser.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ExamBrowser() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => { fetchExams(); }, []);

  async function fetchExams() {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*, questions(count)")
        .order("name");
      if (error) throw error;
      setExams(data);
    } catch (err) {
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const categories = ["All", ...new Set(exams.map((e) => e.category))];
  const filtered = filter === "All" ? exams : exams.filter((e) => e.category === filter);

  if (loading) return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4">
      <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
      <p className="font-body text-text-secondary text-[15px]">Loading exams...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="font-body text-danger">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-14 pb-12 bg-elevated">
        <div className="relative z-10 max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-full px-3 py-1 mb-5">
            <span className="text-teal text-[11px] font-semibold font-body tracking-wide uppercase">TestTube</span>
          </div>
          <h1 className="font-heading text-text-primary leading-none mb-4"
              style={{ fontSize: "clamp(42px, 8vw, 72px)", letterSpacing: "2px" }}>
            MASTER<br />EVERY EXAM
          </h1>
          <p className="font-body text-[15px] text-text-secondary leading-relaxed max-w-[480px]">
            Practice tests for IELTS, TOEIC, ONET, TCAS and more — with instant feedback and personalised reports.
          </p>
        </div>
        {/* Decorative rings */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-teal/10 -top-28 -right-16 z-0" />
        <div className="absolute w-[240px] h-[240px] rounded-full border border-teal/[0.06] top-10 right-16 z-0" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-6 pt-6 max-w-[1100px] mx-auto flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-[13px] font-body font-medium cursor-pointer border transition-all duration-150 ${
              filter === cat
                ? "bg-teal text-base border-teal font-semibold"
                : "bg-transparent text-text-secondary border-border hover:border-border-strong"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exam grid */}
      <div className="grid gap-4 max-w-[1100px] mx-auto mt-5 px-6 pb-24"
           style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
        {filtered.map((exam) => {
          const questionCount = exam.questions?.[0]?.count ?? 0;
          const hasQuestions = questionCount > 0;

          return (
            <div key={exam.id}
                 className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col group hover:border-border-strong transition-all duration-200 hover:-translate-y-1">
              {/* Top accent */}
              <div className={`h-[3px] w-full ${exam.is_premium ? "bg-warning" : "bg-teal"}`} />

              <div className="p-6 flex flex-col gap-3 flex-grow">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <h2 className="font-heading text-text-primary text-[28px] tracking-wide leading-none">
                    {exam.name}
                  </h2>
                  {exam.is_premium && (
                    <span className="bg-warning/10 text-warning text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border border-warning/20">
                      ✦ Premium
                    </span>
                  )}
                </div>

                {exam.name_th && (
                  <p className="font-body text-[13px] text-text-tertiary -mt-1">{exam.name_th}</p>
                )}

                <p className="font-body text-[13px] text-text-secondary leading-relaxed flex-grow">
                  {exam.description}
                </p>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap items-center">
                  <span className="font-body text-[12px] text-text-tertiary">
                    {questionCount > 0 ? `${questionCount} question${questionCount !== 1 ? "s" : ""}` : "No questions yet"}
                  </span>
                  <span className="bg-teal/10 text-teal text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    {exam.category}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    exam.difficulty === "Beginner" ? "text-success border-success/30 bg-success-bg" :
                    exam.difficulty === "Advanced" ? "text-danger border-danger/30 bg-danger-bg" :
                    "text-warning border-warning/30 bg-warning-bg"
                  }`}>
                    {exam.difficulty}
                  </span>
                </div>

                {/* CTA button */}
                {!hasQuestions ? (
                  <button disabled
                    className="mt-2 w-full py-3 rounded-xl bg-elevated text-text-tertiary text-[14px] font-semibold font-body border border-border cursor-not-allowed">
                    Coming Soon
                  </button>
                ) : exam.is_premium ? (
                  <button
                    onClick={() => navigate(`/test/${exam.id}`)}
                    className="mt-2 w-full py-3 rounded-xl bg-warning text-base text-[14px] font-semibold font-body border-none cursor-pointer hover:opacity-90 transition-opacity">
                    Unlock & Start →
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/test/${exam.id}`)}
                    className="mt-2 w-full py-3 rounded-xl bg-teal text-base text-[14px] font-semibold font-body border-none cursor-pointer hover:opacity-90 transition-opacity">
                    Start Test →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-12">
        <p className="font-body text-[13px] text-text-tertiary">
          TestTube 🧪 — Built for Thai students, accepted worldwide.
        </p>
      </div>
    </div>
  );
}

export default ExamBrowser;
