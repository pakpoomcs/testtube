// src/pages/TestScreen.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { theme } from "../styles/theme";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";

const { colors, fonts } = theme;

function TestScreen() {
  const { user } = useAuth();
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamAndQuestions();
  }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchExamAndQuestions() {
    try {
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();
      if (examError) throw examError;

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId);

      // Shuffle the questions randomly on every attempt
      if (questionsData) {
        questionsData.sort(() => Math.random() - 0.5);
      }
      if (questionsError) throw questionsError;
      if (questionsData.length === 0)
        throw new Error("No questions found for this exam.");

      setExam(examData);
      setQuestions(questionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOptionSelect(option) {
    if (hasSubmitted) return;
    setSelectedOption(option);
  }

  function handleSubmit() {
    if (!selectedOption) return;
    setHasSubmitted(true);
  }

  // saveResults is its own function — NOT inside handleNext
  async function saveResults(completedAnswers) {
    try {
      const rows = completedAnswers.map((answer) => ({
        user_id: user.id,
        question_id: answer.question.id,
        exam_id: exam.id,
        selected_option: answer.selectedOption,
        is_correct: answer.isCorrect,
      }));

      const { error: resultsError } = await supabase
        .from("user_results")
        .insert(rows);
      if (resultsError) throw resultsError;

      const correctCount = completedAnswers.filter((a) => a.isCorrect).length;
      const scorePercent = Math.round(
        (correctCount / completedAnswers.length) * 100
      );

      const { error: sessionError } = await supabase
        .from("test_sessions")
        .insert({
          user_id: user.id,
          exam_id: exam.id,
          score_percent: scorePercent,
          correct_count: correctCount,
          total_count: completedAnswers.length,
        });
      if (sessionError) throw sessionError;
    } catch (err) {
      console.error("Failed to save results:", err.message);
    }
  }

  async function handleNext() {
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correct_option;

    const updatedAnswers = [
      ...answers,
      { question: currentQuestion, selectedOption, isCorrect },
    ];
    setAnswers(updatedAnswers);

    if (currentIndex === questions.length - 1) {
      await saveResults(updatedAnswers);
      navigate("/report", { state: { answers: updatedAnswers, exam } });
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setSelectedOption(null);
    setHasSubmitted(false);
  }

  if (loading)
    return (
      <div style={styles.loadingScreen}>
        <p style={styles.loadingText}>Loading questions...</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.loadingScreen}>
        <p style={{ color: colors.danger }}>{error}</p>
      </div>
    );

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.correct_option;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const options = [
    { key: "a", text: currentQuestion.option_a },
    { key: "b", text: currentQuestion.option_b },
    { key: "c", text: currentQuestion.option_c },
    { key: "d", text: currentQuestion.option_d },
  ];

  function getOptionStyle(key) {
    if (!hasSubmitted) {
      return key === selectedOption ? styles.optionSelected : styles.option;
    }
    if (key === currentQuestion.correct_option) return styles.optionCorrect;
    if (key === selectedOption) return styles.optionWrong;
    return styles.option;
  }

  return (
    <div style={styles.page}>
      <NavBar />

      {/* ── Progress bar ── */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
      </div>

      {/* ── Exam header ── */}
      <div style={styles.testHeader}>
        <span style={styles.examLabel}>{exam.name}</span>
        <span style={styles.progressLabel}>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* ── Question card ── */}
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.metaRow}>
            <span style={styles.metaTag}>{currentQuestion.topic}</span>
            <span style={styles.metaTag}>{currentQuestion.difficulty}</span>
          </div>

          <h2 style={styles.questionText}>{currentQuestion.question_text}</h2>

          <div style={styles.optionsGrid}>
            {options.map((opt) => (
              <button
                key={opt.key}
                style={getOptionStyle(opt.key)}
                onClick={() => handleOptionSelect(opt.key)}
              >
                <span style={styles.optionBadge}>{opt.key.toUpperCase()}</span>
                <span style={styles.optionText}>{opt.text}</span>
              </button>
            ))}
          </div>

          {hasSubmitted && (
            <div
              style={
                isCorrect ? styles.explanationCorrect : styles.explanationWrong
              }
            >
              <p style={styles.resultLabel}>
                {isCorrect
                  ? "✅ Correct!"
                  : `❌ Correct answer: ${currentQuestion.correct_option.toUpperCase()}`}
              </p>
              <p style={styles.explanationText}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {!hasSubmitted ? (
            <button
              style={{
                ...styles.actionButton,
                opacity: selectedOption ? 1 : 0.35,
              }}
              onClick={handleSubmit}
              disabled={!selectedOption}
            >
              Submit Answer
            </button>
          ) : (
            <button style={styles.actionButton} onClick={handleNext}>
              {currentIndex === questions.length - 1
                ? "See My Results →"
                : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.offWhite,
  },
  loadingScreen: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  loadingText: {
    color: colors.gray300,
    fontFamily: fonts.body,
    fontSize: "16px",
  },
  progressTrack: {
    height: "4px",
    backgroundColor: colors.gray100,
  },
  progressFill: {
    height: "4px",
    backgroundColor: colors.teal,
    transition: "width 0.4s ease",
  },
  testHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.gray100}`,
  },
  examLabel: {
    fontFamily: fonts.heading,
    fontSize: "20px",
    color: colors.navy,
    letterSpacing: "1px",
  },
  progressLabel: {
    fontFamily: fonts.body,
    fontSize: "13px",
    color: colors.gray500,
  },
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "0 24px 60px",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: "20px",
    padding: "36px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  metaRow: {
    display: "flex",
    gap: "8px",
  },
  metaTag: {
    backgroundColor: colors.gray100,
    color: colors.gray700,
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "100px",
    fontFamily: fonts.body,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  questionText: {
    fontFamily: fonts.body,
    fontSize: "20px",
    fontWeight: "600",
    color: colors.navy,
    lineHeight: "1.55",
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    borderRadius: "12px",
    border: `2px solid ${colors.gray100}`,
    backgroundColor: colors.offWhite,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    fontFamily: fonts.body,
  },
  optionSelected: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    borderRadius: "12px",
    border: `2px solid ${colors.teal}`,
    backgroundColor: colors.tealLight,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: fonts.body,
  },
  optionCorrect: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    borderRadius: "12px",
    border: `2px solid ${colors.success}`,
    backgroundColor: colors.successLight,
    cursor: "default",
    textAlign: "left",
    fontFamily: fonts.body,
  },
  optionWrong: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    borderRadius: "12px",
    border: `2px solid ${colors.danger}`,
    backgroundColor: colors.dangerLight,
    cursor: "default",
    textAlign: "left",
    fontFamily: fonts.body,
  },
  optionBadge: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "8px",
    backgroundColor: colors.navy,
    color: colors.white,
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionText: {
    fontSize: "15px",
    color: colors.navy,
    lineHeight: "1.4",
  },
  explanationCorrect: {
    borderRadius: "12px",
    padding: "18px",
    backgroundColor: colors.successLight,
    borderLeft: `4px solid ${colors.success}`,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  explanationWrong: {
    borderRadius: "12px",
    padding: "18px",
    backgroundColor: colors.dangerLight,
    borderLeft: `4px solid ${colors.danger}`,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  resultLabel: {
    fontWeight: "700",
    fontSize: "15px",
    color: colors.navy,
    fontFamily: fonts.body,
  },
  explanationText: {
    fontSize: "14px",
    color: colors.gray700,
    lineHeight: "1.65",
    fontFamily: fonts.body,
  },
  actionButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: colors.navy,
    color: colors.white,
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: fonts.body,
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
};

export default TestScreen;
