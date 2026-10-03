// ESLint flat config (Next 16 removed `next lint`; run `npm run lint`).
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "bot/node_modules/**", "marketing/renders/**", "playwright-report/**", "test-results/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Apostrophes and quotes in copy are valid JSX; only flag the characters
      // that are genuinely ambiguous inside JSX text.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
      // Game art and avatars come pre-sized from Steam's CDN; next/image would
      // only spend Vercel image-optimisation quota. Satori (OG images) needs <img>.
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Legacy profile dashboard, kept as-is in the retrofit. Its effects predate
    // the React Compiler rules; refactor before enabling the compiler there.
    files: ["src/app/components/**/*.jsx"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    // Playwright fixtures call a `use()` callback that isn't a React hook.
    files: ["tests/e2e/**/*.mjs"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  {
    // The Discord bot is CommonJS Node code.
    files: ["bot/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
];

export default config;
