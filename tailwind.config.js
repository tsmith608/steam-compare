/** @type {import('tailwindcss').Config} */
// Design tokens live as CSS variables in src/app/globals.css; Tailwind only
// maps names onto them so components and CSS stay in sync.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-raised": "var(--bg-raised)",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        ink: {
          1: "var(--ink-1)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hi: "var(--accent-hi)",
          lo: "var(--accent-lo)",
          wash: "var(--accent-wash)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          hi: "var(--amber-hi)",
          wash: "var(--amber-wash)",
          // keep Tailwind's amber scale for the legacy dashboard
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        discord: "var(--discord)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        p: {
          1: "var(--p1)",
          2: "var(--p2)",
          3: "var(--p3)",
          4: "var(--p4)",
          5: "var(--p5)",
          6: "var(--p6)",
          7: "var(--p7)",
          8: "var(--p8)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Fluid scale: 360px -> 1440px viewports.
        "display-xl": ["clamp(2.5rem, 1.75rem + 3.4vw, 4.75rem)", { lineHeight: "0.96", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.07rem, 1.65rem + 2.1vw, 3.55rem)", { lineHeight: "1", letterSpacing: "-0.018em" }],
        "display-md": ["clamp(1.73rem, 1.46rem + 1.34vw, 2.67rem)", { lineHeight: "1.06", letterSpacing: "-0.015em" }],
        "display-sm": ["clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "body-lg": ["clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", { lineHeight: "1.55" }],
        stat: ["clamp(2.5rem, 1.64rem + 4.29vw, 5.5rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        spring: "var(--ease-spring)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};
