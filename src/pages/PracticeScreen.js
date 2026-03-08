// src/pages/PracticeScreen.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";

const { colors, fonts } = theme;

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
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Practice</h1>
        <p style={styles.subtitle}>Pick an exam and start a test session</p>
      </div>

      <div style={styles.grid}>
        {EXAMS.map((exam) => (
          <button
            key={exam.name}
            style={{ ...styles.card, borderTop: `4px solid ${exam.color}` }}
            onClick={() => navigate("/", { state: { scrollTo: exam.name } })}
          >
            <span style={styles.cardEmoji}>{exam.emoji}</span>
            <span style={styles.cardName}>{exam.name}</span>
          </button>
        ))}
      </div>

      <div style={styles.quickSection}>
        <h2 style={styles.sectionTitle}>⚡ Quick Practice</h2>
        <p style={styles.sectionSubtitle}>
          Jump straight into a random set of questions
        </p>
        <div style={styles.quickGrid}>
          {[
            "10 Random Questions",
            "20 Random Questions",
            "30 Random Questions",
          ].map((opt) => (
            <button
              key={opt}
              style={styles.quickCard}
              onClick={() => navigate("/")}
            >
              <span style={styles.quickText}>{opt}</span>
              <span style={styles.quickArrow}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.offWhite,
    padding: "24px 20px",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: "36px",
    color: colors.navy,
    letterSpacing: "2px",
    marginBottom: "4px",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: "14px",
    color: colors.gray500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: "14px",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    transition: "transform 0.15s ease",
  },
  cardEmoji: {
    fontSize: "28px",
  },
  cardName: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "12px",
    color: colors.navy,
  },
  quickSection: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "18px",
    color: colors.navy,
    marginBottom: "4px",
  },
  sectionSubtitle: {
    fontFamily: fonts.body,
    fontSize: "13px",
    color: colors.gray500,
    marginBottom: "14px",
  },
  quickGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  quickCard: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray100}`,
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  quickText: {
    fontFamily: fonts.body,
    fontWeight: "600",
    fontSize: "15px",
    color: colors.navy,
  },
  quickArrow: {
    color: colors.teal,
    fontWeight: "700",
    fontSize: "18px",
  },
};

export default PracticeScreen;
