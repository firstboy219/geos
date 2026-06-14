/** Tailwind (NativeWind) config — Geoscan dark "Bloomberg" palette (BAB 7). */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D1117",
        surface: "#161B22",
        surfaceAlt: "#0D1117",
        border: "#30363D",
        borderSubtle: "#21262D",
        textPrimary: "#F0F6FC",
        textSecondary: "#8B949E",
        textMuted: "#6E7681",
        accent: "#4493F8",
        accentDark: "#0D2044",
        accentBorder: "#1F4A8A",
        success: "#3FB950",
        successDark: "#0D2818",
        successBorder: "#1A4D2E",
        warning: "#E3B341",
        warningDark: "#2D1B00",
        warningBorder: "#4A3000",
        danger: "#F85149",
        dangerDark: "#3D1010",
        dangerBorder: "#5C1C1C",
        purple: "#9B59B6",
        purpleDark: "#1A1040",
        purpleBorder: "#5B21B6",
      },
      borderRadius: {
        card: "14px",
        cardSm: "12px",
        inner: "10px",
        pill: "20px",
        chip: "8px",
      },
    },
  },
  plugins: [],
};
