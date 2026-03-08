// src/pages/AdminPage.js
// Admin-only page to manage exams and questions.
// Only accessible to users with is_admin = true in their profile.

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { theme } from '../styles/theme'
import NavBar from '../components/NavBar'

const { colors, fonts } = theme

function AdminPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('questions') // 'questions' | 'addQuestion' | 'addExam'

  // New question form state
  const [form, setForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a',
    explanation: '',
    topic: '',
    difficulty: 'Medium',
    is_premium: false,
  })

  // New exam form state
  const [examForm, setExamForm] = useState({
    name: '',
    name_th: '',
    description: '',
    description_th: '',
    category: 'English',
    difficulty: 'Intermediate',
    is_premium: false,
  })

useEffect(() => {
  if (!isAdmin) {
    navigate('/')
    return
  }
  fetchExams()
}, [isAdmin, navigate])

useEffect(() => {
    if (selectedExam) fetchQuestions(selectedExam.id)
  }, [selectedExam])

  async function fetchExams() {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('name')
      if (error) throw error
      setExams(data)
      if (data.length > 0) setSelectedExam(data[0])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchQuestions(examId) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('created_at')
      if (error) throw error
      setQuestions(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAddQuestion() {
    if (!selectedExam) return
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d || !form.explanation || !form.topic) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          exam_id: selectedExam.id,
          ...form,
        })
      if (error) throw error

      setMessage({ type: 'success', text: 'Question added successfully!' })
      setForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'a',
        explanation: '',
        topic: '',
        difficulty: 'Medium',
        is_premium: false,
      })
      fetchQuestions(selectedExam.id)
      setActiveTab('questions')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteQuestion(questionId) {
    if (!window.confirm('Delete this question? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)
      if (error) throw error
      fetchQuestions(selectedExam.id)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleAddExam() {
    if (!examForm.name || !examForm.description || !examForm.category) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('exams')
        .insert(examForm)
      if (error) throw error

      setMessage({ type: 'success', text: `${examForm.name} exam added!` })
      setExamForm({
        name: '',
        name_th: '',
        description: '',
        description_th: '',
        category: 'English',
        difficulty: 'Intermediate',
        is_premium: false,
      })
      fetchExams()
      setActiveTab('questions')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateExamForm(field, value) {
    setExamForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) return (
    <div style={styles.loadingScreen}>
      <p style={styles.loadingText}>Loading admin panel...</p>
    </div>
  )

  return (
    <div style={styles.page}>
      <NavBar />

      <div style={styles.content}>

        {/* ── Page title ── */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Admin Panel</h1>
          <p style={styles.pageSub}>Manage exams and questions</p>
        </div>

        {/* ── Message ── */}
        {message && (
          <div style={message.type === 'success' ? styles.successBox : styles.errorBox}>
            {message.text}
          </div>
        )}

        <div style={styles.layout}>

          {/* ── Left sidebar: exam selector ── */}
          <div style={styles.sidebar}>
            <p style={styles.sidebarTitle}>Exams</p>
            {exams.map(exam => (
              <button
                key={exam.id}
                style={selectedExam?.id === exam.id ? styles.examButtonActive : styles.examButton}
                onClick={() => {
                  setSelectedExam(exam)
                  setActiveTab('questions')
                  setMessage(null)
                }}
              >
                <span>{exam.name}</span>
                <span style={styles.examButtonSub}>{exam.category}</span>
              </button>
            ))}
            <button
              style={styles.addExamButton}
              onClick={() => {
                setActiveTab('addExam')
                setMessage(null)
              }}
            >
              + Add New Exam
            </button>
          </div>

          {/* ── Main content ── */}
          <div style={styles.main}>

            {/* Tab bar */}
            {activeTab !== 'addExam' && (
              <div style={styles.tabBar}>
                <button
                  style={activeTab === 'questions' ? styles.tabActive : styles.tab}
                  onClick={() => setActiveTab('questions')}
                >
                  Questions ({questions.length})
                </button>
                <button
                  style={activeTab === 'addQuestion' ? styles.tabActive : styles.tab}
                  onClick={() => setActiveTab('addQuestion')}
                >
                  + Add Question
                </button>
              </div>
            )}

            {/* ── Questions list ── */}
            {activeTab === 'questions' && (
              <div style={styles.questionList}>
                {questions.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p style={styles.emptyText}>No questions yet for {selectedExam?.name}.</p>
                    <button style={styles.primaryButton} onClick={() => setActiveTab('addQuestion')}>
                      Add First Question
                    </button>
                  </div>
                ) : (
                  questions.map((q, i) => (
                    <div key={q.id} style={styles.questionCard}>
                      <div style={styles.questionCardHeader}>
                        <span style={styles.questionNumber}>Q{i + 1}</span>
                        <div style={styles.questionTags}>
                          <span style={styles.tag}>{q.topic}</span>
                          <span style={styles.tag}>{q.difficulty}</span>
                          {q.is_premium && <span style={styles.tagPremium}>Premium</span>}
                        </div>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDeleteQuestion(q.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <p style={styles.questionText}>{q.question_text}</p>
                      <div style={styles.optionGrid}>
                        {['a', 'b', 'c', 'd'].map(key => (
                          <p key={key} style={{
                            ...styles.optionText,
                            color: key === q.correct_option ? colors.success : colors.gray700,
                            fontWeight: key === q.correct_option ? '700' : '400',
                          }}>
                            {key.toUpperCase()}. {q[`option_${key}`]}
                            {key === q.correct_option && ' ✓'}
                          </p>
                        ))}
                      </div>
                      <p style={styles.explanation}>💡 {q.explanation}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Add question form ── */}
            {activeTab === 'addQuestion' && (
              <div style={styles.formCard}>
                <h2 style={styles.formTitle}>Add Question to {selectedExam?.name}</h2>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Question *</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Enter the question text..."
                    value={form.question_text}
                    onChange={e => updateForm('question_text', e.target.value)}
                    rows={3}
                  />
                </div>

                {['a', 'b', 'c', 'd'].map(key => (
                  <div key={key} style={styles.fieldGroup}>
                    <label style={styles.label}>Option {key.toUpperCase()} *</label>
                    <input
                      style={styles.input}
                      placeholder={`Option ${key.toUpperCase()}`}
                      value={form[`option_${key}`]}
                      onChange={e => updateForm(`option_${key}`, e.target.value)}
                    />
                  </div>
                ))}

                <div style={styles.rowGroup}>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Correct Answer *</label>
                    <select
                      style={styles.select}
                      value={form.correct_option}
                      onChange={e => updateForm('correct_option', e.target.value)}
                    >
                      {['a', 'b', 'c', 'd'].map(k => (
                        <option key={k} value={k}>{k.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Difficulty *</label>
                    <select
                      style={styles.select}
                      value={form.difficulty}
                      onChange={e => updateForm('difficulty', e.target.value)}
                    >
                      {['Easy', 'Medium', 'Hard'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Topic *</label>
                    <input
                      style={styles.input}
                      placeholder="e.g. Grammar"
                      value={form.topic}
                      onChange={e => updateForm('topic', e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Explanation *</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Explain why the correct answer is right..."
                    value={form.explanation}
                    onChange={e => updateForm('explanation', e.target.value)}
                    rows={3}
                  />
                </div>

                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={form.is_premium}
                    onChange={e => updateForm('is_premium', e.target.checked)}
                  />
                  <label htmlFor="is_premium" style={styles.checkboxLabel}>
                    Premium question (requires subscription)
                  </label>
                </div>

                <div style={styles.formButtons}>
                  <button
                    style={styles.secondaryButton}
                    onClick={() => setActiveTab('questions')}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ ...styles.primaryButton, opacity: saving ? 0.6 : 1 }}
                    onClick={handleAddQuestion}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Question'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Add exam form ── */}
            {activeTab === 'addExam' && (
              <div style={styles.formCard}>
                <h2 style={styles.formTitle}>Add New Exam</h2>

                <div style={styles.rowGroup}>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Exam Name * (e.g. IELTS)</label>
                    <input
                      style={styles.input}
                      placeholder="e.g. IELTS"
                      value={examForm.name}
                      onChange={e => updateExamForm('name', e.target.value)}
                    />
                  </div>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Thai Name</label>
                    <input
                      style={styles.input}
                      placeholder="e.g. ไอเอลทีเอส"
                      value={examForm.name_th}
                      onChange={e => updateExamForm('name_th', e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description * (English)</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Brief description of the exam..."
                    value={examForm.description}
                    onChange={e => updateExamForm('description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description (Thai)</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="คำอธิบายภาษาไทย..."
                    value={examForm.description_th}
                    onChange={e => updateExamForm('description_th', e.target.value)}
                    rows={2}
                  />
                </div>

                <div style={styles.rowGroup}>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Category *</label>
                    <select
                      style={styles.select}
                      value={examForm.category}
                      onChange={e => updateExamForm('category', e.target.value)}
                    >
                      {['English', 'Thai National', 'Math', 'Science', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Difficulty *</label>
                    <select
                      style={styles.select}
                      value={examForm.difficulty}
                      onChange={e => updateExamForm('difficulty', e.target.value)}
                    >
                      {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="exam_is_premium"
                    checked={examForm.is_premium}
                    onChange={e => updateExamForm('is_premium', e.target.checked)}
                  />
                  <label htmlFor="exam_is_premium" style={styles.checkboxLabel}>
                    Premium exam (requires subscription)
                  </label>
                </div>

                <div style={styles.formButtons}>
                  <button
                    style={styles.secondaryButton}
                    onClick={() => setActiveTab('questions')}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ ...styles.primaryButton, opacity: saving ? 0.6 : 1 }}
                    onClick={handleAddExam}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Exam'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: colors.offWhite,
  },
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
  },
  loadingText: {
    color: colors.gray300,
    fontFamily: fonts.body,
    fontSize: '16px',
  },
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 32px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pageTitle: {
    fontFamily: fonts.heading,
    fontSize: '40px',
    color: colors.navy,
    letterSpacing: '1px',
  },
  pageSub: {
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.gray500,
  },
  successBox: {
    backgroundColor: colors.successLight,
    color: colors.success,
    border: `1px solid ${colors.success}`,
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    fontFamily: fonts.body,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    fontFamily: fonts.body,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  sidebar: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sidebarTitle: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '12px',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    padding: '4px 8px',
    marginBottom: '4px',
  },
  examButton: {
    background: 'none',
    border: 'none',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.navy,
    fontWeight: '500',
  },
  examButtonActive: {
    background: colors.tealLight,
    border: 'none',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.tealDark,
    fontWeight: '700',
  },
  examButtonSub: {
    fontSize: '11px',
    color: colors.gray500,
    fontWeight: '400',
  },
  addExamButton: {
    marginTop: '8px',
    background: 'none',
    border: `1px dashed ${colors.gray300}`,
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: fonts.body,
    fontSize: '13px',
    color: colors.gray500,
    fontWeight: '500',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    padding: '8px 20px',
    borderRadius: '100px',
    border: `1px solid ${colors.gray300}`,
    backgroundColor: 'transparent',
    color: colors.gray700,
    fontFamily: fonts.body,
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tabActive: {
    padding: '8px 20px',
    borderRadius: '100px',
    border: 'none',
    backgroundColor: colors.navy,
    color: colors.white,
    fontFamily: fonts.body,
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  questionCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  questionNumber: {
    fontFamily: fonts.heading,
    fontSize: '18px',
    color: colors.teal,
    minWidth: '32px',
  },
  questionTags: {
    display: 'flex',
    gap: '6px',
    flexGrow: 1,
  },
  tag: {
    backgroundColor: colors.gray100,
    color: colors.gray700,
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '100px',
    fontFamily: fonts.body,
  },
  tagPremium: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '100px',
    fontFamily: fonts.body,
  },
  deleteButton: {
    background: 'none',
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: fonts.body,
    cursor: 'pointer',
  },
  questionText: {
    fontFamily: fonts.body,
    fontSize: '15px',
    fontWeight: '600',
    color: colors.navy,
    lineHeight: '1.5',
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 16px',
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: '13px',
    lineHeight: '1.5',
  },
  explanation: {
    fontFamily: fonts.body,
    fontSize: '13px',
    color: colors.gray500,
    lineHeight: '1.5',
    borderTop: `1px solid ${colors.gray100}`,
    paddingTop: '10px',
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '60px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: '15px',
    color: colors.gray500,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formTitle: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '18px',
    color: colors.navy,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rowGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: '13px',
    fontWeight: '600',
    color: colors.gray700,
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: `2px solid ${colors.gray100}`,
    fontSize: '14px',
    fontFamily: fonts.body,
    color: colors.navy,
    outline: 'none',
    width: '100%',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: `2px solid ${colors.gray100}`,
    fontSize: '14px',
    fontFamily: fonts.body,
    color: colors.navy,
    outline: 'none',
    width: '100%',
    resize: 'vertical',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: `2px solid ${colors.gray100}`,
    fontSize: '14px',
    fontFamily: fonts.body,
    color: colors.navy,
    outline: 'none',
    width: '100%',
    backgroundColor: colors.white,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkboxLabel: {
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.gray700,
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  primaryButton: {
    padding: '11px 24px',
    backgroundColor: colors.navy,
    color: colors.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: fonts.body,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '11px 24px',
    backgroundColor: colors.white,
    color: colors.navy,
    border: `2px solid ${colors.gray300}`,
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: fonts.body,
    cursor: 'pointer',
  },
}

export default AdminPage