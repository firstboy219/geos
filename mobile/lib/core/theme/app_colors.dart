import 'package:flutter/material.dart';

/// Geoscan color palette — Dark Mode (Bloomberg-style).
///
/// Source of truth: project_knowledge_base BAB 7.1.
/// IMMUTABLE — do not change values without design confirmation.
abstract final class AppColors {
  AppColors._();

  // ── Surfaces ──────────────────────────────────────────────
  static const Color background = Color(0xFF0D1117); // Main screen bg
  static const Color surface = Color(0xFF161B22); // Card background
  static const Color surfaceAlt = Color(0xFF0D1117); // Inner card bg
  static const Color border = Color(0xFF30363D); // All borders
  static const Color borderSubtle = Color(0xFF21262D); // Dividers

  // ── Text ──────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFFF0F6FC); // Main text
  static const Color textSecondary = Color(0xFF8B949E); // Sub text
  static const Color textMuted = Color(0xFF6E7681); // Placeholder

  // ── Accent (blue) ─────────────────────────────────────────
  static const Color accent = Color(0xFF4493F8); // Blue — CTA, active
  static const Color accentDark = Color(0xFF0D2044); // Blue dark bg
  static const Color accentBorder = Color(0xFF1F4A8A); // Blue border

  // ── Success (green) ───────────────────────────────────────
  static const Color success = Color(0xFF3FB950); // Green — positive
  static const Color successDark = Color(0xFF0D2818);
  static const Color successBorder = Color(0xFF1A4D2E);

  // ── Warning (yellow) ──────────────────────────────────────
  static const Color warning = Color(0xFFE3B341); // Yellow — medium risk
  static const Color warningDark = Color(0xFF2D1B00);
  static const Color warningBorder = Color(0xFF4A3000);

  // ── Danger (red) ──────────────────────────────────────────
  static const Color danger = Color(0xFFF85149); // Red — high risk/alert
  static const Color dangerDark = Color(0xFF3D1010);
  static const Color dangerBorder = Color(0xFF5C1C1C);

  // ── Purple (nuclear / gray zone) ──────────────────────────
  static const Color purple = Color(0xFF9B59B6);
  static const Color purpleDark = Color(0xFF1A1040);
  static const Color purpleBorder = Color(0xFF5B21B6);
}
