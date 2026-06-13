import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Geoscan typography scale.
///
/// Source of truth: project_knowledge_base BAB 7.2.
/// Uses the system font (no custom font bundled).
abstract final class AppTextStyles {
  AppTextStyles._();

  static const TextStyle headline1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const TextStyle headline2 = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static const TextStyle title = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static const TextStyle titleSm = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static const TextStyle body = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodySm = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    color: AppColors.textMuted,
  );

  static const TextStyle label = TextStyle(
    fontSize: 10,
    fontWeight: FontWeight.w500,
    color: AppColors.textMuted,
    letterSpacing: 0.4,
    height: 1.2,
  );

  static const TextStyle mono = TextStyle(
    fontSize: 11,
    fontFamily: 'monospace',
    color: AppColors.textSecondary,
  );

  /// Logo styling. 'GEO' = [AppColors.textPrimary], 'SCAN' = [AppColors.accent].
  static const TextStyle logo = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    letterSpacing: 0.5,
  );
}
