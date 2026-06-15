import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#f7f5f0", // newsprint
        muted: "#6b6b6b",
        rule: "#d8d4cc",
        accent: "#8b0000", // dark red masthead accent
      },
      fontFamily: {
        serif: ["Georgia", "'Times New Roman'", "serif"],
        sans: ["'Helvetica Neue'", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
