// src/components/NavBar.js
// Shared navigation bar used across all pages.
// Shows the TestTube logo, main nav links, and sign out button.

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { theme } from '../styles/theme'


const { colors, fonts } = theme

function NavBar() {

  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, isAdmin } = useAuth()

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <button style={styles.logo} onClick={() => navigate('/')}>
        🧪 <span style={styles.logoText}>TestTube</span>
      </button>

      {/* Nav links */}
      <div style={styles.links}>
        <button
          style={isActive('/') ? styles.linkActive : styles.link}
          onClick={() => navigate('/')}
        >
          Exams
        </button>
        <button
          style={isActive('/dashboard') ? styles.linkActive : styles.link}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        {isAdmin && (
  <button
    style={isActive('/admin') ? styles.linkActive : styles.linkAdmin}
    onClick={() => navigate('/admin')}
  >
    ⚙️ Admin
  </button>
)}
      </div>

      {/* Right side */}
      <div style={styles.right}>
        <span style={styles.email}>{user?.email}</span>
        <button style={styles.signOutButton} onClick={signOut}>
          Sign out
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: colors.navy,
    padding: '0 32px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  logo: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '20px',
    padding: 0,
  },
  logoText: {
    fontFamily: fonts.heading,
    fontSize: '22px',
    color: colors.teal,
    letterSpacing: '2px',
  },
  links: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  link: {
    background: 'none',
    border: 'none',
    color: colors.gray300,
    fontFamily: fonts.body,
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  linkActive: {
    background: 'rgba(0,194,168,0.15)',
    border: 'none',
    color: colors.teal,
    fontFamily: fonts.body,
    fontSize: '14px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  email: {
    fontFamily: fonts.body,
    fontSize: '13px',
    color: colors.gray500,
    // Hide on small screens
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  signOutButton: {
    background: 'none',
    border: `1px solid rgba(255,255,255,0.2)`,
    color: colors.gray300,
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: fonts.body,
    cursor: 'pointer',
  },
  linkAdmin: {
  background: 'rgba(240,165,0,0.15)',
  border: 'none',
  color: colors.warning,
  fontFamily: fonts.body,
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 14px',
  borderRadius: '8px',
  cursor: 'pointer',
},

}

export default NavBar