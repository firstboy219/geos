/**
 * Chronicle Intel — light editorial palette (mockup_v2).
 * JS-side mirror of the tailwind tokens, for places that need raw color
 * values (tab bar, StatusBar, native props) instead of NativeWind classes.
 */
export const chronicle = {
  canvas: "#fdf8f8",
  onBackground: "#1c1b1b",
  surfaceLowest: "#ffffff",
  surfaceLow: "#f6f3f2",
  surface: "#f0eded",
  surfaceHigh: "#e9e6e5",
  surfaceVariant: "#e3e1e0",
  onSurface: "#1c1b1b",
  onSurfaceVariant: "#444652",
  outlineVariant: "#c3c6d6",
  primary: "#001f5b",
  onPrimary: "#ffffff",
  primaryContainer: "#003289",
  onPrimaryContainer: "#809ffb",
  secondary: "#a04100",
  secondaryContainer: "#ff8849",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  error: "#e11d48",
} as const;
