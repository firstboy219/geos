import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// Risk severity levels used across crisis / scenario cards.
enum RiskLevel { low, medium, high, critical }

/// A colored status pill conveying a risk level (BAB 7.3 pill, radius 20).
///
/// Color mapping follows the palette semantics:
///   low → success (green), medium → warning (yellow),
///   high → danger (red), critical → purple.
class RiskPill extends StatelessWidget {
  const RiskPill({
    super.key,
    required this.level,
    this.label,
  });

  final RiskLevel level;

  /// Custom label; defaults to a sensible per-level word.
  final String? label;

  /// Maps a free-form backend string to a [RiskLevel] (EN + ID aware).
  static RiskLevel levelFrom(String value) {
    switch (value.toLowerCase().trim()) {
      case 'low':
      case 'rendah':
        return RiskLevel.low;
      case 'medium':
      case 'sedang':
        return RiskLevel.medium;
      case 'high':
      case 'tinggi':
        return RiskLevel.high;
      case 'critical':
      case 'kritis':
        return RiskLevel.critical;
      default:
        return RiskLevel.medium;
    }
  }

  ({Color fg, Color bg, Color border, String text}) get _style {
    switch (level) {
      case RiskLevel.low:
        return (
          fg: AppColors.success,
          bg: AppColors.successDark,
          border: AppColors.successBorder,
          text: label ?? 'Low',
        );
      case RiskLevel.medium:
        return (
          fg: AppColors.warning,
          bg: AppColors.warningDark,
          border: AppColors.warningBorder,
          text: label ?? 'Medium',
        );
      case RiskLevel.high:
        return (
          fg: AppColors.danger,
          bg: AppColors.dangerDark,
          border: AppColors.dangerBorder,
          text: label ?? 'High',
        );
      case RiskLevel.critical:
        return (
          fg: AppColors.purple,
          bg: AppColors.purpleDark,
          border: AppColors.purpleBorder,
          text: label ?? 'Critical',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = _style;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: s.bg,
        borderRadius: BorderRadius.circular(AppRadii.pill),
        border: Border.all(color: s.border, width: AppBorders.hairline),
      ),
      child: Text(
        s.text,
        style: AppTextStyles.caption.copyWith(
          color: s.fg,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
