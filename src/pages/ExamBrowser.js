// src/pages/ExamBrowser.js
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { theme } from '../styles/theme'
// import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'


const { colors, fonts } = theme

function ExamBrowser() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()
  // const { } = useAuth()

  useEffect(() => { fetchExams() }, [])

async function fetchExams() {
  try {
    // Fetch exams and count their questions in one query
    const { data, error } = await supabase
      .from('exams')
      .select('*, questions(count)')
      .order('name')

    if (error) throw error
    setExams(data)
  } catch (err) {
    setError('Failed to load exams. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const categories = ['All', ...new Set(exams.map(e => e.category))]
  const filtered = filter === 'All' ? exams : exams.filter(e => e.category === filter)

  const difficultyColor = {
    'Beginner': colors.success,
    'Intermediate': colors.warning,
    'Advanced': colors.danger,
  }

  if (loading) return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingDot} />
      <p style={styles.loadingText}>Loading exams...</p>
    </div>
  )

  if (error) return (
    <div style={styles.loadingScreen}>
      <p style={{ color: colors.danger }}>{error}</p>
    </div>
  )

  return (
    <div style={styles.page}>


<NavBar />
<div style={styles.hero}>
  <div style={styles.heroInner}>
    <h1 style={styles.heroTitle}>MASTER EVERY EXAM</h1>
    <p style={styles.heroSub}>
      Practice tests for IELTS, TOEIC, ONET, TCAS and more —
      with instant feedback and personalised reports.
    </p>
  </div>
  <div style={styles.circle1} />
  <div style={styles.circle2} />
</div>

      {/* ── Filter tabs ── */}
      <div style={styles.filterBar}>
        {categories.map(cat => (
          <button
            key={cat}
            style={filter === cat ? styles.filterActive : styles.filterInactive}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Exam grid ── */}
      <div style={styles.grid}>
        {filtered.map(exam => (
          <div
            key={exam.id}
            style={styles.card}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,194,168,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'
            }}
          >
            {/* Top accent bar */}
            <div style={{
              ...styles.cardAccent,
              backgroundColor: exam.is_premium ? colors.warning : colors.teal
            }} />

            <div style={styles.cardBody}>
              {/* Header row */}
              <div style={styles.cardHeader}>
                <h2 style={styles.examName}>{exam.name}</h2>
                {exam.is_premium && (
                  <span style={styles.premiumBadge}>✦ Premium</span>
                )}
              </div>

              {/* Thai name */}
              {exam.name_th && (
                <p style={styles.examNameTh}>{exam.name_th}</p>
              )}

              <p style={styles.description}>{exam.description}</p>

              {/* Tags */}
              <div style={styles.tagRow}>
                {/* Question count */}
{(() => {
  const count = exam.questions?.[0]?.count ?? 0
  return (
    <p style={styles.questionCount}>
      {count > 0 ? `${count} question${count !== 1 ? 's' : ''}` : 'No questions yet'}
    </p>
  )
})()}
                <span style={styles.categoryTag}>{exam.category}</span>
                <span style={{
                  ...styles.difficultyTag,
                  color: difficultyColor[exam.difficulty] || colors.gray500,
                  border: `1px solid ${difficultyColor[exam.difficulty] || colors.gray300}`,
                }}>
                  {exam.difficulty}
                </span>
              </div>

{/* Button — disabled if no questions */}
{(() => {
  const questionCount = exam.questions?.[0]?.count ?? 0
  const hasQuestions = questionCount > 0
  const isPremium = exam.is_premium

  if (!hasQuestions) {
    return (
      <button style={styles.buttonDisabled} disabled>
        Coming Soon
      </button>
    )
  }

  return (
    <button
      style={isPremium ? styles.buttonPremium : styles.buttonStart}
      onClick={() => navigate(`/test/${exam.id}`)}
    >
      {isPremium ? 'Unlock & Start →' : `Start Test →`}
    </button>
  )
})()}            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={styles.footer}>
        <p style={styles.footerText}>TestTube 🧪 — Built for Thai students, accepted worldwide.</p>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: colors.navy,
  },
  loadingDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: colors.teal,
  },
  loadingText: {
    color: colors.gray300,
    fontFamily: fonts.body,
    fontSize: '16px',
  },
  hero: {
    backgroundColor: colors.navy,
    padding: '60px 32px 56px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroInner: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontFamily: fonts.heading,
    fontSize: '28px',
    color: colors.teal,
    letterSpacing: '2px',
  },
  signOutButton: {
    marginLeft: 'auto',
    background: 'none',
    border: `1px solid rgba(255,255,255,0.25)`,
    color: colors.gray300,
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: fonts.body,
    cursor: 'pointer',
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 'clamp(48px, 8vw, 80px)',
    color: colors.white,
    letterSpacing: '3px',
    lineHeight: '1',
    marginBottom: '20px',
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: '16px',
    color: colors.gray300,
    lineHeight: '1.7',
    maxWidth: '520px',
  },
  circle1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    border: `1px solid rgba(0,194,168,0.12)`,
    top: '-120px',
    right: '-80px',
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    border: `1px solid rgba(0,194,168,0.08)`,
    top: '40px',
    right: '60px',
    zIndex: 1,
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    padding: '24px 32px 0',
    maxWidth: '1100px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  filterActive: {
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
  filterInactive: {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1100px',
    margin: '24px auto 0',
    padding: '0 32px',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  cardAccent: {
    height: '4px',
    width: '100%',
  },
  cardBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flexGrow: 1,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  examName: {
    fontFamily: fonts.heading,
    fontSize: '28px',
    color: colors.navy,
    letterSpacing: '1px',
  },
  premiumBadge: {
    backgroundColor: colors.warning,
    color: colors.white,
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '100px',
    whiteSpace: 'nowrap',
  },
  examNameTh: {
    fontSize: '13px',
    color: colors.gray500,
    fontFamily: fonts.body,
    marginTop: '-4px',
  },
  description: {
    fontSize: '13px',
    color: colors.gray500,
    lineHeight: '1.6',
    flexGrow: 1,
  },
  tagRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: colors.tealLight,
    color: colors.tealDark,
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '100px',
  },
  difficultyTag: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '100px',
    backgroundColor: 'transparent',
  },
  buttonStart: {
    marginTop: '8px',
    padding: '13px 20px',
    backgroundColor: colors.navy,
    color: colors.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: fonts.body,
    width: '100%',
    cursor: 'pointer',
  },
  buttonPremium: {
    marginTop: '8px',
    padding: '13px 20px',
    backgroundColor: colors.warning,
    color: colors.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: fonts.body,
    width: '100%',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    padding: '48px 24px',
    marginTop: '40px',
  },
  footerText: {
    color: colors.gray500,
    fontSize: '14px',
  },
  buttonDisabled: {
  marginTop: '8px',
  padding: '13px 20px',
  backgroundColor: colors.gray100,
  color: colors.gray500,
  border: 'none',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: '600',
  fontFamily: fonts.body,
  width: '100%',
  cursor: 'not-allowed',
},
questionCount: {
  fontSize: '12px',
  color: colors.gray500,
  fontFamily: fonts.body,
},
navButton: {
  background: 'none',
  border: `1px solid rgba(255,255,255,0.25)`,
  color: colors.gray300,
  padding: '6px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: fonts.body,
  cursor: 'pointer',
},
}

export default ExamBrowser