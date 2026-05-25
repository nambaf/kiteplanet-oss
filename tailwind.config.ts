import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        hand: ["var(--font-patrick)", "system-ui", "sans-serif"],
        scribble: ["var(--font-caveat)", "system-ui", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        warm: "rgb(var(--warm) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        note: "rgb(var(--note) / <alpha-value>)",
        land: "rgb(var(--land) / <alpha-value>)",
        ocean: "rgb(var(--ocean) / <alpha-value>)",
        wind: "rgb(var(--wind) / <alpha-value>)",
        wave: "rgb(var(--wave) / <alpha-value>)",
        storm: "rgb(var(--storm) / <alpha-value>)",
      },
      backgroundColor: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
