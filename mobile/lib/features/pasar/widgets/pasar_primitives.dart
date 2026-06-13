import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/asset_model.dart';

/// Small reusable building blocks for the Pasar screen.

/// A tinted "tone" chip: small rounded label colored from a [SignalTone].
class ToneChip extends StatelessWidget {
  const ToneChip({
    super.key,
    required this.label,
    required this.tone,
    this.bold = true,
    this.radius = AppRadii.chip,
  });

  final String label;
  final SignalTone tone;
  final bool bold;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: tone.bg,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: tone.border, width: AppBorders.hairline),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: tone.fg,
          fontWeight: bold ? FontWeight.w500 : FontWeight.w400,
        ),
      ),
    );
  }
}

/// A tappable chip that reveals an explanatory tooltip on tap (mobile-friendly).
class TooltipChip extends StatelessWidget {
  const TooltipChip({
    super.key,
    required this.label,
    required this.tooltip,
    required this.tone,
  });

  final String label;
  final String tooltip;
  final SignalTone tone;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      triggerMode: TooltipTriggerMode.tap,
      preferBelow: false,
      showDuration: const Duration(seconds: 6),
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      padding: AppPadding.inner,
      textStyle: AppTextStyles.caption.copyWith(
        color: AppColors.textPrimary,
        height: 1.5,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF1C2333),
        borderRadius: BorderRadius.circular(AppRadii.chip),
        border: Border.all(color: AppColors.border, width: AppBorders.hairline),
      ),
      child: ToneChip(label: label, tone: tone),
    );
  }
}

/// A small uppercase section sub-heading used inside cards.
class CardLabel extends StatelessWidget {
  const CardLabel(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
    );
  }
}

/// A bold card heading + muted subtitle pair (used atop matrix / heatmap cards).
class CardHeading extends StatelessWidget {
  const CardHeading({super.key, required this.title, this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.bodySm.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w500,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 2),
          Text(
            subtitle!,
            style: AppTextStyles.caption.copyWith(height: 1.4),
          ),
        ],
      ],
    );
  }
}

/// A mini bar sparkline (matches `.spark` in the mockup). [values] are 0..1
/// normalized heights; the trailing bar is tinted by [direction].
class MiniSparkline extends StatelessWidget {
  const MiniSparkline({
    super.key,
    required this.values,
    required this.direction,
    this.height = 22,
    this.barWidth = 4,
  });

  final List<double> values;
  final PriceDirection direction;
  final double height;
  final double barWidth;

  @override
  Widget build(BuildContext context) {
    if (values.isEmpty) return SizedBox(height: height);
    final tint = direction.tone.fg;
    return SizedBox(
      height: height,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (var i = 0; i < values.length; i++) ...[
            if (i > 0) const SizedBox(width: 2),
            Container(
              width: barWidth,
              height: (values[i].clamp(0.0, 1.0)) * height,
              decoration: BoxDecoration(
                // Last bar fully tinted, earlier bars dimmed.
                color: i == values.length - 1
                    ? tint
                    : tint.withOpacity(0.35),
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
