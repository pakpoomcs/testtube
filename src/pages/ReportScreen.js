// src/pages/ReportScreen.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";

const { colors, fonts } = theme;

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

function getAnswerLabel(question, answer) {
  if (!question || answer === undefined) return "—";
  switch (question.question_type) {
    case "mcq":
    case "reading":
      return `${String(answer).toUpperCase()} — ${question[`option_${answer}`] || ""}`;
    case "tfng":
      return String(answer).replace("_", " ").toUpperCase();
    case "fill_blank":
      return String(answer);
    default:
      return String(answer).toUpperCase();
  }
}

function getCorrectLabel(question) {
  if (!question) return "—";
  switch (question.question_type) {
    case "mcq":
    case "reading":
      return `${question.correct_option.toUpperCase()} — ${question[`option_${question.correct_option}`] || ""}`;
    case "tfng":
      return String(question.tfng_answer).replace("_", " ").toUpperCase();
    case "fill_blank":
      return question.blank_answer;
    default:
      return question.correct_option?.toUpperCase();
  }
}

function ReportScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    navigate("/");
    return null;
  }

  const { answers, questions, exam } = location.state || {};

  if (!questions || questions.length === 0) {
    navigate("/");
    return null;
  }

  const totalQuestions = questions.length;
  const correctCount = questions.filter((q, i) =>
    checkCorrect(q, answers[i])
  ).length;
  const wrongCount = totalQuestions - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Topic breakdown
  const topicBreakdown = questions.reduce((acc, q, i) => {
    const topic = q.topic || "General";
    if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
    acc[topic].total++;
    if (checkCorrect(q, answers[i])) acc[topic].correct++;
    return acc;
  }, {});

  function getGrade() {
    if (scorePercent >= 90)
      return {
        grade: "A",
        color: colors.success,
        message: "Outstanding! You have a strong command of this material.",
      };
    if (scorePercent >= 75)
      return {
        grade: "B",
        color: colors.teal,
        message:
          "Great work! A little more practice on your weak topics and you'll ace it.",
      };
    if (scorePercent >= 60)
      return {
        grade: "C",
        color: colors.warning,
        message:
          "Decent effort. Focus on the topics highlighted below to push your score up.",
      };
    return {
      grade: "D",
      color: colors.danger,
      message:
        "Keep going — review each explanation carefully and try again. Progress takes practice.",
    };
  }

  const { grade, color, message } = getGrade();

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Exams
        </button>
        <span style={styles.examLabel}>{exam?.name}</span>
        <span style={styles.topBarRight}>Report</span>
      </div>

      <div style={styles.content}>
        {/* Score hero */}
        <div style={styles.scoreCard}>
          <div style={{ ...styles.gradeBadge, backgroundColor: color }}>
            {grade}
          </div>
          <h1 style={styles.scorePercent}>{scorePercent}%</h1>
          <p style={styles.scoreLine}>
            {correctCount} correct · {wrongCount} wrong · {totalQuestions}{" "}
            questions
          </p>
          <p style={styles.message}>{message}</p>
        </div>

        {/* Topic breakdown */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Performance by Topic</h3>
          <div style={styles.topicList}>
            {Object.entries(topicBreakdown).map(([topic, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              const barColor =
                pct >= 75
                  ? colors.success
                  : pct >= 50
                    ? colors.warning
                    : colors.danger;
              return (
                <div key={topic} style={styles.topicRow}>
                  <div style={styles.topicMeta}>
                    <span style={styles.topicName}>{topic}</span>
                    <span style={{ ...styles.topicPct, color: barColor }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${pct}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggestions */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💡 How to Improve</h3>
          {Object.entries(topicBreakdown).filter(
            ([, s]) => s.correct / s.total < 0.75
          ).length === 0 ? (
            <p style={styles.suggestionText}>
              No major weak areas — try a harder difficulty next time!
            </p>
          ) : (
            Object.entries(topicBreakdown)
              .filter(([, s]) => s.correct / s.total < 0.75)
              .map(([topic, stats]) => (
                <div key={topic} style={styles.suggestionCard}>
                  <p style={styles.suggestionTopic}>📌 {topic}</p>
                  <p style={styles.suggestionText}>
                    You scored {stats.correct}/{stats.total} here. Practice more{" "}
                    {topic.toLowerCase()} exercises and re-read the explanations
                    for questions you missed.
                  </p>
                </div>
              ))
          )}
        </div>

        {/* Question review */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📝 Question Review</h3>
          <div style={styles.reviewList}>
            {questions.map((q, i) => {
              const isCorrect = checkCorrect(q, answers[i]);
              const userAnswer = answers[i];
              return (
                <div
                  key={i}
                  style={{
                    ...styles.reviewCard,
                    borderLeft: `4px solid ${isCorrect ? colors.success : colors.danger}`,
                  }}
                >
                  <p style={styles.reviewQ}>
                    {i + 1}. {q.question_text}
                  </p>
                  <p
                    style={{
                      ...styles.reviewResult,
                      color: isCorrect ? colors.success : colors.danger,
                    }}
                  >
                    {isCorrect
                      ? "✅ Correct"
                      : `❌ You answered: ${getAnswerLabel(q, userAnswer)} · Correct: ${getCorrectLabel(q)}`}
                  </p>
                  {!isCorrect && q.explanation && (
                    <p style={styles.reviewExplanation}>{q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button style={styles.buttonSecondary} onClick={() => navigate("/")}>
            ← Back to Exams
          </button>
          <button
            style={styles.buttonPrimary}
            onClick={() => navigate(`/test/${exam.id}`)}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: colors.offWhite },
  topBar: {
    backgroundColor: colors.navy,
    padding: "14px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.2)",
    color: colors.gray300,
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: fonts.body,
    cursor: "pointer",
  },
  examLabel: {
    fontFamily: fonts.heading,
    fontSize: "22px",
    color: colors.white,
    letterSpacing: "1px",
  },
  topBarRight: {
    fontSize: "13px",
    color: colors.gray300,
    fontFamily: fonts.body,
  },
  content: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "32px 24px 80px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  scoreCard: {
    backgroundColor: colors.navy,
    borderRadius: "20px",
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    textAlign: "center",
  },
  gradeBadge: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.heading,
    fontSize: "36px",
    color: colors.white,
  },
  scorePercent: {
    fontFamily: fonts.heading,
    fontSize: "72px",
    color: colors.white,
    letterSpacing: "2px",
    lineHeight: "1",
  },
  scoreLine: {
    fontFamily: fonts.body,
    fontSize: "15px",
    color: colors.gray300,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: "15px",
    color: colors.gray300,
    maxWidth: "420px",
    lineHeight: "1.6",
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "16px",
    color: colors.navy,
  },
  topicList: { display: "flex", flexDirection: "column", gap: "14px" },
  topicRow: { display: "flex", flexDirection: "column", gap: "6px" },
  topicMeta: { display: "flex", justifyContent: "space-between" },
  topicName: {
    fontSize: "14px",
    fontWeight: "600",
    color: colors.navy,
    fontFamily: fonts.body,
  },
  topicPct: { fontSize: "14px", fontWeight: "700", fontFamily: fonts.body },
  barTrack: {
    height: "8px",
    backgroundColor: colors.gray100,
    borderRadius: "100px",
    overflow: "hidden",
  },
  barFill: {
    height: "8px",
    borderRadius: "100px",
    transition: "width 0.6s ease",
  },
  suggestionCard: {
    backgroundColor: colors.warningLight,
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  suggestionTopic: {
    fontWeight: "700",
    fontSize: "14px",
    color: colors.navy,
    fontFamily: fonts.body,
  },
  suggestionText: {
    fontSize: "14px",
    color: colors.gray700,
    lineHeight: "1.6",
    fontFamily: fonts.body,
  },
  reviewList: { display: "flex", flexDirection: "column", gap: "12px" },
  reviewCard: {
    padding: "14px 16px",
    borderRadius: "10px",
    backgroundColor: colors.offWhite,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  reviewQ: {
    fontSize: "14px",
    fontWeight: "600",
    color: colors.navy,
    lineHeight: "1.5",
    fontFamily: fonts.body,
  },
  reviewResult: { fontSize: "13px", fontWeight: "700", fontFamily: fonts.body },
  reviewExplanation: {
    fontSize: "13px",
    color: colors.gray700,
    lineHeight: "1.6",
    fontFamily: fonts.body,
    borderTop: `1px solid ${colors.gray100}`,
    paddingTop: "8px",
    marginTop: "2px",
  },
  buttonRow: { display: "flex", gap: "12px" },
  buttonSecondary: {
    flex: 1,
    padding: "14px",
    backgroundColor: colors.white,
    color: colors.navy,
    border: `2px solid ${colors.navy}`,
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: fonts.body,
    cursor: "pointer",
  },
  buttonPrimary: {
    flex: 1,
    padding: "14px",
    backgroundColor: colors.navy,
    color: colors.white,
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: fonts.body,
    cursor: "pointer",
  },
};

export default ReportScreen;
