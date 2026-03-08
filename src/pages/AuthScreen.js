// src/pages/AuthScreen.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { theme } from '../styles/theme'

const { colors, fonts } = theme

function AuthScreen() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [animating, setAnimating] = useState(false)

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

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  function switchMode(newMode) {
    if (newMode === mode || animating) return
    setAnimating(true)
    setError(null)
    setMessage(null)
    // Brief delay so the fade-out is visible before content changes
    setTimeout(() => {
      setMode(newMode)
      setAnimating(false)
    }, 200)
  }

  const isSignIn = mode === 'signin'

  return (
    <div style={styles.page}>
      <div style={styles.bgTop} />

      <div style={styles.card}>

        {/* ── Mode switcher tabs ── */}
        <div style={styles.tabSwitcher}>
          <button
            style={isSignIn ? styles.tabActive : styles.tabInactive}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            style={!isSignIn ? styles.tabActive : styles.tabInactive}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* ── Animated content area ── */}
        <div style={{
          ...styles.formContent,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(6px)' : 'translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}>

          {/* Logo */}
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>🧪</span>
            <span style={styles.logoText}>TestTube</span>
          </div>

          <h1 style={styles.title}>
            {isSignIn ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={styles.subtitle}>
            {isSignIn
              ? 'Sign in to continue your test prep.'
              : 'Join students preparing smarter across Thailand.'}
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}
          {message && <div style={styles.successBox}>{message}</div>}

          {/* Email */}
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

          {/* Password with toggle */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                style={styles.passwordInput}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Sign up extras */}
          {!isSignIn && (
            <p style={styles.termsText}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          )}

          {/* Submit */}
          <button
            style={{ ...styles.submitButton, opacity: loading ? 0.6 : 1,
              backgroundColor: isSignIn ? colors.navy : colors.teal
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignIn ? 'Sign In →' : 'Create Account →'}
          </button>

          {/* Bottom toggle */}
          <p style={styles.toggleText}>
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <button
              style={styles.toggleButton}
              onClick={() => switchMode(isSignIn ? 'signup' : 'signin')}
            >
              {isSignIn ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

        </div>
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
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  tabSwitcher: {
    display: 'flex',
    borderBottom: `1px solid ${colors.gray100}`,
  },
  tabActive: {
    flex: 1,
    padding: '16px',
    border: 'none',
    borderBottom: `3px solid ${colors.teal}`,
    backgroundColor: colors.white,
    color: colors.navy,
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },
  tabInactive: {
    flex: 1,
    padding: '16px',
    border: 'none',
    borderBottom: `3px solid transparent`,
    backgroundColor: colors.offWhite,
    color: colors.gray500,
    fontFamily: fonts.body,
    fontWeight: '500',
    fontSize: '15px',
    cursor: 'pointer',
  },
  formContent: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '22px',
  },
  logoText: {
    fontFamily: fonts.heading,
    fontSize: '22px',
    color: colors.teal,
    letterSpacing: '2px',
  },
  title: {
    fontFamily: fonts.body,
    fontWeight: '700',
    fontSize: '24px',
    color: colors.navy,
    lineHeight: '1.2',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: '14px',
    color: colors.gray500,
    marginTop: '-8px',
    lineHeight: '1.5',
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
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    padding: '12px 44px 12px 14px',
    borderRadius: '10px',
    border: `2px solid ${colors.gray100}`,
    fontSize: '15px',
    fontFamily: fonts.body,
    color: colors.navy,
    outline: 'none',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    fontFamily: fonts.body,
    fontSize: '12px',
    color: colors.gray500,
    lineHeight: '1.5',
    marginTop: '-4px',
  },
  submitButton: {
    padding: '14px',
    color: colors.white,
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: fonts.body,
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'background-color 0.2s ease',
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