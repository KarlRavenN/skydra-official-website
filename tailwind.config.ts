import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep zinc-950
        foreground: "#fafafa", // Zinc-50
        card: {
          DEFAULT: "#121215",
          foreground: "#fafafa",
          border: "#27272a",
        },
        primary: {
          DEFAULT: "#e11d48", // Vivid underground crimson/rose
          foreground: "#ffffff",
          hover: "#be123c",
        },
        secondary: {
          DEFAULT: "#1e1e24",
          foreground: "#f4f4f5",
          hover: "#27272f",
        },
        accent: {
          DEFAULT: "#f59e0b", // Gold/amber badge highlight
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#1f1f23",
          foreground: "#a1a1aa",
        },
        border: "#27272a",
        input: "#18181b",
        ring: "#e11d48",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "Impact", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
