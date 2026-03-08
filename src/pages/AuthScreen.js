// src/pages/AuthScreen.js
// Handles both sign up and sign in on one page.
// Toggles between the two modes with a single button.

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { theme } from '../styles/theme'

const { colors, fonts } = theme

function AuthScreen() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function handleSubmit() {
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created! Check your email to confirm, then sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Allow submitting with the Enter key
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={styles.page}>

      {/* Decorative background */}
      <div style={styles.bgTop} />

      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>🧪</span>
          <span style={styles.logoText}>TestTube</span>
        </div>

        <h1 style={styles.title}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={styles.subtitle}>
          {mode === 'signin'
            ? 'Sign in to continue your test prep.'
            : 'Join thousands of students preparing smarter.'}
        </p>

        {/* Error / success messages */}
        {error && <div style={styles.errorBox}>{error}</div>}
        {message && <div style={styles.successBox}>{message}</div>}

        {/* Email input */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Password input */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Submit button */}
        <button
          style={{ ...styles.submitButton, opacity: loading ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : mode === 'signin' ? 'Sign In →' : 'Create Account →'}
        </button>

        {/* Toggle mode */}
        <p style={styles.toggleText}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={styles.toggleButton}
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: colors.offWhite,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50vh',
    backgroundColor: colors.navy,
    zIndex: 0,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontFamily: fonts.heading,
    fontSize: '24px',
    color: colors.teal,
    letterSpacing: '2px',
  },
  title: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '26px',
    color: colors.navy,
    lineHeight: '1.2',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.gray500,
    marginTop: '-8px',
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: fonts.body,
  },
  successBox: {
    backgroundColor: colors.successLight,
    color: colors.success,
    border: `1px solid ${colors.success}`,
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: fonts.body,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: '13px',
    fontWeight: '600',
    color: colors.gray700,
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: `2px solid ${colors.gray100}`,
    fontSize: '15px',
    fontFamily: fonts.body,
    color: colors.navy,
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  submitButton: {
    padding: '14px',
    backgroundColor: colors.navy,
    color: colors.white,
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: fonts.body,
    cursor: 'pointer',
    marginTop: '4px',
  },
  toggleText: {
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.gray500,
    textAlign: 'center',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: colors.teal,
    fontWeight: '700',
    fontSize: '14px',
    fontFamily: fonts.body,
    cursor: 'pointer',
    padding: 0,
  },
}

export default AuthScreen