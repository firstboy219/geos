/** Tailwind (NativeWind) config — Geoscan dark "Bloomberg" palette (BAB 7). */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderRadius: {
        card: "14px",
        cardSm: "12px",
        inner: "10px",
        pill: "20px",
        chip: "8px",
      },
    },
    // ── Chronicle Intel — light editorial theme (mockup_v2) ───────────
    // Added as extra color tokens so the existing dark screens (which use
    // background/surface/accent…) stay untouched. New screens use these
    // Material-3 style names directly via NativeWind classes.
    colors: {
      // keep tailwind essentials
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      // ── existing dark "Bloomberg" tokens (unchanged) ──
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
      // ── Chronicle Intel light palette ──
      canvas: "#fdf8f8", // page background
      "on-background": "#1c1b1b",
      "surface-container-lowest": "#ffffff",
      "surface-container-low": "#f6f3f2",
      "surface-container": "#f0eded",
      "surface-container-high": "#e9e6e5",
      "surface-variant": "#e3e1e0",
      "on-surface": "#1c1b1b",
      "on-surface-variant": "#444652",
      "outline-variant": "#c3c6d6",
      primary: "#001f5b",
      "on-primary": "#ffffff",
      "primary-container": "#003289",
      "on-primary-container": "#809ffb",
      secondary: "#a04100",
      "secondary-container": "#ff8849",
      "success-emerald": "#10b981",
      "warning-amber": "#f59e0b",
      "error-rose": "#f43f5e",
      error: "#e11d48",
    },
    fontFamily: {
      "ws-bold": ["WorkSans_700Bold"],
      "ws-semi": ["WorkSans_600SemiBold"],
      serif: ["SourceSerif4_400Regular"],
      "serif-italic": ["SourceSerif4_400Regular_Italic"],
      inter: ["Inter_400Regular"],
      "inter-medium": ["Inter_500Medium"],
      "inter-semi": ["Inter_600SemiBold"],
      "inter-bold": ["Inter_700Bold"],
      symbol: ["MaterialSymbols_400Regular"],
    },
  },
  plugins: [],
};
