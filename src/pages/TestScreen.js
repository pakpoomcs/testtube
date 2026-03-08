// src/pages/TestScreen.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { theme } from "../styles/theme";

const { colors, fonts } = theme;

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
      setExam(examData);

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId);

      if (questionsError) throw questionsError;

      // Shuffle
      questionsData.sort(() => Math.random() - 0.5);
      setQuestions(questionsData);
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
    const userAnswer = answers[currentIndex];
    const isCorrect = checkCorrect(currentQuestion, userAnswer);
    try {
      await supabase.from("user_results").insert({
        user_id: user.id,
        question_id: currentQuestion.id,
        exam_id: examId,
        selected_option: String(userAnswer),
        is_correct: isCorrect,
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

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (questions.length === 0)
    return <EmptyScreen exam={exam} navigate={navigate} />;

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect =
    submitted && checkCorrect(currentQuestion, answers[currentIndex]);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ✕
        </button>
        <div style={styles.headerCenter}>
          <span style={styles.examName}>{exam?.name}</span>
          <span style={styles.questionCount}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div style={styles.headerRight} />
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Question type badge */}
      <div style={styles.typeBadgeRow}>
        <span style={styles.typeBadge}>
          {getTypeLabel(currentQuestion?.question_type)}
        </span>
        {currentQuestion?.topic && (
          <span style={styles.topicBadge}>{currentQuestion.topic}</span>
        )}
      </div>

      {/* Question content */}
      <div style={styles.content}>
        {/* Reading passage */}
        {currentQuestion?.passage_text && (
          <div style={styles.passage}>
            {currentQuestion.passage_title && (
              <div style={styles.passageTitle}>
                {currentQuestion.passage_title}
              </div>
            )}
            <p style={styles.passageText}>{currentQuestion.passage_text}</p>
          </div>
        )}

        {/* Question text */}
        <div style={styles.questionBox}>
          <p style={styles.questionText}>
            {formatQuestionText(currentQuestion?.question_text)}
          </p>
        </div>

        {/* Answer input — switches based on type */}
        {currentQuestion?.question_type === "fill_blank" ? (
          <FillBlankInput
            value={answers[currentIndex] || ""}
            onChange={handleAnswer}
            submitted={submitted}
            isCorrect={isCorrect}
            disabled={submitted}
          />
        ) : currentQuestion?.question_type === "tfng" ? (
          <TFNGInput
            value={answers[currentIndex]}
            onChange={handleAnswer}
            submitted={submitted}
            isCorrect={isCorrect}
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
            style={isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}
          >
            <div style={styles.feedbackHeader}>
              {isCorrect
                ? "✅ Correct!"
                : `❌ Incorrect — ${getCorrectLabel(currentQuestion)}`}
            </div>
            {currentQuestion.explanation && (
              <p style={styles.explanation}>{currentQuestion.explanation}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div style={styles.footer}>
        {!submitted ? (
          <button
            style={{ ...styles.primaryBtn, opacity: hasAnswer ? 1 : 0.35 }}
            onClick={handleSubmit}
            disabled={!hasAnswer}
          >
            Submit Answer
          </button>
        ) : (
          <button
            style={{ ...styles.primaryBtn, opacity: saving ? 0.6 : 1 }}
            onClick={handleNext}
            disabled={saving}
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

// ── Sub-components ──────────────────────────────────────────

function MCQInput({
  question,
  value,
  onChange,
  submitted,
  isCorrect,
  disabled,
}) {
  const options = ["a", "b", "c", "d"];
  return (
    <div style={styles.optionList}>
      {options.map((opt) => {
        const text = question[`option_${opt}`];
        if (!text) return null;
        const selected = value === opt;
        const isCorrectOpt = submitted && opt === question.correct_option;
        const isWrongOpt = submitted && selected && !isCorrect;

        let bgColor = colors.white;
        let borderColor = colors.border;
        let textColor = colors.textPrimary;

        if (isCorrectOpt) {
          bgColor = colors.successLight;
          borderColor = colors.success;
          textColor = colors.success;
        } else if (isWrongOpt) {
          bgColor = colors.dangerLight;
          borderColor = colors.danger;
          textColor = colors.danger;
        } else if (selected && !submitted) {
          bgColor = colors.tealLight;
          borderColor = colors.teal;
          textColor = colors.teal;
        }

        return (
          <button
            key={opt}
            style={{
              ...styles.option,
              backgroundColor: bgColor,
              borderColor,
              color: textColor,
            }}
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
          >
            <span
              style={{ ...styles.optionLetter, borderColor, color: textColor }}
            >
              {opt.toUpperCase()}
            </span>
            <span style={styles.optionText}>{text}</span>
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
    <div style={styles.tfngRow}>
      {options.map((opt) => {
        const selected = value === opt.value;
        const isCorrectOpt = submitted && opt.value === correct;
        const isWrongOpt = submitted && selected && opt.value !== correct;

        let bgColor = colors.white;
        let borderColor = colors.border;
        let textColor = colors.textPrimary;

        if (isCorrectOpt) {
          bgColor = colors.successLight;
          borderColor = colors.success;
          textColor = colors.success;
        } else if (isWrongOpt) {
          bgColor = colors.dangerLight;
          borderColor = colors.danger;
          textColor = colors.danger;
        } else if (selected && !submitted) {
          bgColor = colors.tealLight;
          borderColor = colors.teal;
          textColor = colors.teal;
        }

        return (
          <button
            key={opt.value}
            style={{
              ...styles.tfngBtn,
              backgroundColor: bgColor,
              borderColor,
              color: textColor,
            }}
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
          >
            <span style={styles.tfngEmoji}>{opt.emoji}</span>
            <span style={styles.tfngLabel}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FillBlankInput({ value, onChange, submitted, isCorrect, disabled }) {
  return (
    <div style={styles.fillBlankWrapper}>
      <input
        style={{
          ...styles.fillBlankInput,
          borderColor: submitted
            ? isCorrect
              ? colors.success
              : colors.danger
            : colors.border,
          backgroundColor: submitted
            ? isCorrect
              ? colors.successLight
              : colors.dangerLight
            : colors.white,
        }}
        placeholder="Type your answer here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function formatQuestionText(text) {
  if (!text) return "";
  // Highlight [BLANK] in fill-in-the-blank questions
  if (text.includes("[BLANK]")) {
    return text.split("[BLANK]").map((part, i, arr) => (
      <React.Fragment key={i}>
        {part}
        {i < arr.length - 1 && (
          <span style={styles.blankPlaceholder}>________</span>
        )}
      </React.Fragment>
    ));
  }
  return text;
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

// ── Utility screens ──────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={styles.centeredScreen}>
      <p style={styles.loadingText}>Loading questions...</p>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div style={styles.centeredScreen}>
      <p style={{ color: theme.colors.danger, fontFamily: theme.fonts.body }}>
        Error: {error}
      </p>
    </div>
  );
}

function EmptyScreen({ exam, navigate }) {
  return (
    <div style={styles.centeredScreen}>
      <p style={styles.loadingText}>No questions yet for {exam?.name}.</p>
      <button style={styles.primaryBtn} onClick={() => navigate("/")}>
        Go Back
      </button>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.white,
    display: "flex",
    flexDirection: "column",
    maxWidth: "720px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: `1px solid ${colors.border}`,
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: colors.textSecondary,
    padding: "4px 8px",
    borderRadius: "6px",
  },
  headerCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  examName: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "15px",
    color: colors.textPrimary,
  },
  questionCount: {
    fontFamily: fonts.body,
    fontSize: "12px",
    color: colors.textSecondary,
  },
  headerRight: { width: "40px" },
  progressTrack: {
    height: "3px",
    backgroundColor: colors.border,
  },
  progressFill: {
    height: "3px",
    backgroundColor: colors.teal,
    transition: "width 0.4s ease",
  },
  typeBadgeRow: {
    display: "flex",
    gap: "8px",
    padding: "16px 20px 0",
    flexWrap: "wrap",
  },
  typeBadge: {
    fontFamily: fonts.body,
    fontSize: "11px",
    fontWeight: "600",
    color: colors.teal,
    backgroundColor: colors.tealLight,
    padding: "4px 10px",
    borderRadius: "100px",
    letterSpacing: "0.3px",
  },
  topicBadge: {
    fontFamily: fonts.body,
    fontSize: "11px",
    fontWeight: "500",
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    padding: "4px 10px",
    borderRadius: "100px",
    border: `1px solid ${colors.border}`,
  },
  content: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowY: "auto",
  },
  passage: {
    backgroundColor: colors.surface,
    borderRadius: "12px",
    padding: "20px",
    border: `1px solid ${colors.border}`,
    maxHeight: "280px",
    overflowY: "auto",
  },
  passageTitle: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "14px",
    color: colors.textPrimary,
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  passageText: {
    fontFamily: fonts.body,
    fontSize: "14px",
    color: colors.textPrimary,
    lineHeight: "1.8",
  },
  questionBox: {
    padding: "4px 0",
  },
  questionText: {
    fontFamily: fonts.body,
    fontWeight: "500",
    fontSize: "17px",
    color: colors.textPrimary,
    lineHeight: "1.6",
  },
  blankPlaceholder: {
    color: colors.teal,
    fontWeight: "700",
    borderBottom: `2px solid ${colors.teal}`,
    padding: "0 4px",
  },
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1.5px solid",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  optionLetter: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "12px",
    flexShrink: 0,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  tfngRow: {
    display: "flex",
    gap: "10px",
  },
  tfngBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "16px 12px",
    borderRadius: "12px",
    border: "1.5px solid",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  tfngEmoji: {
    fontSize: "22px",
    fontWeight: "700",
  },
  tfngLabel: {
    fontFamily: fonts.body,
    fontWeight: "600",
    fontSize: "13px",
  },
  fillBlankWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fillBlankInput: {
    padding: "16px 18px",
    borderRadius: "12px",
    border: "1.5px solid",
    fontSize: "16px",
    fontFamily: fonts.body,
    color: colors.textPrimary,
    outline: "none",
    transition: "border-color 0.15s ease",
    width: "100%",
  },
  feedbackCorrect: {
    backgroundColor: colors.successLight,
    border: `1px solid ${colors.success}`,
    borderRadius: "12px",
    padding: "16px",
  },
  feedbackWrong: {
    backgroundColor: colors.dangerLight,
    border: `1px solid ${colors.danger}`,
    borderRadius: "12px",
    padding: "16px",
  },
  feedbackHeader: {
    fontFamily: fonts.body,
    fontWeight: "700",
    fontSize: "14px",
    color: colors.textPrimary,
    marginBottom: "6px",
  },
  explanation: {
    fontFamily: fonts.body,
    fontSize: "13px",
    color: colors.textSecondary,
    lineHeight: "1.6",
  },
  footer: {
    padding: "16px 20px",
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.white,
  },
  primaryBtn: {
    width: "100%",
    padding: "15px",
    backgroundColor: colors.teal,
    color: colors.white,
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: fonts.body,
    cursor: "pointer",
    transition: "opacity 0.15s ease",
  },
  centeredScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "24px",
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: "15px",
    color: colors.textSecondary,
  },
};

export default TestScreen;
