// src/styles/theme.js
// Central design system for TestTube.
// Import this wherever you need colors, fonts, or shared styles.

export const theme = {
  colors: {
    navy: '#0d1b2a',
    navyMid: '#1b2e45',
    navyLight: '#2a4460',
    teal: '#00c2a8',
    tealDark: '#009e88',
    tealLight: '#e0faf6',
    white: '#ffffff',
    offWhite: '#f4f7fb',
    gray100: '#e8edf5',
    gray300: '#c2ccd9',
    gray500: '#7a8a9a',
    gray700: '#3a4a5a',
    success: '#00b87a',
    successLight: '#e0f7ef',
    danger: '#f0455a',
    dangerLight: '#fdedef',
    warning: '#f5a623',
    warningLight: '#fef6e4',
  },
  fonts: {
    heading: "'Bebas Neue', cursive",
    body: "'DM Sans', sans-serif",
  }
}

// Google Fonts — paste this into your public/index.html <head>
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">