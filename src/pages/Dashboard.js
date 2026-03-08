// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [topicStats, setTopicStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("test_sessions").select("*, exams(name)")
        .eq("user_id", user.id).order("completed_at", { ascending: false });
      if (sessionError) throw sessionError;

      const { data: resultsData, error: resultsError } = await supabase
        .from("user_results").select("is_correct, questions(topic)").eq("user_id", user.id);
      if (resultsError) throw resultsError;

      const topicMap = resultsData.reduce((acc, row) => {
        const topic = row.questions?.topic || "General";
        if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
        acc[topic].total++;
        if (row.is_correct) acc[topic].correct++;
        return acc;
      }, {});

      setSessions(sessionData);
      setTopicStats(Object.entries(topicMap)
        .map(([topic, stats]) => ({ topic, ...stats, percent: Math.round((stats.correct / stats.total) * 100) }))
        .sort((a, b) => b.total - a.total));
    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalTests = sessions.length;
  const avgScore = totalTests > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.score_percent, 0) / totalTests) : 0;
  const bestScore = totalTests > 0 ? Math.max(...sessions.map((s) => s.score_percent)) : 0;
  const totalQuestions = sessions.reduce((sum, s) => sum + s.total_count, 0);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function scoreColorClass(pct) {
    if (pct >= 75) return "bg-success";
    if (pct >= 50) return "bg-warning";
    return "bg-danger";
  }

  function scoreBarClass(pct) {
    if (pct >= 75) return "bg-success";
    if (pct >= 50) return "bg-warning";
    return "bg-danger";
  }

  function scoreTextClass(pct) {
    if (pct >= 75) return "text-success";
    if (pct >= 50) return "text-warning";
    return "text-danger";
  }

  if (loading) return (
    <div className="tt-page flex items-center justify-center">
      <p className="font-body text-text-secondary">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="tt-page">
      <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-6 pb-24 pt-10">

        {/* Welcome */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-[40px] text-text-primary tracking-wide leading-none">Your Dashboard</h1>
            <p className="font-body text-[14px] text-text-secondary mt-2">{user.email}</p>
          </div>
          <button onClick={() => navigate("/practice")}
            className="tt-cta">
            Take a Test →
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {[
            { label: "Tests Taken", value: totalTests, unit: "" },
            { label: "Average Score", value: avgScore, unit: "%" },
            { label: "Best Score", value: bestScore, unit: "%" },
            { label: "Questions Answered", value: totalQuestions, unit: "" },
          ].map((stat) => (
            <div key={stat.label} className="tt-panel p-6 flex flex-col gap-1.5">
              <p className="font-heading text-[40px] text-teal tracking-wide leading-none">{stat.value}{stat.unit}</p>
              <p className="font-body text-[13px] text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {totalTests === 0 ? (
          <div className="tt-panel p-16 flex flex-col items-center gap-3 text-center">
            <span className="text-[48px]">📝</span>
            <h2 className="font-body font-bold text-[20px] text-text-primary">No tests taken yet</h2>
            <p className="font-body text-[14px] text-text-secondary">Complete your first test to see your performance here.</p>
            <button onClick={() => navigate("/practice")} className="tt-cta mt-2">
              Browse Exams →
            </button>
          </div>
        ) : (
          <>
            {/* Topic performance */}
            {topicStats.length > 0 && (
              <div className="tt-panel p-6 flex flex-col gap-5">
                <h2 className="font-body font-bold text-[17px] text-text-primary">Performance by Topic</h2>
                {topicStats.map((t) => (
                  <div key={t.topic} className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="font-body font-semibold text-[14px] text-text-primary">{t.topic}</span>
                      <span className={`font-body font-bold text-[14px] ${scoreTextClass(t.percent)}`}>
                        {t.percent}% ({t.correct}/{t.total})
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full transition-all duration-700 ${scoreBarClass(t.percent)}`}
                           style={{ width: `${t.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Test history */}
            <div className="tt-panel p-6 flex flex-col gap-4">
              <h2 className="font-body font-bold text-[17px] text-text-primary">Test History</h2>
              {sessions.map((session) => (
                <div key={session.id} className="tt-panel-soft flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-body font-bold text-[12px] text-base flex-shrink-0 ${scoreColorClass(session.score_percent)}`}>
                      {session.score_percent}%
                    </div>
                    <div>
                      <p className="font-body font-bold text-[15px] text-text-primary">{session.exams?.name}</p>
                      <p className="font-body text-[13px] text-text-secondary mt-0.5">
                        {session.correct_count}/{session.total_count} correct · {formatDate(session.completed_at)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/test/${session.exam_id}`)}
                    className="bg-transparent border border-border text-text-secondary px-4 py-2 rounded-lg text-[13px] font-semibold font-body cursor-pointer hover:border-border-strong transition-colors whitespace-nowrap">
                    Retake →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
