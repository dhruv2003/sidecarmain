/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./*.html", "./scripts/*.js", "./sw.js"],
  theme: {
    extend: {
      colors: {
        "primary": "var(--primary)",
        "primary-container": "var(--primary-container)",
        "primary-hover": "var(--primary-hover)",
        "primary-accent": "var(--primary-accent)",
        "on-primary": "#ffffff",
        "surface": "var(--surface)",
        "surface-container": "var(--surface-container)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-card": "var(--surface-card)",
        "surface-card-subtle": "var(--surface-card-subtle)",
        "surface-border": "var(--surface-border)",
        "surface-border-subtle": "var(--surface-border-subtle)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "on-surface-muted": "var(--on-surface-muted)",
        "status-success": "var(--status-success)",
        "status-success-bg": "var(--status-success-bg)",
        "status-warning": "var(--status-warning)",
        "status-warning-bg": "var(--status-warning-bg)",
        "status-error": "var(--status-error)",
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
