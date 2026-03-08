/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base: "rgb(var(--color-base) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        hover: "rgb(var(--color-hover) / <alpha-value>)",
        // Borders
        border: "rgb(var(--color-border) / <alpha-value>)",
        "border-strong": "rgb(var(--color-border-strong) / <alpha-value>)",
        // Text
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "text-tertiary": "rgb(var(--color-text-tertiary) / <alpha-value>)",
        // Accent
        teal: {
          DEFAULT: "rgb(var(--color-teal) / <alpha-value>)",
          dark: "rgb(var(--color-teal-dark) / <alpha-value>)",
          light: "rgb(var(--color-teal) / 0.14)",
        },
        // Status
        success: "#22c55e",
        "success-bg": "rgba(34,197,94,0.1)",
        danger: "#ef4444",
        "danger-bg": "rgba(239,68,68,0.1)",
        warning: "#f59e0b",
        "warning-bg": "rgba(245,158,11,0.1)",
      },
      fontFamily: {
        heading: ["'Instrument Serif'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "10px",
        sm: "6px",
        lg: "14px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};
