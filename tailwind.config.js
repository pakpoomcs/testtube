/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base: "#0e1a2b",
        elevated: "#132030",
        card: "#172639",
        hover: "#1d2f45",
        // Borders
        border: "#1f3347",
        "border-strong": "#2a4460",
        // Text
        "text-primary": "#e8f0f7",
        "text-secondary": "#7a9bb5",
        "text-tertiary": "#3d5a73",
        // Accent
        teal: {
          DEFAULT: "#00c2a8",
          dark: "#009e88",
          light: "rgba(0,194,168,0.12)",
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
