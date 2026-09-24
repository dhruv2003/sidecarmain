/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./*.html", "./scripts/*.js", "./sw.js"],
  theme: {
    extend: {
      colors: {
        "primary": "rgb(var(--primary-rgb) / <alpha-value>)",
        "primary-container": "rgb(var(--primary-container-rgb) / <alpha-value>)",
        "primary-hover": "rgb(var(--primary-hover-rgb) / <alpha-value>)",
        "primary-accent": "rgb(var(--primary-accent-rgb) / <alpha-value>)",
        "on-primary": "#ffffff",
        "surface": "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-container": "rgb(var(--surface-container-rgb) / <alpha-value>)",
        "surface-container-low": "rgb(var(--surface-container-low-rgb) / <alpha-value>)",
        "surface-container-high": "rgb(var(--surface-container-high-rgb) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--surface-container-highest-rgb) / <alpha-value>)",
        "surface-card": "rgb(var(--surface-card-rgb) / <alpha-value>)",
        "surface-card-subtle": "rgb(var(--surface-card-subtle-rgb) / <alpha-value>)",
        "surface-border": "rgb(var(--surface-border-rgb) / <alpha-value>)",
        "surface-border-subtle": "rgb(var(--surface-border-subtle-rgb) / <alpha-value>)",
        "on-surface": "rgb(var(--on-surface-rgb) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--on-surface-variant-rgb) / <alpha-value>)",
        "on-surface-muted": "rgb(var(--on-surface-muted-rgb) / <alpha-value>)",
        "status-success": "rgb(var(--status-success-rgb) / <alpha-value>)",
        "status-success-bg": "rgb(var(--status-success-bg-rgb) / <alpha-value>)",
        "status-warning": "rgb(var(--status-warning-rgb) / <alpha-value>)",
        "status-warning-bg": "rgb(var(--status-warning-bg-rgb) / <alpha-value>)",
        "status-error": "rgb(var(--status-error-rgb) / <alpha-value>)",
        "status-error-bg": "var(--status-error-bg)"
      },
      fontFamily: {
        headline: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" }
    }
  }
}
