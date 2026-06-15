import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        /** OPTI Century Expanded Two (+ fallbacks in globals.css) */
        display: ["var(--font-opti-century)"],
        /** Instrument Sans — loaded via next/font/google as --font-sans-variable */
        sans: ["var(--font-sans-variable)", "Instrument Sans", "system-ui", "sans-serif"],
        /** Cutive — loaded via next/font/google as --font-body-variable */
        body: ["var(--font-body-variable)", "Cutive", "Courier New", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
