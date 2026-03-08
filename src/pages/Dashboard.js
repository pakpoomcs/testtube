// src/pages/Dashboard.js
// Shows the user's personal test history, score trends, and topic performance.

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { theme } from '../styles/theme'

const { colors, fonts } = theme

function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [topicStats, setTopicStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Fetch test sessions with exam name
      const { data: sessionData, error: sessionError } = await supabase
        .from('test_sessions')
        .select('*, exams(name)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (sessionError) throw sessionError

      // Fetch topic-level performance from user_results
      const { data: resultsData, error: resultsError } = await supabase
        .from('user_results')
        .select('is_correct, questions(topic)')
        .eq('user_id', user.id)

      if (resultsError) throw resultsError

      // Aggregate topic stats
      const topicMap = resultsData.reduce((acc, row) => {
        const topic = row.questions?.topic || 'General'
        if (!acc[topic]) acc[topic] = { correct: 0, total: 0 }
        acc[topic].total++
        if (row.is_correct) acc[topic].correct++
        return acc
      }, {})

      const topicArray = Object.entries(topicMap)
        .map(([topic, stats]) => ({
          topic,
          correct: stats.correct,
          total: stats.total,
          percent: Math.round((stats.correct / stats.total) * 100)
        }))
        .sort((a, b) => b.total - a.total)

      setSessions(sessionData)
      setTopicStats(topicArray)
    } catch (err) {
      console.error('Dashboard error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Overall stats across all sessions
  const totalTests = sessions.length
  const avgScore = totalTests > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.score_percent, 0) / totalTests)
    : 0
  const bestScore = totalTests > 0
    ? Math.max(...sessions.map(s => s.score_percent))
    : 0
  const totalQuestions = sessions.reduce((sum, s) => sum + s.total_count, 0)

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function getScoreColor(pct) {
    if (pct >= 75) return colors.success
    if (pct >= 50) return colors.warning
    return colors.danger
  }

  if (loading) return (
    <div style={styles.loadingScreen}>
      <p style={styles.loadingText}>Loading your dashboard...</p>
    </div>
  )

  return (
    <div style={styles.page}>

      {/* ── Top bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <span style={styles.logo}>🧪 TestTube</span>
        </div>
        <div style={styles.topBarRight}>
          <button style={styles.navButton} onClick={() => navigate('/')}>
            Browse Exams
          </button>
          <button style={styles.signOutButton} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div style={styles.content}>

        {/* ── Welcome ── */}
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.welcomeTitle}>Your Dashboard</h1>
            <p style={styles.welcomeSub}>{user.email}</p>
          </div>
          <button style={styles.startButton} onClick={() => navigate('/')}>
            Take a Test →
          </button>
        </div>

        {/* ── Stats row ── */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Tests Taken', value: totalTests, unit: '' },
            { label: 'Average Score', value: avgScore, unit: '%' },
            { label: 'Best Score', value: bestScore, unit: '%' },
            { label: 'Questions Answered', value: totalQuestions, unit: '' },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <p style={styles.statValue}>{stat.value}{stat.unit}</p>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>

        {totalTests === 0 ? (
          // Empty state
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📝</p>
            <h2 style={styles.emptyTitle}>No tests taken yet</h2>
            <p style={styles.emptyText}>Complete your first test to see your performance here.</p>
            <button style={styles.startButton} onClick={() => navigate('/')}>
              Browse Exams →
            </button>
          </div>
        ) : (
          <>
            {/* ── Topic performance ── */}
            {topicStats.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Performance by Topic</h2>
                <div style={styles.topicList}>
                  {topicStats.map(t => (
                    <div key={t.topic} style={styles.topicRow}>
                      <div style={styles.topicMeta}>
                        <span style={styles.topicName}>{t.topic}</span>
                        <span style={{ ...styles.topicPct, color: getScoreColor(t.percent) }}>
                          {t.percent}% ({t.correct}/{t.total})
                        </span>
                      </div>
                      <div style={styles.barTrack}>
                        <div style={{
                          ...styles.barFill,
                          width: `${t.percent}%`,
                          backgroundColor: getScoreColor(t.percent)
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Test history ── */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Test History</h2>
              <div style={styles.historyList}>
                {sessions.map(session => (
                  <div key={session.id} style={styles.historyCard}>
                    <div style={styles.historyLeft}>
                      <div style={{
                        ...styles.scoreCircle,
                        backgroundColor: getScoreColor(session.score_percent)
                      }}>
                        {session.score_percent}%
                      </div>
                      <div>
                        <p style={styles.historyExam}>{session.exams?.name}</p>
                        <p style={styles.historyMeta}>
                          {session.correct_count}/{session.total_count} correct · {formatDate(session.completed_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      style={styles.retakeButton}
                      onClick={() => navigate(`/test/${session.exam_id}`)}
                    >
                      Retake →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

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
  topBar: {
    backgroundColor: colors.navy,
    padding: '14px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    fontFamily: fonts.heading,
    fontSize: '22px',
    color: colors.teal,
    letterSpacing: '2px',
  },
  topBarRight: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
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
  signOutButton: {
    background: 'none',
    border: `1px solid rgba(255,255,255,0.25)`,
    color: colors.gray300,
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: fonts.body,
    cursor: 'pointer',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 32px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  welcomeTitle: {
    fontFamily: fonts.heading,
    fontSize: '40px',
    color: colors.navy,
    letterSpacing: '1px',
  },
  welcomeSub: {
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.gray500,
    marginTop: '4px',
  },
  startButton: {
    padding: '12px 24px',
    backgroundColor: colors.navy,
    color: colors.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: fonts.body,
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
  },
  statCard: {
    backgroundColor: colors.navy,
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: '40px',
    color: colors.teal,
    letterSpacing: '1px',
    lineHeight: '1',
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: '13px',
    color: colors.gray300,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '60px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  emptyIcon: {
    fontSize: '48px',
  },
  emptyTitle: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '20px',
    color: colors.navy,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.gray500,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '17px',
    color: colors.navy,
  },
  topicList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  topicRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  topicMeta: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  topicName: {
    fontFamily: fonts.body,
    fontWeight: '600',
    fontSize: '14px',
    color: colors.navy,
  },
  topicPct: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '14px',
  },
  barTrack: {
    height: '8px',
    backgroundColor: colors.gray100,
    borderRadius: '100px',
    overflow: 'hidden',
  },
  barFill: {
    height: '8px',
    borderRadius: '100px',
    transition: 'width 0.6s ease',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: colors.offWhite,
    borderRadius: '12px',
    gap: '16px',
  },
  historyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  scoreCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '13px',
    color: colors.white,
    flexShrink: 0,
  },
  historyExam: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '15px',
    color: colors.navy,
  },
  historyMeta: {
    fontFamily: fonts.body,
    fontSize: '13px',
    color: colors.gray500,
    marginTop: '2px',
  },
  retakeButton: {
    background: 'none',
    border: `1px solid ${colors.gray300}`,
    color: colors.navy,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: fonts.body,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}

export default Dashboard