import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── Material Design 3 Color Tokens (Stitch) ── */
      colors: {
        primary: "#71522c",
        "on-primary": "#ffffff",
        "primary-container": "#ffddb5",
        "on-primary-container": "#281800",
        "primary-fixed-dim": "#e4bf91",
        "on-primary-fixed-variant": "#573e18",

        secondary: "#6f5d47",
        "on-secondary": "#ffffff",
        "secondary-container": "#fbe0c4",
        "on-secondary-container": "#271909",
        "secondary-fixed": "#fbe0c4",
        "on-secondary-fixed-variant": "#564531",

        tertiary: "#485a6d",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#cde5f5",
        "on-tertiary-container": "#031828",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#410002",

        surface: "#fffbfe",
        "on-surface": "#1b1c19",
        "on-surface-variant": "#4e4639",
        "surface-container": "#f3efe8",
        "surface-container-low": "#f9f5ee",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#ede9e2",
        "surface-container-highest": "#e7e3dc",

        outline: "#81756a",
        "outline-variant": "#d2c4b7",

        /* element accent colors (saju table cells) */
        "saju-wood": "#485a6d",
        "saju-fire": "#ba1a1a",
        "saju-earth": "#71522c",
        "saju-metal": "#d2c4b7",
        "saju-water": "#1b1c19",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
        body: ["Noto Serif KR", "serif"],
        manrope: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
